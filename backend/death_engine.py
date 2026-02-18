"""
DEADPOOL — Death Detection Engine
==================================
Backend service that:
1. Fetches pump.fun tokens from Moralis API
2. Calculates health scores based on volume, liquidity, age, holder data
3. Classifies tokens into: ALIVE / FADING / DYING / DEAD / ZOMBIE
4. Stores results in SQLite
5. Serves data via Flask REST API

Setup:
  pip install flask flask-cors requests
  
  Set environment variable:
  export MORALIS_API_KEY="your_moralis_api_key_here"

Run:
  python death_engine.py

Endpoints:
  GET /api/stats              - Overall statistics
  GET /api/deaths             - Recent dead/zombie tokens
  GET /api/zombies            - Zombie Index (ranked)
  GET /api/token/<address>    - Health check for specific token
  GET /api/health             - API health check
"""

import os
import time
import json
import sqlite3
import hashlib
import logging
import threading
from datetime import datetime, timedelta, timezone
from typing import Optional

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

# ============================================================
# CONFIG
# ============================================================
MORALIS_API_KEY = os.environ.get("MORALIS_API_KEY", "YOUR_MORALIS_API_KEY")
MORALIS_BASE = "https://solana-gateway.moralis.io"
DB_PATH = "deadpool.db"
SCAN_INTERVAL_SECONDS = 900  # 15 minutes
LOG_LEVEL = logging.INFO

logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("deadpool")

