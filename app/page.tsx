"use client";

import Link from "next/link";

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
}

export default function HomePage() {
  const features: FeatureCard[] = [
    {
      title: "Activity Tracker",
      description: "Monitor and manage your daily activities",
      href: "/activities",
      icon: "⏱️",
      gradient: "from-blue-500/10 to-purple-500/10",
    },
    {
      title: "Transaction Manager",
      description: "Track your financial transactions",
      href: "/transactions",
      icon: "💳",
      gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      title: "Book Reader",
      description: "Read and manage your digital book collection",
      href: "https://histweety-reader.vercel.app/",
      icon: "📚",
      gradient: "from-orange-500/10 to-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-white via-primary-muted to-white bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Notion Manager
          </h1>
          <p className="text-lg text-primary-subtle">Simple. Interactive. Powerful.</p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2" role="main">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <div className="feature-card">
                {/* Icon & Title */}
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-4xl transition-transform duration-300 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </div>
                  <svg
                    className="h-6 w-6 text-primary-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Content */}
                <h2 className="mb-2 text-2xl font-semibold text-primary transition-colors duration-300 group-hover:text-white">
                  {feature.title}
                </h2>
                <p className="text-sm text-primary-subtle transition-colors duration-300 group-hover:text-primary-muted">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
