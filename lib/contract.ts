// Contract ABI for KinkoVault
export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lockDuration",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserPosition",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "withdrawn",
            "type": "bool"
          }
        ],
        "internalType": "struct KinkoVault.Position",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalDeposited",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "hasActivePosition",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lockDuration",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "interestEarned",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;

// Contract address (to be updated after deployment on Sepolia)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Interest rate calculation (5% APR)
export const INTEREST_RATE = 5; // 5% APR

// Lock periods in seconds
export const LOCK_PERIODS = {
  MIN: 30 * 24 * 60 * 60, // 30 days
  MAX: 5 * 365 * 24 * 60 * 60, // 5 years
};

// Lock period options for users (in days)
export const LOCK_OPTIONS = [
  { value: 30, label: "30 Days", days: 30, apy: 2.5 },
  { value: 90, label: "3 Months", days: 90, apy: 4.0 },
  { value: 180, label: "6 Months", days: 180, apy: 5.5 },
  { value: 365, label: "1 Year", days: 365, apy: 8.0 },
  { value: 730, label: "2 Years", days: 730, apy: 10.0 },
  { value: 1825, label: "5 Years", days: 1825, apy: 15.0 },
];

// Sepolia network configuration
export const SEPOLIA_CHAIN = {
  id: 11155111,
  name: "Sepolia",
  network: "sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "SepoliaETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
    public: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  testnet: true,
};

// Function to calculate interest
export function calculateInterest(amount: number, lockDays: number): number {
  const yearlyInterest = (amount * INTEREST_RATE) / 100;
  const interest = (yearlyInterest * lockDays) / 365;
  return parseFloat(interest.toFixed(4));
}

// Function to calculate total return
export function calculateTotalReturn(amount: number, lockDays: number): number {
  return amount + calculateInterest(amount, lockDays);
}

// Function to format time remaining
export function formatTimeRemaining(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTime - now;
  
  if (remaining <= 0) return "Ready to withdraw";
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// Function to format address
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Function to format ETH amount
export function formatETH(amount: string | bigint): string {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  const formatted = Number(value) / 1e18;
  return formatted.toFixed(4);
  }