# ============================================================
# DATABASE
# ============================================================
def init_db():
    """Initialize SQLite database with schema."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS tokens (
            address TEXT PRIMARY KEY,
            name TEXT,
            symbol TEXT,
            logo TEXT,
            created_at TEXT,
            first_seen TEXT DEFAULT (datetime('now')),
            last_updated TEXT DEFAULT (datetime('now')),
            
            -- Market data
            price_usd REAL DEFAULT 0,
            price_native REAL DEFAULT 0,
            liquidity_usd REAL DEFAULT 0,
            fully_diluted_value REAL DEFAULT 0,
            volume_24h REAL DEFAULT 0,
            
            -- Health signals
            health_score INTEGER DEFAULT 50,
            status TEXT DEFAULT 'UNKNOWN',
            death_cause TEXT,
            
            -- Holder data
            holder_count INTEGER DEFAULT 0,
            peak_mcap REAL DEFAULT 0,
            
            -- Creator data
            creator_address TEXT,
            creator_last_active TEXT,
            creator_active INTEGER DEFAULT 1,
            
            -- Zombie data
            zombie_score INTEGER DEFAULT 0,
            died_at TEXT,
            days_dead INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scanned_at TEXT DEFAULT (datetime('now')),
            tokens_scanned INTEGER DEFAULT 0,
            deaths_found INTEGER DEFAULT 0,
            zombies_found INTEGER DEFAULT 0
        );
        
        CREATE INDEX IF NOT EXISTS idx_status ON tokens(status);
        CREATE INDEX IF NOT EXISTS idx_zombie_score ON tokens(zombie_score DESC);
        CREATE INDEX IF NOT EXISTS idx_health_score ON tokens(health_score);
        CREATE INDEX IF NOT EXISTS idx_died_at ON tokens(died_at);

        -- CTO Marketplace tables
        CREATE TABLE IF NOT EXISTS cto_proposals (
            id TEXT PRIMARY KEY,
            token_address TEXT NOT NULL,
            token_name TEXT,
            token_symbol TEXT,
            team_name TEXT NOT NULL,
            team_contact TEXT,
            revival_plan TEXT NOT NULL,
            strategy TEXT DEFAULT 'community',
            timeline TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            votes_for INTEGER DEFAULT 0,
            votes_against INTEGER DEFAULT 0,
            vote_deadline TEXT
        );

        CREATE TABLE IF NOT EXISTS cto_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            proposal_id TEXT NOT NULL,
            wallet_address TEXT NOT NULL,
            vote TEXT NOT NULL,
            voted_at TEXT DEFAULT (datetime('now')),
            UNIQUE(proposal_id, wallet_address),
            FOREIGN KEY (proposal_id) REFERENCES cto_proposals(id)
        );

        CREATE INDEX IF NOT EXISTS idx_cto_status ON cto_proposals(status);
        CREATE INDEX IF NOT EXISTS idx_cto_token ON cto_proposals(token_address);
        CREATE INDEX IF NOT EXISTS idx_votes_proposal ON cto_votes(proposal_id);
    """)
    conn.commit()
    conn.close()
    logger.info("Database initialized")


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ============================================================
# MORALIS API CLIENT
# ============================================================
class MoralisClient:
    """Client for Moralis Solana API."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "accept": "application/json",
            "X-API-Key": api_key,
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def get_new_pumpfun_tokens(self, limit: int = 100) -> list:
        """Fetch recently created pump.fun tokens."""
        url = f"{MORALIS_BASE}/token/mainnet/exchange/pumpfun/new"
        params = {"limit": limit}
        try:
            resp = self.session.get(url, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            return data.get("result", [])
        except Exception as e:
            logger.error(f"Failed to fetch new tokens: {e}")
            return []
    
    def get_token_price(self, address: str) -> Optional[dict]:
        """Fetch current price for a token."""
        url = f"{MORALIS_BASE}/token/mainnet/{address}/price"
        try:
            resp = self.session.get(url, timeout=10)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch price for {address}: {e}")
            return None
    
    def get_token_metadata(self, address: str) -> Optional[dict]:
        """Fetch token metadata."""
        url = f"{MORALIS_BASE}/token/mainnet/{address}/metadata"
        try:
            resp = self.session.get(url, timeout=10)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch metadata for {address}: {e}")
            return None
    
    def get_token_pairs(self, address: str) -> Optional[dict]:
        """Fetch token pair/liquidity data."""
        url = f"{MORALIS_BASE}/token/mainnet/{address}/pairs"
        try:
            resp = self.session.get(url, timeout=10)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch pairs for {address}: {e}")
            return None


# ============================================================
# HEALTH SCORING ENGINE
# ============================================================
class HealthScorer:
    """
    Calculates health scores and classifies tokens.
    
    Health Score (0-100):
    - Volume component (0-30): Based on 24h volume relative to FDV
    - Liquidity component (0-25): Based on available liquidity
    - Activity component (0-25): Based on creator activity and age
    - Holder component (0-20): Based on holder count and trend
    
    Status Classification:
    - ALIVE (80-100): Active trading, healthy metrics
    - FADING (50-79): Declining but still active
    - DYING (20-49): Near-death, minimal activity
    - DEAD (0-19): No activity, confirmed dead
    - ZOMBIE: Dead by score but has residual holders/liquidity worth noting
    """
    
    @staticmethod
    def calculate_health(token_data: dict) -> dict:
        """Calculate health score and status for a token."""
        
        price = float(token_data.get("price_usd", 0) or 0)
        volume = float(token_data.get("volume_24h", 0) or 0)
        liquidity = float(token_data.get("liquidity_usd", 0) or 0)
        fdv = float(token_data.get("fully_diluted_value", 0) or 0)
        holders = int(token_data.get("holder_count", 0) or 0)
        creator_active = bool(token_data.get("creator_active", True))
        
        # Calculate age in days
        created = token_data.get("created_at")
        age_days = 0
        if created:
            try:
                created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                age_days = (datetime.now(timezone.utc) - created_dt).days
            except (ValueError, TypeError):
                age_days = 0
        
        # --- Volume Score (0-30) ---
        volume_score = 0
        if fdv > 0 and volume > 0:
            vol_ratio = volume / fdv
            if vol_ratio > 0.5:
                volume_score = 30
            elif vol_ratio > 0.1:
                volume_score = 22
            elif vol_ratio > 0.01:
                volume_score = 15
            elif vol_ratio > 0.001:
                volume_score = 8
            else:
                volume_score = 2
        elif volume > 100:
            volume_score = 10
        elif volume > 0:
            volume_score = 3
        
        # --- Liquidity Score (0-25) ---
        liquidity_score = 0
        if liquidity > 50000:
            liquidity_score = 25
        elif liquidity > 10000:
            liquidity_score = 20
        elif liquidity > 1000:
            liquidity_score = 14
        elif liquidity > 100:
            liquidity_score = 8
        elif liquidity > 0:
            liquidity_score = 3
        
        # --- Activity Score (0-25) ---
        # Activity only counts if there's ANY market signal (volume, liquidity, or holders)
        has_market_signal = volume > 0 or liquidity > 100 or holders > 5
        activity_score = 0
        if has_market_signal:
            if creator_active:
                activity_score += 15
            if age_days <= 1:
                activity_score += 10
            elif age_days <= 7:
                activity_score += 7
            elif age_days <= 30:
                activity_score += 3

        # --- Holder Score (0-20) ---
        holder_score = 0
        if holders > 5000:
            holder_score = 20
        elif holders > 1000:
            holder_score = 16
        elif holders > 500:
            holder_score = 12
        elif holders > 100:
            holder_score = 8
        elif holders > 10:
            holder_score = 4
        elif holders > 0:
            holder_score = 1
        
        # --- Total Health Score ---
        health_score = min(100, volume_score + liquidity_score + activity_score + holder_score)
        
        # --- Status Classification ---
        if health_score >= 80:
            status = "ALIVE"
        elif health_score >= 50:
            status = "FADING"
        elif health_score >= 20:
            status = "DYING"
        else:
            status = "DEAD"
        
        # --- Zombie Detection ---
        # A token is a ZOMBIE if it's technically DEAD but has significant residual value
        zombie_score = 0
        if status == "DEAD":
            # Zombie score based on remaining signs of life
            if holders > 100:
                zombie_score += min(40, holders // 25)
            if liquidity > 50:
                zombie_score += min(30, int(liquidity / 100))
            if fdv > 1000:
                zombie_score += min(20, int(fdv / 500))
            # Bonus for tokens that had a real peak
            peak_mcap = float(token_data.get("peak_mcap", 0) or 0)
            if peak_mcap > 50000:
                zombie_score += 10
            
            zombie_score = min(100, zombie_score)
            
            if zombie_score > 30:
                status = "ZOMBIE"
        
        # --- Death Cause ---
        death_cause = None
        if status in ("DEAD", "ZOMBIE"):
            if volume == 0 and liquidity == 0:
                death_cause = "Complete liquidity drain"
            elif not creator_active and volume < 10:
                death_cause = "Creator inactive, zero volume"
            elif volume == 0:
                death_cause = f"Zero volume for 48h+"
            elif not creator_active:
                death_cause = "Creator wallet inactive 14d+"
            else:
                death_cause = "Below minimum viability threshold"
        
        return {
            "health_score": health_score,
            "status": status,
            "zombie_score": zombie_score,
            "death_cause": death_cause,
            "components": {
                "volume": volume_score,
                "liquidity": liquidity_score,
                "activity": activity_score,
                "holders": holder_score,
            }
        }


# ============================================================
# SCANNER — Fetches and processes tokens
# ============================================================
class TokenScanner:
    """Scans pump.fun tokens and updates the database."""
    
    def __init__(self, client: MoralisClient):
        self.client = client
        self.scorer = HealthScorer()
    
    def scan_new_tokens(self, limit: int = 100):
        """Fetch and process new pump.fun tokens."""
        logger.info(f"Scanning {limit} new pump.fun tokens...")
        tokens = self.client.get_new_pumpfun_tokens(limit=limit)
        
        if not tokens:
            logger.warning("No tokens returned from API")
            return 0, 0, 0
        
        conn = get_db()
        scanned = 0
        deaths = 0
        zombies = 0
        
        for token in tokens:
            try:
                address = token.get("tokenAddress", "")
                if not address:
                    continue
                
                # Extract base data from new tokens endpoint
                price_usd = float(token.get("priceUsd") or token.get("usdPrice") or 0)
                liquidity = float(token.get("liquidity") or token.get("liquidityUsd") or 0)
                fdv = float(token.get("fullyDilutedValuation") or 0)

                # Try to enrich with price endpoint for volume data (rate-limited)
                volume_24h = 0
                if scanned < 20:  # Only enrich first 20 to stay within rate limits
                    price_info = self.client.get_token_price(address)
                    if price_info:
                        price_usd = float(price_info.get("usdPrice", 0) or price_usd)
                        volume_24h = float(price_info.get("24hrVolume", 0) or 0)

                token_data = {
                    "address": address,
                    "name": token.get("name", "Unknown"),
                    "symbol": token.get("symbol", "???"),
                    "logo": token.get("logo") or token.get("image"),
                    "created_at": token.get("createdAt"),
                    "price_usd": price_usd,
                    "price_native": float(token.get("priceNative", 0) or 0),
                    "liquidity_usd": liquidity,
                    "fully_diluted_value": fdv,
                    "volume_24h": volume_24h,
                    "holder_count": int(token.get("holders", 0) or 0),
                    "creator_active": price_usd > 0 or volume_24h > 0,
                    "peak_mcap": fdv,
                }

                # Calculate health
                health = self.scorer.calculate_health(token_data)
                token_data.update(health)
                
                # Upsert into database
                conn.execute("""
                    INSERT INTO tokens (
                        address, name, symbol, logo, created_at,
                        price_usd, price_native, liquidity_usd, fully_diluted_value,
                        health_score, status, zombie_score, death_cause,
                        peak_mcap, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(address) DO UPDATE SET
                        price_usd = excluded.price_usd,
                        price_native = excluded.price_native,
                        liquidity_usd = excluded.liquidity_usd,
                        fully_diluted_value = excluded.fully_diluted_value,
                        health_score = excluded.health_score,
                        status = excluded.status,
                        zombie_score = excluded.zombie_score,
                        death_cause = excluded.death_cause,
                        peak_mcap = MAX(tokens.peak_mcap, excluded.peak_mcap),
                        last_updated = datetime('now'),
                        died_at = CASE 
                            WHEN tokens.status NOT IN ('DEAD', 'ZOMBIE') AND excluded.status IN ('DEAD', 'ZOMBIE')
                            THEN datetime('now')
                            ELSE tokens.died_at
                        END
                """, (
                    address, token_data["name"], token_data["symbol"], token_data["logo"],
                    token_data["created_at"], token_data["price_usd"], token_data["price_native"],
                    token_data["liquidity_usd"], token_data["fully_diluted_value"],
                    health["health_score"], health["status"], health["zombie_score"],
                    health["death_cause"], token_data["peak_mcap"]
                ))
                
                scanned += 1
                if health["status"] == "DEAD":
                    deaths += 1
                elif health["status"] == "ZOMBIE":
                    zombies += 1
                    
            except Exception as e:
                logger.error(f"Error processing token {token.get('tokenAddress', '?')}: {e}")
                continue
        
        # Log scan result
        conn.execute(
            "INSERT INTO scan_history (tokens_scanned, deaths_found, zombies_found) VALUES (?, ?, ?)",
            (scanned, deaths, zombies)
        )
        conn.commit()
        conn.close()
        
        logger.info(f"Scan complete: {scanned} tokens, {deaths} deaths, {zombies} zombies")
        return scanned, deaths, zombies
    
    def check_single_token(self, address: str) -> Optional[dict]:
        """Check health of a specific token."""
        # Try to get price data
        price_data = self.client.get_token_price(address)
        metadata = self.client.get_token_metadata(address)
        
        if not metadata:
            return None
        
        token_data = {
            "address": address,
            "name": metadata.get("name", "Unknown"),
            "symbol": metadata.get("symbol", "???"),
            "logo": metadata.get("logo"),
            "created_at": None,
            "price_usd": float(price_data.get("usdPrice", 0)) if price_data else 0,
            "price_native": 0,
            "liquidity_usd": 0,
            "fully_diluted_value": float(metadata.get("fullyDilutedValue", 0) or 0),
            "volume_24h": 0,
            "holder_count": 0,
            "creator_active": True,
            "peak_mcap": 0,
        }
        
        health = self.scorer.calculate_health(token_data)
        token_data.update(health)
        
        return token_data


# ============================================================
# BACKGROUND SCANNER THREAD
# ============================================================
def scanner_loop(scanner: TokenScanner):
    """Background thread that scans tokens periodically."""
    while True:
        try:
            scanner.scan_new_tokens(limit=100)
        except Exception as e:
            logger.error(f"Scanner loop error: {e}")
        time.sleep(SCAN_INTERVAL_SECONDS)


# ============================================================
# FLASK API
# ============================================================
app = Flask(__name__)
CORS(app)  # Allow frontend to call API

# Initialize database + services
init_db()
moralis = MoralisClient(MORALIS_API_KEY)
scanner = TokenScanner(moralis)

# Start background scanner thread (works under gunicorn too)
_scanner_thread = threading.Thread(target=scanner_loop, args=(scanner,), daemon=True)
_scanner_thread.start()
logger.info("Background scanner started")


@app.route("/api/health", methods=["GET"])
def api_health():
    """API health check."""
    return jsonify({"status": "ok", "service": "deadpool-engine", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.route("/api/stats", methods=["GET"])
def api_stats():
    """Get overall statistics."""
    conn = get_db()
    
    total = conn.execute("SELECT COUNT(*) FROM tokens").fetchone()[0]
    dead = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'DEAD'").fetchone()[0]
    zombie = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'ZOMBIE'").fetchone()[0]
    alive = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'ALIVE'").fetchone()[0]
    fading = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'FADING'").fetchone()[0]
    dying = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'DYING'").fetchone()[0]
    
    # Deaths in last 24h
    deaths_24h = conn.execute(
        "SELECT COUNT(*) FROM tokens WHERE status IN ('DEAD', 'ZOMBIE') AND died_at > datetime('now', '-1 day')"
    ).fetchone()[0]
    
    # Total holder count across dead tokens
    stranded_holders = conn.execute(
        "SELECT COALESCE(SUM(holder_count), 0) FROM tokens WHERE status IN ('DEAD', 'ZOMBIE')"
    ).fetchone()[0]
    
    # Last scan info
    last_scan = conn.execute(
        "SELECT * FROM scan_history ORDER BY id DESC LIMIT 1"
    ).fetchone()
    
    conn.close()
    
    return jsonify({
        "tokens_scanned": total,
        "deaths_today": deaths_24h,
        "zombies_detected": zombie,
        "alive": alive,
        "fading": fading,
        "dying": dying,
        "dead": dead,
        "total_holders_stranded": stranded_holders,
        "last_scan": dict(last_scan) if last_scan else None,
    })


@app.route("/api/metrics", methods=["GET"])
def api_metrics():
    """Extended metrics for the public metrics page."""
    conn = get_db()

    total = conn.execute("SELECT COUNT(*) FROM tokens").fetchone()[0]
    dead = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'DEAD'").fetchone()[0]
    zombie = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'ZOMBIE'").fetchone()[0]
    alive = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'ALIVE'").fetchone()[0]
    fading = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'FADING'").fetchone()[0]
    dying = conn.execute("SELECT COUNT(*) FROM tokens WHERE status = 'DYING'").fetchone()[0]

    deaths_24h = conn.execute(
        "SELECT COUNT(*) FROM tokens WHERE status IN ('DEAD', 'ZOMBIE') AND died_at > datetime('now', '-1 day')"
    ).fetchone()[0]

    stranded_holders = conn.execute(
        "SELECT COALESCE(SUM(holder_count), 0) FROM tokens WHERE status IN ('DEAD', 'ZOMBIE')"
    ).fetchone()[0]

    total_scans = conn.execute("SELECT COUNT(*) FROM scan_history").fetchone()[0]

    last_scan = conn.execute(
        "SELECT scanned_at FROM scan_history ORDER BY id DESC LIMIT 1"
    ).fetchone()

    # CTO stats
    total_proposals = conn.execute("SELECT COUNT(*) FROM cto_proposals").fetchone()[0]
    active_proposals = conn.execute("SELECT COUNT(*) FROM cto_proposals WHERE status = 'active'").fetchone()[0]
    completed_ctos = conn.execute("SELECT COUNT(*) FROM cto_proposals WHERE status = 'completed'").fetchone()[0]
    total_votes = conn.execute("SELECT COUNT(*) FROM cto_votes").fetchone()[0]

    conn.close()

    return jsonify({
        "tokens_scanned": total,
        "deaths_detected": dead + zombie,
        "deaths_24h": deaths_24h,
        "zombies_indexed": zombie,
        "alive_tokens": alive,
        "fading_tokens": fading,
        "dying_tokens": dying,
        "dead_tokens": dead,
        "stranded_holders": stranded_holders,
        "total_scan_runs": total_scans,
        "last_scan_at": last_scan[0] if last_scan else None,
        "cto_proposals": total_proposals,
        "cto_active": active_proposals,
        "cto_completed": completed_ctos,
        "total_votes_cast": total_votes,
    })


@app.route("/api/deaths", methods=["GET"])
def api_deaths():
    """Get tokens by status. 'ALL' returns all tokens, not just dead/zombie."""
    limit = min(int(request.args.get("limit", 50)), 200)
    status_filter = request.args.get("status", "ALL").upper()

    conn = get_db()

    valid_statuses = ("DEAD", "ZOMBIE", "DYING", "FADING", "ALIVE")
    if status_filter == "ALL":
        rows = conn.execute(
            "SELECT * FROM tokens ORDER BY last_updated DESC, health_score ASC LIMIT ?",
            (limit,)
        ).fetchall()
    elif status_filter in valid_statuses:
        rows = conn.execute(
            "SELECT * FROM tokens WHERE status = ? ORDER BY last_updated DESC LIMIT ?",
            (status_filter, limit)
        ).fetchall()
    else:
        rows = []
    
    conn.close()
    return jsonify({"tokens": [dict(r) for r in rows], "count": len(rows)})


@app.route("/api/zombies", methods=["GET"])
def api_zombies():
    """Get Zombie Index — ranked dead tokens by revival potential."""
    limit = min(int(request.args.get("limit", 50)), 200)
    sort = request.args.get("sort", "zombie_score")
    
    valid_sorts = {"zombie_score": "zombie_score DESC", "holders": "holder_count DESC", "liquidity": "liquidity_usd DESC", "peak_mcap": "peak_mcap DESC"}
    order = valid_sorts.get(sort, "zombie_score DESC")
    
    conn = get_db()
    rows = conn.execute(
        f"SELECT * FROM tokens WHERE status = 'ZOMBIE' OR (status = 'DEAD' AND zombie_score > 30) ORDER BY {order} LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    
    return jsonify({"zombies": [dict(r) for r in rows], "count": len(rows)})


@app.route("/api/token/<address>", methods=["GET"])
def api_token(address: str):
    """Health check for a specific token."""
    # First check database
    conn = get_db()
    row = conn.execute("SELECT * FROM tokens WHERE address = ?", (address,)).fetchone()
    conn.close()
    
    if row:
        return jsonify({"source": "cache", "token": dict(row)})
    
    # If not in DB, do a live check
    result = scanner.check_single_token(address)
    if result:
        return jsonify({"source": "live", "token": result})
    
    return jsonify({"error": "Token not found or API error"}), 404


@app.route("/api/scan", methods=["POST"])
def api_trigger_scan():
    """Manually trigger a scan (for development)."""
    scanned, deaths, zombies = scanner.scan_new_tokens(limit=100)
    return jsonify({"scanned": scanned, "deaths": deaths, "zombies": zombies})


# ============================================================
# CTO MARKETPLACE API
# ============================================================
@app.route("/api/cto/proposals", methods=["GET"])
def api_cto_list():
    """List CTO proposals with optional status filter."""
    status_filter = request.args.get("status", "all").lower()
    limit = min(int(request.args.get("limit", 50)), 200)

    conn = get_db()
    if status_filter == "all":
        rows = conn.execute(
            "SELECT * FROM cto_proposals ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    elif status_filter in ("active", "approved", "rejected", "completed"):
        rows = conn.execute(
            "SELECT * FROM cto_proposals WHERE status = ? ORDER BY created_at DESC LIMIT ?",
            (status_filter, limit),
        ).fetchall()
    else:
        rows = []
    conn.close()
    return jsonify({"proposals": [dict(r) for r in rows], "count": len(rows)})


@app.route("/api/cto/proposals/<proposal_id>", methods=["GET"])
def api_cto_detail(proposal_id: str):
    """Get a single CTO proposal with vote tallies."""
    conn = get_db()
    row = conn.execute("SELECT * FROM cto_proposals WHERE id = ?", (proposal_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Proposal not found"}), 404

    votes = conn.execute(
        "SELECT vote, COUNT(*) as cnt FROM cto_votes WHERE proposal_id = ? GROUP BY vote",
        (proposal_id,),
    ).fetchall()
    conn.close()

    vote_map = {v["vote"]: v["cnt"] for v in votes}
    proposal = dict(row)
    proposal["votes_for"] = vote_map.get("for", 0)
    proposal["votes_against"] = vote_map.get("against", 0)
    return jsonify({"proposal": proposal})


@app.route("/api/cto/propose", methods=["POST"])
def api_cto_propose():
    """Submit a new CTO proposal."""
    data = request.get_json(silent=True) or {}

    required = ["token_address", "team_name", "revival_plan"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    proposal_id = hashlib.sha256(
        f"{data['token_address']}-{data['team_name']}-{time.time()}".encode()
    ).hexdigest()[:12]

    # Look up token info from DB if available
    conn = get_db()
    token_row = conn.execute(
        "SELECT name, symbol FROM tokens WHERE address = ?", (data["token_address"],)
    ).fetchone()

    token_name = data.get("token_name") or (token_row["name"] if token_row else "Unknown")
    token_symbol = data.get("token_symbol") or (token_row["symbol"] if token_row else "???")

    # Default vote deadline: 7 days from now
    vote_deadline = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    conn.execute(
        """INSERT INTO cto_proposals
           (id, token_address, token_name, token_symbol, team_name, team_contact,
            revival_plan, strategy, timeline, vote_deadline)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            proposal_id,
            data["token_address"],
            token_name,
            token_symbol,
            data["team_name"],
            data.get("team_contact", ""),
            data["revival_plan"],
            data.get("strategy", "community"),
            data.get("timeline", "2 weeks"),
            vote_deadline,
        ),
    )
    conn.commit()
    conn.close()

    logger.info(f"New CTO proposal: {proposal_id} for {data['token_address']}")
    return jsonify({"id": proposal_id, "status": "active"}), 201


