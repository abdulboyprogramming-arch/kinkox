'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useContract } from '@/hooks/useContract';
import { Wallet, Filter, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, downloadPDF } from '@/lib/utils';
import { formatETHFromWei } from '@/lib/contract';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'referral';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  txHash?: string;
  details?: string;
}

// Type for saved transaction from localStorage
interface SavedTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'referral';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  txHash?: string;
  details?: string;
}

export default function HistoryPage() {
  const { isConnected, address } = useAccount();
  const { savingsHistory } = useSavingsData();
  const { userPosition } = useContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'referral'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load transaction history from localStorage
    if (address) {
      const saved = localStorage.getItem(`transactions_${address}`);
      if (saved) {
        const parsed: SavedTransaction[] = JSON.parse(saved);
        setTransactions(parsed.map((t: SavedTransaction) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        })));
      } else {
        // Generate demo transactions
        const demoTransactions: Transaction[] = [];
        
        // Add savings history transactions
        savingsHistory.forEach((saving) => {
          demoTransactions.push({
            id: saving.id,
            type: 'deposit',
            amount: saving.amount,
            status: 'completed',
            timestamp: saving.depositDate,
            txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
            details: `Lock period: ${saving.lockDays} days at ${saving.lockDays === 30 ? '8%' : saving.lockDays === 365 ? '12%' : '10%'} APY`,
          });
        });
        
        // Add current position if active
        if (userPosition && !userPosition.withdrawn && userPosition.amount > 0) {
          demoTransactions.push({
            id: 'current',
            type: 'deposit',
            amount: userPosition.amount,
            status: 'completed',
            timestamp: new Date(userPosition.startTime * 1000),
            txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
            details: `Currently active - Matures on ${formatDate(userPosition.endTime)}`,
          });
        }
        
        setTransactions(demoTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      }
    }
  }, [address, savingsHistory, userPosition]);

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(searchLower) ||
        t.txHash?.toLowerCase().includes(searchLower) ||
        t.details?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'deposit':
        return '📥';
      case 'withdraw':
        return '📤';
      case 'referral':
        return '🎁';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const generatePDFReport = (): void => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('KinkoX Transaction Report', 20, 20);
    
    // User info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Wallet Address: ${address}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
    
    // Summary
    const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0);
    const totalReferrals = transactions.filter(t => t.type === 'referral').reduce((sum, t) => sum + t.amount, 0);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 20, 55);
    doc.setFontSize(10);
    doc.text(`Total Deposits: ${totalDeposits.toFixed(6)} ETH`, 20, 65);
    doc.text(`Total Withdrawals: ${totalWithdrawals.toFixed(6)} ETH`, 20, 72);
    doc.text(`Total Referral Earnings: ${totalReferrals.toFixed(6)} ETH`, 20, 79);
    doc.text(`Net Balance: ${(totalDeposits - totalWithdrawals + totalReferrals).toFixed(6)} ETH`, 20, 86);
    
    // Transactions table
    const tableData = paginatedTransactions.map(t => [
      formatDate(t.timestamp),
      t.type.toUpperCase(),
      t.amount.toFixed(6) + ' ETH',
      t.status.toUpperCase(),
      t.txHash?.slice(0, 10) + '...' || '-',
    ]);
    
    autoTable(doc, {
      startY: 95,
      head: [['Date', 'Type', 'Amount', 'Status', 'Transaction Hash']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });
    
    // Save PDF
    const filename = `kinkox_report_${address?.slice(0, 8)}_${Date.now()}.pdf`;
    doc.save(filename);
    downloadPDF(doc.output('blob'), filename);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your transaction history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your deposits, withdrawals, and referral earnings
          </p>
        </div>
        <button
          onClick={generatePDFReport}
          className="btn-secondary flex items-center gap-2"
          aria-label="Export transaction history as PDF report"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Export PDF Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2" role="tablist" aria-label="Transaction type filter">
          {(['all', 'deposit', 'withdraw', 'referral'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              role="tab"
              aria-selected={filter === f}
              aria-label={`Filter by ${f} transactions`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search transactions by ID, hash, or details"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-xl" aria-hidden="true">{getTypeIcon(tx.type)}</span>
                    <span className="ml-2 capitalize">{tx.type}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {tx.amount.toFixed(6)} ETH
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {tx.details || (tx.txHash && `TX: ${tx.txHash.slice(0, 10)}...`)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6" aria-label="Pagination navigation">
          <button
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="px-4 py-2" aria-label={`Page ${currentPage} of ${totalPages}`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
