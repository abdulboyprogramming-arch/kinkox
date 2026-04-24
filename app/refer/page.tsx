'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Users, Gift, Copy, Check, Share2, Twitter, MessageCircle, Linkedin, TrendingUp } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { copyToClipboard, generateReferralCode } from '@/lib/utils';
import { useSavingsData } from '@/hooks/useSavingsData';

interface Referral {
  id: string;
  address: string;
  date: Date;
  amount: number;
  status: 'active' | 'completed';
}

export default function ReferPage() {
  const { address, isConnected } = useAccount();
  const { referralEarnings, updateReferralEarnings } = useSavingsData();
  const { showSuccess } = useNotification();
  const [referralCode, setReferralCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (address) {
      // Generate or retrieve referral code
      let code = localStorage.getItem(`referral_code_${address}`);
      if (!code) {
        code = generateReferralCode();
        localStorage.setItem(`referral_code_${address}`, code);
      }
      setReferralCode(code);
      setReferralLink(`${window.location.origin}?ref=${code}`);
      
      // Load referrals
      const savedReferrals = localStorage.getItem(`referrals_${address}`);
      if (savedReferrals) {
        const parsed = JSON.parse(savedReferrals);
        setReferrals(parsed.map((r: any) => ({ ...r, date: new Date(r.date) })));
      }
    }
  }, [address]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setIsCopied(true);
      showSuccess('Referral link copied!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(referralCode);
    if (success) {
      showSuccess('Referral code copied!');
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on KinkoX to earn interest on your ETH savings! Use my referral code ${referralCode} to get started. 🚀💰`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Join me on KinkoX to earn interest on your ETH savings! Use my referral code ${referralCode} to get started. 🚀💰\n\n${referralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const calculateRewards = () => {
    // 5% of each referred friend's deposit
    const totalRewards = referralEarnings;
    const nextTier = referrals.length + 1;
    const nextReward = nextTier * 0.05; // 0.05 ETH example
    
    return { totalRewards, nextReward, nextTier };
  };

  const rewards = calculateRewards();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to access the referral program
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Invite friends to KinkoX and earn rewards on their deposits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Info */}
        <div className="lg:col-span-2">
          {/* Hero Section */}
          <div className="card bg-gradient-to-r from-primary-600 to-primary-500 text-white mb-6">
            <div className="text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Earn Up to 5% Rewards</h2>
              <p className="text-primary-100 mb-6">
                Get 5% of every deposit made by your referrals
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{referrals.length}</p>
                  <p className="text-sm opacity-90">Total Referrals</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{rewards.totalRewards.toFixed(4)} ETH</p>
                  <p className="text-sm opacity-90">Total Earned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Links */}
          <div className="card mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary-600" />
              Share Your Referral Link
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="input-primary flex-1"
                  />
                  <button onClick={handleCopyLink} className="btn-secondary px-4">
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="input-primary flex-1 font-mono text-lg text-center"
                  />
                  <button onClick={handleCopyCode} className="btn-secondary px-4">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="card mb-6">
            <h3 className="font-semibold mb-4">Share on Social Media</h3>
            <div className="flex gap-3">
              <button
                onClick={shareOnTwitter}
                className="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </button>
              <button
                onClick={shareOnTelegram}
                className="flex-1 py-3 rounded-lg bg-[#0088cc] text-white hover:bg-[#006699] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Telegram
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="flex-1 py-3 rounded-lg bg-[#0077b5] text-white hover:bg-[#005582] transition-colors flex items-center justify-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="card">
            <h3 className="font-semibold mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Share Your Link</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share your unique referral link with friends and family
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Friend Deposits</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your friend signs up and makes their first deposit
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Earn Rewards</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You earn 5% of their deposit amount as a reward
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Sidebar */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Rewards
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earned:</span>
                <span className="font-semibold text-green-600">{rewards.totalRewards.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Tier Reward:</span>
                <span className="font-semibold">{rewards.nextReward.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referrals to Next Tier:</span>
                <span className="font-semibold">{rewards.nextTier}</span>
              </div>
            </div>
          </div>

          {/* Referral List */}
          {referrals.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Your Referrals
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-mono">{ref.address.slice(0, 10)}...</p>
                      <p className="text-xs text-gray-500">{ref.date.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{ref.amount.toFixed(4)} ETH</p>
                      <p className="text-xs text-gray-500">Reward</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
