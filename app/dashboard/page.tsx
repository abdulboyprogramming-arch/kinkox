'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { useSavingsData } from '@/hooks/useSavingsData';
import StatsCard from '@/components/Dashboard/StatsCard';
import DepositModal from '@/components/Dashboard/DepositModal';
import WithdrawModal from '@/components/Dashboard/WithdrawModal';
import SavingsChart from '@/components/Dashboard/SavingsChart';
import { Wallet, TrendingUp, Clock, Gift, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatTimeRemaining, isLockPeriodExpired } from '@/lib/contract';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { userPosition, refreshPosition, isLoading } = useContract();
  const { totalSaved, totalInterest, referralEarnings, getCurrentPositionValue, isPositionMatured } = useSavingsData();
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (userPosition && !userPosition.withdrawn) {
      const updateValue = () => {
        const value = getCurrentPositionValue();
        setCurrentValue(value);
      };
      updateValue();
      const interval = setInterval(updateValue, 10000);
      return () => clearInterval(interval);
    }
  }, [userPosition, getCurrentPositionValue]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your dashboard
          </p>
        </div>
      </div>
    );
  }

  const hasActivePosition = userPosition && !userPosition.withdrawn && userPosition.amount > 0;
  const canWithdraw = hasActivePosition && isLockPeriodExpired(userPosition.endTime);
  const timeRemaining = hasActivePosition ? formatTimeRemaining(userPosition.endTime) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Saver'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Deposited"
          value={`${totalSaved.toFixed(4)} ETH`}
          icon={Wallet}
          color="primary"
        />
        <StatsCard
          title="Total Interest"
          value={`${totalInterest.toFixed(4)} ETH`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Referral Earnings"
          value={`${referralEarnings.toFixed(4)} ETH`}
          icon={Gift}
          color="purple"
        />
        <StatsCard
          title="Current Value"
          value={`${currentValue.toFixed(4)} ETH`}
          icon={Clock}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Active Position Card */}
      {hasActivePosition && (
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Active Savings Position</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deposited: <span className="font-semibold">{userPosition.amount} ETH</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Value: <span className="font-semibold text-green-600">{currentValue.toFixed(6)} ETH</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {canWithdraw ? 
                    <span className="text-green-600 font-semibold">Ready to Withdraw</span> : 
                    <span className="text-yellow-600">{timeRemaining}</span>
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={!canWithdraw}
              className={`btn-primary flex items-center gap-2 ${!canWithdraw ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Withdraw Funds
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="card hover:shadow-xl transition-all duration-300 text-left group"
          disabled={hasActivePosition}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 group-hover:scale-110 transition-transform">
              <ArrowDownCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Deposit ETH</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start earning interest on your savings
              </p>
            </div>
          </div>
        </button>
        
        <Link href={routes.refer} className="card hover:shadow-xl transition-all duration-300 text-left group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Refer & Earn</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Invite friends and earn extra rewards
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Savings Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Savings Growth Projection</h3>
        <SavingsChart />
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={refreshPosition}
      />
      
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={refreshPosition}
      />
    </div>
  );
}
