'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { useSavingsData } from '@/hooks/useSavingsData';
import { User, Copy, Check, Mail, Calendar, Award, TrendingUp, Shield, ExternalLink } from 'lucide-react';
import { formatAddress, formatDate, copyToClipboard } from '@/lib/utils';
import { useNotification } from '@/contexts/NotificationContext';
import PDFGenerator from '@/components/Common/PDFGenerator';

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterest: number;
  referralCount: number;
  rank: string;
  joinDate: Date;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { userPosition } = useContract();
  const { totalSaved, totalInterest, referralEarnings } = useSavingsData();
  const { showSuccess } = useNotification();
  const [isCopied, setIsCopied] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInterest: 0,
    referralCount: 0,
    rank: 'Bronze',
    joinDate: new Date(),
  });

  useEffect(() => {
    if (address) {
      // Load user stats from localStorage
      const savedStats = localStorage.getItem(`user_stats_${address}`);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({
          ...parsed,
          joinDate: new Date(parsed.joinDate),
        });
      } else {
        // Set initial stats
        const initialStats = {
          totalDeposits: totalSaved,
          totalWithdrawals: 0,
          totalInterest: totalInterest,
          referralCount: 0,
          rank: 'Bronze',
          joinDate: new Date(),
        };
        setStats(initialStats);
        localStorage.setItem(`user_stats_${address}`, JSON.stringify(initialStats));
      }
    }
  }, [address, totalSaved, totalInterest]);

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copyToClipboard(address);
      if (success) {
        setIsCopied(true);
        showSuccess('Address copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      }
    }
  };

  const getRankIcon = () => {
    switch (stats.rank) {
      case 'Bronze':
        return '🥉';
      case 'Silver':
        return '🥈';
      case 'Gold':
        return '🥇';
      case 'Platinum':
        return '💎';
      default:
        return '⭐';
    }
  };

  const getNextRankProgress = () => {
    const deposits = stats.totalDeposits;
    if (deposits < 1) return { current: 'Bronze', next: 'Silver', progress: (deposits / 1) * 100 };
    if (deposits < 5) return { current: 'Silver', next: 'Gold', progress: ((deposits - 1) / 4) * 100 };
    if (deposits < 10) return { current: 'Gold', next: 'Platinum', progress: ((deposits - 5) / 5) * 100 };
    return { current: 'Platinum', next: 'Platinum', progress: 100 };
  };

  const rankProgress = getNextRankProgress();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and view your savings statistics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-4xl mb-4">
                {address ? address.slice(2, 4).toUpperCase() : 'U'}
              </div>
              <div className="absolute bottom-0 right-1/3 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            
            <h2 className="text-xl font-bold mb-1">
              {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'User'}
            </h2>
            
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied!' : 'Copy Address'}
            </button>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {address ? `${address.slice(0, 6)}...@kinkox.eth` : 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Joined {formatDate(stats.joinDate)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Rank: {stats.rank} {getRankIcon()}
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Etherscan
              </a>
            </div>
          </div>
          
          {/* Rank Progress */}
          <div className="card mt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Rank Progress
            </h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{rankProgress.current}</span>
                <span>{rankProgress.next}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-600 to-primary-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {rankProgress.progress === 100 
                  ? 'Maximum rank achieved!' 
                  : `${(rankProgress.progress).toFixed(0)}% to ${rankProgress.next}`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Total Deposits</p>
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalDeposits.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500 mt-2">Lifetime deposits</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Total Withdrawals</p>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalWithdrawals.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500 mt-2">Lifetime withdrawals</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Total Interest Earned</p>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalInterest.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500 mt-2">From savings positions</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Referral Earnings</p>
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{referralEarnings.toFixed(4)} ETH</p>
              <p className="text-xs text-gray-500 mt-2">From {stats.referralCount} referrals</p>
            </div>
          </div>
          
          {/* Active Position Summary */}
          {userPosition && !userPosition.withdrawn && userPosition.amount > 0 && (
            <div className="card mb-6">
              <h3 className="font-semibold mb-4">Active Savings Position</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal Amount:</span>
                  <span className="font-semibold">{userPosition.amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span>{formatDate(userPosition.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maturity Date:</span>
                  <span>{formatDate(userPosition.endTime)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* PDF Report Generator */}
          <div className="card">
            <h3 className="font-semibold mb-4">Account Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate a comprehensive report of your account activity, including all transactions, earnings, and savings history.
            </p>
            <PDFGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
