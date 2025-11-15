"use client";

import Link from "next/link";

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function HomePage() {
  const features: FeatureCard[] = [
    {
      title: "Activity Tracker",
      description: "Track your daily activities and monitor your time with real-time updates",
      href: "/activities",
      icon: "⏱️",
      color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
    },
    {
      title: "Transaction Manager",
      description: "Manage your expenses and keep track of your financial transactions",
      href: "/transactions",
      icon: "💳",
      color: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    },
  ];

  return (
    <>
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>

      <div className="min-h-screen">
        <div className="py-responsive container">
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-16 text-center">
              <h1 className="mb-6 text-5xl font-bold">Welcome to Tracker</h1>
              <p className="text-responsive mx-auto max-w-2xl text-gray-400">
                Manage your activities and transactions in one place. Choose a tool below to get started.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mb-16 grid gap-8 md:grid-cols-2" role="main" id="main">
              {features.map((feature, index) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`card block border p-8 text-center transition-all duration-300 ${feature.color} animate-fade-in focus-visible hover:scale-105 hover:transform`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 text-4xl" aria-hidden="true">
                    {feature.icon}
                  </div>

                  <h2 className="mb-4 text-2xl font-bold text-white">{feature.title}</h2>

                  <p className="mb-6 text-gray-400">{feature.description}</p>

                  <div className="inline-flex items-center gap-2 font-medium text-white">
                    <span>Get Started</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer Info */}
            <footer className="text-center">
              <div className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <p className="text-sm text-gray-600">Built with Next.js and powered by Notion API</p>
                <div className="mt-4 flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
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
