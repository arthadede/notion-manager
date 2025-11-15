'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features: FeatureCard[] = [
    {
      title: 'Activity Tracker',
      description: 'Track your daily activities and monitor your time with real-time updates',
      href: '/activities',
      icon: '⏱️',
      color: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
    },
    {
      title: 'Transaction Manager',
      description: 'Manage your expenses and keep track of your financial transactions',
      href: '/transactions',
      icon: '💳',
      color: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="container py-responsive">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-900 rounded mb-8 w-64"></div>
            <div className="h-6 bg-zinc-900 rounded mb-12 w-96"></div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="h-64 bg-zinc-900 rounded-lg"></div>
              <div className="h-64 bg-zinc-900 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>

      <div className="min-h-screen">
        <div className="container py-responsive">
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Welcome to Tracker
              </h1>
              <p className="text-responsive text-gray-400 max-w-2xl mx-auto">
                Manage your activities and transactions in one place. Choose a tool below to get started.
              </p>
            </div>

            {/* Feature Cards */}
            <div
              className="grid gap-8 md:grid-cols-2 mb-16"
              role="main"
              id="main"
            >
              {features.map((feature, index) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`card block p-8 text-center transition-all duration-300 border ${feature.color} animate-fade-in hover:transform hover:scale-105 focus-visible`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4" aria-hidden="true">
                    {feature.icon}
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-white">
                    {feature.title}
                  </h2>

                  <p className="text-gray-400 mb-6">
                    {feature.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-white font-medium">
                    <span>Get Started</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer Info */}
            <footer className="text-center">
              <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-gray-600 text-sm">
                  Built with Next.js and powered by Notion API
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs">All systems operational</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
