"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProposals,
  submitProposal,
  castVote,
  type Proposal,
} from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { MagCard } from "@/components/mag-card";
import clsx from "clsx";

const STATUS_FILTERS = ["all", "active", "approved", "completed"] as const;

const STRATEGY_OPTIONS = [
  { key: "community", label: "Community CTO" },
  { key: "team", label: "New Team" },
  { key: "rebrand", label: "Rebrand" },
];

export default function CTOPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"browse" | "propose">("browse");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Proposals list ──
  const { data: proposals = [], isPending } = useQuery({
    queryKey: ["proposals", statusFilter],
    queryFn: () => getProposals(statusFilter),
  });

  // ── Propose form state ──
  const [form, setForm] = useState({
    token_address: "",
    team_name: "",
    team_contact: "",
    revival_plan: "",
    strategy: "community",
    timeline: "2 weeks",
  });
  const [submitted, setSubmitted] = useState(false);

  const proposeMutation = useMutation({
    mutationFn: submitProposal,
    onSuccess: () => {
      setSubmitted(true);
      setForm({
        token_address: "",
        team_name: "",
        team_contact: "",
        revival_plan: "",
        strategy: "community",
        timeline: "2 weeks",
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  // ── Vote handler ──
  const voteMutation = useMutation({
    mutationFn: (vars: { proposalId: string; vote: "for" | "against" }) =>
      castVote(vars.proposalId, "anonymous", vars.vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const handleSubmit = () => {
    if (!form.token_address || !form.team_name || !form.revival_plan) return;
    proposeMutation.mutate(form);
  };

  return (
    <div className="max-w-[900px] mx-auto px-[clamp(20px,5vw,48px)] pt-[100px] pb-[60px]">
      {/* Header */}
      <Reveal>
        <div className="mb-10">
          <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
            Community takeovers
          </div>
          <h2 className="text-[32px] font-bold text-white font-display tracking-[-0.02em]">
            CTO Marketplace
          </h2>
          <p className="text-[15px] text-white/35 font-body mt-2 max-w-[520px]">
            Claim dead tokens, submit your revival plan, and let holders vote on
            the resurrection.
          </p>
        </div>
      </Reveal>

      {/* Tabs */}
      <Reveal delay={0.1}>
        <div className="flex gap-1.5 mb-8">
          <button
            onClick={() => { setTab("browse"); setSubmitted(false); }}
            className={clsx(
              "px-5 py-2 rounded-lg text-sm font-semibold font-body transition-all border",
              tab === "browse"
                ? "bg-white/[0.08] text-white border-white/[0.15]"
                : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60"
            )}
          >
            Browse Proposals
          </button>
          <button
            onClick={() => { setTab("propose"); setSubmitted(false); }}
            className={clsx(
              "px-5 py-2 rounded-lg text-sm font-semibold font-body transition-all border",
              tab === "propose"
                ? "bg-cyan/20 text-cyan border-cyan/30"
                : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60"
            )}
          >
            + Submit Proposal
          </button>
        </div>
      </Reveal>

      {/* ── Browse Tab ── */}
      {tab === "browse" && (
        <>
          <Reveal delay={0.15}>
            <div className="flex gap-1.5 mb-6">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold font-body transition-all border capitalize",
                    statusFilter === f
                      ? "bg-white/[0.08] text-white border-white/[0.15]"
                      : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60"
                  )}
                >
                  {f}
                </button>
              ))}
              <span className="ml-auto text-white/20 text-xs font-mono self-center">
                {isPending ? "—" : `${proposals.length} proposals`}
              </span>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            {isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse"
                />
              ))
            ) : proposals.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-[14px] border border-white/[0.06] mx-auto mb-4 flex items-center justify-center text-xl text-white/[0.15]">
                  🏪
                </div>
                <div className="text-white/20 text-sm font-body mb-3">
                  No proposals yet. Be the first to claim a dead token.
                </div>
                <button
                  onClick={() => setTab("propose")}
                  className="text-cyan text-sm font-semibold font-body hover:underline"
                >
                  Submit a proposal →
                </button>
              </div>
            ) : (
              proposals.map((p, i) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  index={i}
                  onVote={(vote) =>
                    voteMutation.mutate({ proposalId: p.id, vote })
                  }
                  voting={voteMutation.isPending}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* ── Propose Tab ── */}
      {tab === "propose" && (
        <Reveal delay={0.15}>
          {submitted ? (
            <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.03] p-10 text-center">
              <div className="text-3xl mb-4">🧟</div>
              <h3 className="text-xl font-bold text-white font-display mb-2">
                Proposal Submitted
              </h3>
              <p className="text-sm text-white/40 font-body mb-6">
                Your CTO proposal is now live. Holders can vote on the revival.
              </p>
              <button
                onClick={() => { setTab("browse"); setSubmitted(false); }}
                className="text-cyan text-sm font-semibold font-body hover:underline"
              >
                View all proposals →
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
              <h3 className="text-lg font-bold text-white font-display mb-6">
                Revival Proposal
              </h3>

              <div className="flex flex-col gap-5">
                {/* Token address */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Target Token Address *
                  </label>
                  <input
                    type="text"
                    placeholder="Paste pump.fun token address..."
                    value={form.token_address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, token_address: e.target.value }))
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white px-4 py-3 rounded-xl text-sm outline-none font-mono transition-colors focus:border-cyan/30"
                  />
                </div>

                {/* Team name */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Team / Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Who's taking over..."
                    value={form.team_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, team_name: e.target.value }))
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white px-4 py-3 rounded-xl text-sm outline-none font-body transition-colors focus:border-cyan/30"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Contact (X / Telegram)
                  </label>
                  <input
                    type="text"
                    placeholder="@handle or t.me/..."
                    value={form.team_contact}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, team_contact: e.target.value }))
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white px-4 py-3 rounded-xl text-sm outline-none font-body transition-colors focus:border-cyan/30"
                  />
                </div>

                {/* Strategy */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Strategy
                  </label>
                  <div className="flex gap-2">
                    {STRATEGY_OPTIONS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() =>
                          setForm((f) => ({ ...f, strategy: s.key }))
                        }
                        className={clsx(
                          "px-4 py-2 rounded-lg text-xs font-semibold font-body transition-all border",
                          form.strategy === s.key
                            ? "bg-cyan/15 text-cyan border-cyan/30"
                            : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revival plan */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Revival Plan *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your plan to revive this token..."
                    value={form.revival_plan}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, revival_plan: e.target.value }))
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white px-4 py-3 rounded-xl text-sm outline-none font-body transition-colors focus:border-cyan/30 resize-none"
                  />
                </div>

                {/* Timeline */}
                <div>
                  <label className="text-[11px] text-white/30 font-mono tracking-[0.08em] uppercase mb-1.5 block">
                    Timeline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 weeks"
                    value={form.timeline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, timeline: e.target.value }))
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white px-4 py-3 rounded-xl text-sm outline-none font-body transition-colors focus:border-cyan/30"
                  />
                </div>

                {/* Error */}
                {proposeMutation.isError && (
                  <div className="text-[#ff6b6b] text-sm font-body">
                    {(proposeMutation.error as Error)?.message ||
                      "Failed to submit proposal"}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    proposeMutation.isPending ||
                    !form.token_address ||
                    !form.team_name ||
                    !form.revival_plan
                  }
                  className={clsx(
                    "w-full py-3.5 rounded-xl text-sm font-semibold font-body transition-all mt-2",
                    proposeMutation.isPending ||
                      !form.token_address ||
                      !form.team_name ||
                      !form.revival_plan
                      ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                      : "bg-white text-bg cursor-pointer hover:bg-cyan"
                  )}
                >
                  {proposeMutation.isPending
                    ? "Submitting..."
                    : "Submit Proposal"}
                </button>
              </div>
            </div>
          )}
        </Reveal>
      )}
    </div>
  );
}

