export interface Token {
  address: string;
  name: string;
  symbol: string;
  diedAgo: string;
  holders: number;
  peakMcap: string;
  residualLiq: string;
  zombieScore: number;
  status: "DEAD" | "ZOMBIE";
  deathCause: string;
}

export const TOKENS: Token[] = [
  { address: "7xKXtQ9Rp4mVz8NbW3dGhY5sLcFjA2kEu6", name: "DogeAI", symbol: "DOAI", diedAgo: "2h", holders: 847, peakMcap: "$142K", residualLiq: "$230", zombieScore: 78, status: "DEAD", deathCause: "Dev inactive 14d" },
  { address: "Qm9FzW7xLpN3kRtB8vY2cHdS6jUeA4gMo1", name: "SolChef", symbol: "CHEF", diedAgo: "5h", holders: 1203, peakMcap: "$89K", residualLiq: "$1,100", zombieScore: 85, status: "ZOMBIE", deathCause: "Zero volume 72h" },
  { address: "Bx4RpT2mKzQ8wN6vL9yGhD3sJcFe7jUiA5", name: "NeonCat", symbol: "NCAT", diedAgo: "12h", holders: 412, peakMcap: "$53K", residualLiq: "$80", zombieScore: 42, status: "DEAD", deathCause: "Rug — dev sold 100%" },
  { address: "Ht7UwZ3nKpR9xM4vB8yLcGdS6jFeA2kQo1", name: "GPT Token", symbol: "GPTX", diedAgo: "1d", holders: 2891, peakMcap: "$310K", residualLiq: "$4,200", zombieScore: 94, status: "ZOMBIE", deathCause: "Team abandoned" },
  { address: "Nm3QkW8xLpT2vR6yB9zGhD4sFcJe7jUiA5", name: "BasedFrog", symbol: "BFROG", diedAgo: "1d", holders: 634, peakMcap: "$71K", residualLiq: "$150", zombieScore: 56, status: "DEAD", deathCause: "Community dissolved" },
  { address: "Zv8LwT5nKpR3xM9vB2yGcHdS6jFeA4kQo1", name: "SolPets", symbol: "SPET", diedAgo: "2d", holders: 1567, peakMcap: "$205K", residualLiq: "$2,800", zombieScore: 91, status: "ZOMBIE", deathCause: "Dev wallet inactive 30d" },
  { address: "Yx2MnR7xLpQ8wN4vT6yBcGdS3jFeA9kUi5", name: "MoonRabbit", symbol: "MRAB", diedAgo: "3d", holders: 328, peakMcap: "$38K", residualLiq: "$45", zombieScore: 31, status: "DEAD", deathCause: "Failed bonding curve" },
  { address: "Kp5JdW1nLzR8xM3vT9yBcGhS6jFeA2kQo4", name: "AITrader Pro", symbol: "AITP", diedAgo: "3d", holders: 3104, peakMcap: "$520K", residualLiq: "$8,400", zombieScore: 97, status: "ZOMBIE", deathCause: "Team pivot, token abandoned" },
  { address: "Wc1RtZ6nKpQ3xM8vB4yLcGdS9jFeA7kUi2", name: "Pump Punk", symbol: "PPNK", diedAgo: "4d", holders: 189, peakMcap: "$22K", residualLiq: "$12", zombieScore: 18, status: "DEAD", deathCause: "Never gained traction" },
  { address: "Fg6NsW4xLpT7vR2yB8zGhD5sFcJe1jQkA9", name: "DeFi Degen", symbol: "DDGN", diedAgo: "5d", holders: 2210, peakMcap: "$175K", residualLiq: "$3,100", zombieScore: 88, status: "ZOMBIE", deathCause: "Creator fee drain" },
];

export const STATS = {
  scanned: 147832,
  deaths: 24891,
  zombies: 1247,
  lifespan: "4.2h",
  stranded: "12.4M",
};
