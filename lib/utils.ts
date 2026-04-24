export function formatETH(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}

export function calculateInterest(amount: bigint, daysLocked: number): bigint {
  const baseRate = 500;
  const dailyRate = baseRate / 365;
  const totalRate = Math.floor(dailyRate * daysLocked);
  return (amount * BigInt(totalRate)) / 10000n;
}

export function daysRemaining(unlockTime: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(unlockTime) - now;
  return Math.max(0, Math.ceil(remaining / 86400));
}

export function getCopyrightYear(): number {
  return new Date().getFullYear();
}

export const LOCK_PERIODS = [
  { days: 30, label: '30 Days', apy: '5%' },
  { days: 90, label: '90 Days', apy: '7%' },
  { days: 180, label: '180 Days', apy: '10%' },
  { days: 365, label: '365 Days', apy: '15%' },
] as const;

export const MIN_DEPOSIT = 0.01;

// Performance optimization: Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Performance optimization: Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