// ── Proposal Card Component ──────────────────────────────────

function ProposalCard({
  proposal: p,
  index,
  onVote,
  voting,
}: {
  proposal: Proposal;
  index: number;
  onVote: (vote: "for" | "against") => void;
  voting: boolean;
}) {
  const totalVotes = p.votesFor + p.votesAgainst;
  const forPct = totalVotes > 0 ? Math.round((p.votesFor / totalVotes) * 100) : 0;

  const statusColors: Record<string, string> = {
    active: "text-cyan bg-cyan/10 border-cyan/20",
    approved: "text-green-400 bg-green-400/10 border-green-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
    completed: "text-white/50 bg-white/5 border-white/10",
  };

  return (
    <Reveal delay={index * 0.06}>
      <MagCard className="rounded-xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[15px] font-bold text-white font-display truncate">
                {p.tokenName}
              </span>
              <span className="text-xs text-white/25 font-mono">
                ${p.tokenSymbol}
              </span>
              <span
                className={clsx(
                  "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border",
                  statusColors[p.status] || statusColors.active
                )}
              >
                {p.status}
              </span>
            </div>
            <div className="text-xs text-white/25 font-mono">
              by {p.teamName} · {p.createdAgo} ago · {p.strategy} · {p.timeline}
            </div>
          </div>
          <div className="text-xs text-white/20 font-mono whitespace-nowrap">
            {p.tokenAddress.slice(0, 6)}...{p.tokenAddress.slice(-4)}
          </div>
        </div>

        {/* Plan */}
        <div className="px-5 pb-4">
          <p className="text-sm text-white/40 font-body leading-[1.6] line-clamp-2">
            {p.revivalPlan}
          </p>
        </div>

        {/* Voting bar + buttons */}
        <div className="px-5 py-3.5 border-t border-white/[0.04] flex items-center gap-4">
          {/* Vote bar */}
          <div className="flex-1">
            <div className="h-[4px] rounded-sm bg-white/[0.06] overflow-hidden flex">
              {totalVotes > 0 && (
                <>
                  <div
                    className="h-full bg-cyan transition-[width] duration-300"
                    style={{ width: `${forPct}%` }}
                  />
                  <div
                    className="h-full bg-[#ff4444] transition-[width] duration-300"
                    style={{ width: `${100 - forPct}%` }}
                  />
                </>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] font-mono text-cyan">
                {p.votesFor} for
              </span>
              <span className="text-[10px] font-mono text-[#ff4444]">
                {p.votesAgainst} against
              </span>
            </div>
          </div>

          {/* Vote buttons */}
          {p.status === "active" && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onVote("for")}
                disabled={voting}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold font-body border border-cyan/20 text-cyan bg-cyan/[0.05] transition-all hover:bg-cyan/15 disabled:opacity-50"
              >
                Revive
              </button>
              <button
                onClick={() => onVote("against")}
                disabled={voting}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold font-body border border-white/[0.08] text-white/30 transition-all hover:text-white/60 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </MagCard>
    </Reveal>
  );
}
