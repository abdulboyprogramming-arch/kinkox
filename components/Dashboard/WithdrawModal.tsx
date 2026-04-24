'use client';

import { useState } from 'react';
import { X, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useSavingsData } from '@/hooks/useSavingsData';
import { formatTimeRemaining, calculateTotalReturn } from '@/lib/contract';
import { useNotification } from '@/contexts/NotificationContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { userPosition, withdraw, refreshPosition } = useContract();
  const { markAsWithdrawn } = useSavingsData();
  const { showError } = useNotification();

  if (!isOpen || !userPosition || userPosition.withdrawn) return null;

  const isMatured = Date.now() / 1000 >= userPosition.endTime;
  const timeRemaining = formatTimeRemaining(userPosition.endTime);
  const lockDays = (userPosition.endTime - userPosition.startTime) / (24 * 60 * 60);
  const totalWithInterest = calculateTotalReturn(userPosition.amount, lockDays);

  const handleWithdraw = async () => {
    if (!isMatured) {
      showError('Lock period has not expired yet');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await withdraw();
      if (success) {
        markAsWithdrawn(Date.now().toString());
        await refreshPosition();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Position Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Initial Deposit:</span>
              <span className="font-semibold">{userPosition.amount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Interest Earned:</span>
              <span className="font-semibold text-green-600">{(totalWithInterest - userPosition.amount).toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white font-semibold">Total to Receive:</span>
              <span className="text-xl font-bold text-primary-600">{totalWithInterest.toFixed(6)} ETH</span>
            </div>
          </div>
          
          {/* Status */}
          <div className={`p-4 rounded-lg ${isMatured ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
            <div className="flex items-center gap-3">
              {isMatured ? (
                <>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">Ready to Withdraw!</p>
                    <p className="text-sm text-green-600/80">Your funds are now available</p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">Lock Period Active</p>
                    <p className="text-sm text-yellow-600/80">{timeRemaining}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Warning */}
          {!isMatured && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">
                Withdrawing before the lock period ends is not possible. Please wait until your lock period expires.
              </p>
            </div>
          )}
          
          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !isMatured}
            className={`btn-primary w-full ${!isMatured ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : `Withdraw ${totalWithInterest.toFixed(6)} ETH`}
          </button>
        </div>
      </div>
    </div>
  );
}
