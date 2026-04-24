'use client';

import { useState } from 'react';
import { X, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { LOCK_OPTIONS, calculateInterest, calculateTotalReturn } from '@/lib/contract';
import { useContract } from '@/hooks/useContract';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useNotification } from '@/contexts/NotificationContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedLock, setSelectedLock] = useState(LOCK_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { deposit, refreshPosition } = useContract();
  const { savePosition } = useSavingsData();
  const { showError } = useNotification();

  if (!isOpen) return null;

  const amountNum = parseFloat(amount) || 0;
  const interest = calculateInterest(amountNum, selectedLock.days);
  const totalReturn = calculateTotalReturn(amountNum, selectedLock.days);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amountNum <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    
    if (amountNum < 0.001) {
      showError('Minimum deposit is 0.001 ETH');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await deposit(amountNum, selectedLock.days);
      if (success) {
        savePosition(amountNum, selectedLock.days);
        await refreshPosition();
        onSuccess();
        onClose();
        setAmount('');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deposit ETH</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount-input" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Amount (ETH)
            </label>
            <div className="relative">
              <input
                id="amount-input"
                type="number"
                step="0.001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="input-primary"
                required
                aria-label="Enter amount in ETH"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">ETH</span>
            </div>
          </div>
          
          {/* Lock Period Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Lock Period
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Lock period options">
              {LOCK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedLock(option)}
                  className={`p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedLock.value === option.value
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`Lock for ${option.label} at ${option.apy}% APY`}
                  aria-pressed={selectedLock.value === option.value}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-xs ${selectedLock.value === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                    {option.apy}% APY
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          {amountNum > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2" aria-label="Preview of returns">
              <h3 className="font-semibold text-sm mb-2">Preview Returns</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Interest Earned:</span>
                <span className="font-semibold text-green-600">{interest.toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total at Maturity:</span>
                <span className="font-semibold text-primary-600">{totalReturn.toFixed(6)} ETH</span>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || amountNum <= 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLoading ? 'Processing deposit...' : `Deposit ${amountNum || ''} ETH`}
          >
            {isLoading ? 'Processing...' : `Deposit ${amountNum > 0 ? amountNum : ''} ETH`}
          </button>
        </form>
      </div>
    </div>
  );
}
