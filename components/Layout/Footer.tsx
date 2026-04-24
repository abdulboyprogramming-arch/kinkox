'use client';

import Link from 'next/link';
import { Github, Twitter, Discord, Mail, Heart } from 'lucide-react';
import { getCurrentYear } from '@/lib/utils';

export default function Footer() {
  const currentYear = getCurrentYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              KinkoX
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Save ETH, earn interest, and grow your wealth with our secure savings platform.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Discord className="w-5 h-5" />
              </a>
              <a href="mailto:support@kinkox.com" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/deposit" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Deposit</Link></li>
              <li><Link href="/history" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Transaction History</Link></li>
              <li><Link href="/refer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Referral Program</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600 dark:text-gray-400">Email: support@kinkox.com</li>
              <li className="text-gray-600 dark:text-gray-400">Telegram: @kinkox_support</li>
              <li className="text-gray-600 dark:text-gray-400">Contract: 0xc55c...9F0e</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by Team KinkoX
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © {currentYear} KinkoX. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Team: Abdulrahaman | Feranmi | Marvellous | Elo
          </p>
        </div>
      </div>
    </footer>
  );
}
