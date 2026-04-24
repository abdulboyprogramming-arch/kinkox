'use client';

import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, formatToWei, formatETHFromWei } from '@/lib/contract';
import { useNotification } from '@/contexts/NotificationContext';
import { parseErrorMessage } from '@/lib/utils';
import { useState } from 'react';

// Type for the position data returned from the contract
type PositionData = readonly [bigint, bigint, bigint, boolean];

// Type for the parsed user position
interface UserPosition {
  amount: string;
  startTime: number;
  endTime: number;
  withdrawn: boolean;
  rawAmount: bigint;
}

export function useContract() {
  const { address, isConnected } = useAccount();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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

  // Parse position data with proper type checking
  const userPosition: UserPosition | null = positionData ? {
    amount: formatETHFromWei(positionData[0]),
    startTime: Number(positionData[1]),
    endTime: Number(positionData[2]),
    withdrawn: positionData[3],
    rawAmount: positionData[0],
  } : null;

  // Deposit function
  const deposit = async (amount: number, duration: number): Promise<boolean> => {
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
    } catch (error: unknown) {
      console.error('Deposit error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(parseErrorMessage(errorMessage));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw function
  const withdraw = async (): Promise<boolean> => {
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
    } catch (error: unknown) {
      console.error('Withdraw error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(parseErrorMessage(errorMessage));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch position after transactions
  const refreshPosition = async (): Promise<void> => {
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