@app.route("/api/cto/vote", methods=["POST"])
def api_cto_vote():
    """Cast a vote on a CTO proposal."""
    data = request.get_json(silent=True) or {}

    required = ["proposal_id", "wallet_address", "vote"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    vote_value = data["vote"].lower()
    if vote_value not in ("for", "against"):
        return jsonify({"error": "Vote must be 'for' or 'against'"}), 400

    conn = get_db()

    # Verify proposal exists and is active
    proposal = conn.execute(
        "SELECT * FROM cto_proposals WHERE id = ?", (data["proposal_id"],)
    ).fetchone()
    if not proposal:
        conn.close()
        return jsonify({"error": "Proposal not found"}), 404
    if proposal["status"] != "active":
        conn.close()
        return jsonify({"error": "Voting is closed on this proposal"}), 400

    try:
        conn.execute(
            "INSERT INTO cto_votes (proposal_id, wallet_address, vote) VALUES (?, ?, ?)",
            (data["proposal_id"], data["wallet_address"], vote_value),
        )
        # Update cached tallies on the proposal
        conn.execute(
            f"UPDATE cto_proposals SET votes_{vote_value} = votes_{vote_value} + 1, updated_at = datetime('now') WHERE id = ?",
            (data["proposal_id"],),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Already voted on this proposal"}), 409

    conn.close()
    return jsonify({"status": "voted", "vote": vote_value})


# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"DEADPOOL Engine starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
