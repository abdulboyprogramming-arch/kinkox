'use client';

import Link from 'next/link';
import { PiggyBank, TrendingUp, Shield, Users, ArrowRight, Rocket, Clock, Gift } from 'lucide-react';
import { routes } from '@/lib/routes';

export default function HomePage() {
  const features = [
    {
      icon: PiggyBank,
      title: 'Secure Savings',
      description: 'Deposit ETH with confidence using our audited smart contracts',
      color: 'primary',
    },
    {
      icon: TrendingUp,
      title: 'Earn Interest',
      description: 'Enjoy competitive APY rates on your locked savings',
      color: 'green',
    },
    {
      icon: Shield,
      title: 'Fully Audited',
      description: 'Smart contracts verified and secured by top security firms',
      color: 'blue',
    },
    {
      icon: Clock,
      title: 'Flexible Terms',
      description: 'Choose lock periods from 30 days to 5 years',
      color: 'purple',
    },
    {
      icon: Gift,
      title: 'Referral Program',
      description: 'Earn extra rewards by inviting friends to KinkoX',
      color: 'orange',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of savers building their future',
      color: 'red',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-6">
              <Rocket className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Welcome to KinkoX</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent animate-gradient">
              Save Crypto, Earn Rewards
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Deposit ETH, lock it for a period, and earn competitive interest rates. 
              Start building your crypto wealth today with KinkoX.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={routes.dashboard} className="btn-primary inline-flex items-center gap-2 group">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="btn-secondary inline-flex items-center gap-2">
                Learn More
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-3xl font-bold text-primary-600">$2.5M+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value Locked</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600">8-18%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">APY Rates</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600">1000+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Savers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose KinkoX?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide a secure, transparent, and rewarding platform for your crypto savings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
                green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
                orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
                red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
              };
              
              return (
                <div key={index} className="card hover:scale-105 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Saving?</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already earning rewards with KinkoX
            </p>
            <Link href={routes.dashboard} className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
