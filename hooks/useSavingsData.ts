'use client';

import { useState, useEffect } from 'react';
import { calculateInterest, calculateTotalReturn, isLockPeriodExpired } from '@/lib/contract';
import { useContract } from './useContract';

interface SavingsHistory {
  id: string;
  amount: number;
  lockDays: number;
  depositDate: Date;
  maturityDate: Date;
  interest: number;
  totalReturn: number;
  status: 'active' | 'withdrawn' | 'matured';
}

export function useSavingsData() {
  const { userPosition, address } = useContract();
  const [savingsHistory, setSavingsHistory] = useState<SavingsHistory[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);

  // Load savings history from localStorage
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`savings_history_${address}`);
      if (saved) {
        const history = JSON.parse(saved);
        setSavingsHistory(history.map((h: any) => ({
          ...h,
          depositDate: new Date(h.depositDate),
          maturityDate: new Date(h.maturityDate),
        })));
      }
    }
  }, [address]);

  // Save current position to history
  const savePosition = (amount: number, lockDays: number) => {
    if (!address) return;
    
    const depositDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + lockDays);
    
    const interest = calculateInterest(amount, lockDays);
    const totalReturn = calculateTotalReturn(amount, lockDays);
    
    const newHistory: SavingsHistory = {
      id: Date.now().toString(),
      amount,
      lockDays,
      depositDate,
      maturityDate,
      interest,
      totalReturn,
      status: 'active',
    };
    
    const updatedHistory = [newHistory, ...savingsHistory];
    setSavingsHistory(updatedHistory);
    localStorage.setItem(`savings_history_${address}`, JSON.stringify(updatedHistory));
    
    // Update totals
    setTotalSaved(prev => prev + amount);
  };

  // Update position status when withdrawn
  const markAsWithdrawn = (positionId: string) => {
    const updatedHistory = savingsHistory.map(h => 
      h.id === positionId ? { ...h, status: 'withdrawn' as const } : h
    );
    setSavingsHistory(updatedHistory);
    localStorage.setItem(`savings_history_${address}`, JSON.stringify(updatedHistory));
  };

  // Calculate current position value including interest
  const getCurrentPositionValue = () => {
    if (!userPosition || userPosition.withdrawn) return 0;
    
    const now = Date.now() / 1000;
    const timeElapsed = now - userPosition.startTime;
    const totalDuration = userPosition.endTime - userPosition.startTime;
    
    if (timeElapsed <= 0) return userPosition.amount;
    if (timeElapsed >= totalDuration) {
      // Calculate full interest
      const lockDays = totalDuration / (24 * 60 * 60);
      return calculateTotalReturn(userPosition.amount, lockDays);
    }
    
    // Calculate partial interest based on time elapsed
    const lockDays = totalDuration / (24 * 60 * 60);
    const fullInterest = calculateInterest(userPosition.amount, lockDays);
    const partialInterest = (fullInterest * timeElapsed) / totalDuration;
    
    return userPosition.amount + partialInterest;
  };

  // Check if position is matured
  const isPositionMatured = () => {
    if (!userPosition) return false;
    return isLockPeriodExpired(userPosition.endTime);
  };

  // Update referral earnings (simulated)
  const updateReferralEarnings = (amount: number) => {
    setReferralEarnings(prev => prev + amount);
    localStorage.setItem(`referral_earnings_${address}`, (referralEarnings + amount).toString());
  };

  // Load referral earnings
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`referral_earnings_${address}`);
      if (saved) {
        setReferralEarnings(parseFloat(saved));
      }
    }
  }, [address]);

  return {
    savingsHistory,
    totalSaved,
    totalInterest,
    referralEarnings,
    savePosition,
    markAsWithdrawn,
    getCurrentPositionValue,
    isPositionMatured,
    updateReferralEarnings,
  };
      }
