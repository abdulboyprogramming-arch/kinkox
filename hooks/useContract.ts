'use client';

import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, formatToWei, formatETHFromWei } from '@/lib/contract';
import { useNotification } from '@/contexts/NotificationContext';
import { parseErrorMessage } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function useContract() {
  const { address, isConnected } = useAccount();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  
  // Read user position
  const { 
    data: positionData,
    refetch: refetchPosition,
    isLoading: isPositionLoading
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get min lock duration
  const { data: minLockDuration } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getMinLockDuration',
  });

  // Get max lock duration
  const { data: maxLockDuration } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getMaxLockDuration',
  });

  // Parse position data
  const userPosition = positionData ? {
    amount: formatETHFromWei(positionData[0] as bigint),
    startTime: Number(positionData[1]),
    endTime: Number(positionData[2]),
    withdrawn: positionData[3] as boolean,
    rawAmount: positionData[0] as bigint,
  } : null;

  // Deposit function
  const deposit = async (amount: number, duration: number) => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    try {
      const amountInWei = formatToWei(amount);
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'deposit',
        args: [BigInt(duration)],
        value: amountInWei,
      });
      
      showSuccess(`Deposit transaction submitted! Hash: ${txHash.slice(0, 10)}...`);
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      showError(parseErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw function
  const withdraw = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return false;
    }

    if (!userPosition || userPosition.withdrawn) {
      showError('No active position to withdraw');
      return false;
    }

    setIsLoading(true);
    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'withdraw',
        args: [],
      });
      
      showSuccess(`Withdrawal transaction submitted! Hash: ${txHash.slice(0, 10)}...`);
      return true;
    } catch (error: any) {
      console.error('Withdraw error:', error);
      showError(parseErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch position after transactions
  const refreshPosition = async () => {
    await refetchPosition();
  };

  return {
    deposit,
    withdraw,
    userPosition,
    minLockDuration: minLockDuration ? Number(minLockDuration) : 2592000, // 30 days in seconds
    maxLockDuration: maxLockDuration ? Number(maxLockDuration) : 157680000, // 5 years in seconds
    isLoading: isLoading || isWritePending || isPositionLoading,
    isConnected,
    address,
    refreshPosition,
  };
}
