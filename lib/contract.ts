// Contract ABI from the deployed contract
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "KinkoVault__AlreadyWithdrawn",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__AmountMustBeGreaterThanZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__ExistingPosition",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__InvalidDuration",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__LockPeriodNotExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__NoActivePosition",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "KinkoVault__TransferFailed",
    "type": "error"
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
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
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
      }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "duration",
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
    "name": "getMaxLockDuration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinLockDuration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserPosition",
    "outputs": [
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
    "stateMutability": "view",
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
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;

// Contract address (Deployed on Sepolia)
export const CONTRACT_ADDRESS = "0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e";

// Sepolia chain ID
export const SEPOLIA_CHAIN_ID = 11155111;

// Interest rate calculation (8% APR for demonstration)
export const INTEREST_RATE = 8; // 8% APR

// Lock periods in seconds (from contract)
export const MIN_LOCK_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const MAX_LOCK_SECONDS = 5 * 365 * 24 * 60 * 60; // 5 years

// Lock period options for users (in days)
export const LOCK_OPTIONS = [
  { value: 30, label: "30 Days", days: 30, apy: 8, description: "Recommended for beginners" },
  { value: 90, label: "3 Months", days: 90, apy: 9, description: "Balanced returns" },
  { value: 180, label: "6 Months", days: 180, apy: 10.5, description: "Good growth potential" },
  { value: 365, label: "1 Year", days: 365, apy: 12, description: "Excellent returns" },
  { value: 730, label: "2 Years", days: 730, apy: 15, description: "High yield" },
  { value: 1825, label: "5 Years", days: 1825, apy: 18, description: "Maximum returns" },
];

// Function to calculate interest based on lock period
export function calculateInterest(amount: number, lockDays: number): number {
  const option = LOCK_OPTIONS.find(opt => opt.days === lockDays);
  const apy = option ? option.apy : INTEREST_RATE;
  const yearlyInterest = (amount * apy) / 100;
  const interest = (yearlyInterest * lockDays) / 365;
  return parseFloat(interest.toFixed(6));
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
  
  if (days > 0) return `${days} days ${hours}h remaining`;
  if (hours > 0) return `${hours} hours ${minutes}m remaining`;
  return `${minutes} minutes remaining`;
}

// Check if lock period is expired
export function isLockPeriodExpired(endTime: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= endTime;
}

// Format address
export function formatAddress(address: string): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format ETH amount (from wei)
export function formatETHFromWei(amount: bigint | string): string {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  const formatted = Number(value) / 1e18;
  return formatted.toFixed(6);
}

// Format ETH to wei
export function formatToWei(amount: number): bigint {
  return BigInt(Math.floor(amount * 1e18));
}
