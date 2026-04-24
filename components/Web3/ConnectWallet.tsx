'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useState } from 'react';
import { Wallet, LogOut, Copy, Check, ChevronDown } from 'lucide-react';
import { formatAddress } from '@/lib/contract';
import { useNotification } from '@/contexts/NotificationContext';
import Image from 'next/image';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { showSuccess } = useNotification();
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = async () => {
    try {
      connect({ connector: injected() });
      showSuccess('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showSuccess('Wallet disconnected');
    setIsDropdownOpen(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      showSuccess('Address copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="btn-primary flex items-center gap-2"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">{formatAddress(address!)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{address}</p>
          </div>
          
          <button
            onClick={copyAddress}
            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>Copy Address</span>
          </button>
          
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
