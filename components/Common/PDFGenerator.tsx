'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { useSavingsData } from '@/hooks/useSavingsData';
import { Download, FileText, Loader } from 'lucide-react';
import { formatDate, getCurrentYear } from '@/lib/utils';
import { useNotification } from '@/contexts/NotificationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PDFGenerator() {
  const { address } = useAccount();
  const { userPosition } = useContract();
  const { savingsHistory, totalSaved, totalInterest, referralEarnings } = useSavingsData();
  const { showSuccess, showError } = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!address) {
      showError('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const currentYear = getCurrentYear();
      
      // Colors
      const primaryColor = [99, 102, 241]; // #6366f1
      
      // Title Section
      doc.setFontSize(28);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('KinkoX', 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text('Account Statement Report', 20, 38);
      
      // Report Info
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 50);
      doc.text(`Wallet Address: ${address}`, 20, 57);
      doc.text(`Report ID: KX-${Date.now()}`, 20, 64);
      
      // Account Summary Section
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 75, 170, 45, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Account Summary', 25, 88);
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Deposits: ${totalSaved.toFixed(6)} ETH`, 25, 100);
      doc.text(`Total Interest Earned: ${totalInterest.toFixed(6)} ETH`, 25, 110);
      doc.text(`Referral Earnings: ${referralEarnings.toFixed(6)} ETH`, 25, 120);
      
      // Current Position
      if (userPosition && !userPosition.withdrawn && userPosition.amount > 0) {
        doc.setFillColor(230, 240, 255);
        doc.rect(20, 135, 170, 40, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Active Position', 25, 148);
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Amount: ${userPosition.amount} ETH`, 25, 160);
        doc.text(`Lock Period: ${new Date(userPosition.startTime * 1000).toLocaleDateString()} - ${new Date(userPosition.endTime * 1000).toLocaleDateString()}`, 25, 170);
      }
      
      // Transaction History Table
      let startY = userPosition && !userPosition.withdrawn ? 190 : 150;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Transaction History', 20, startY);
      
      const tableData = savingsHistory.map(saving => [
        formatDate(saving.depositDate),
        `${saving.amount.toFixed(6)} ETH`,
        `${saving.lockDays} days`,
        `${saving.interest.toFixed(6)} ETH`,
        saving.status.toUpperCase(),
      ]);
      
      autoTable(doc, {
        startY: startY + 8,
        head: [['Date', 'Amount', 'Lock Period', 'Interest', 'Status']],
        body: tableData.length > 0 ? tableData : [['No transactions', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 },
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `KinkoX - Save to Earn Platform | Page ${i} of ${pageCount} | © ${currentYear} KinkoX`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      const filename = `kinkox_statement_${address.slice(0, 8)}_${Date.now()}.pdf`;
      doc.save(filename);
      showSuccess('Account statement downloaded successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Generating Report...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Download Full Account Report (PDF)
        </>
      )}
    </button>
  );
}
