"use client";

import Link from "next/link";

interface FeatureCard {
  title: string;
  href: string;
  icon: string;
}

export default function HomePage() {
  const features: FeatureCard[] = [
    {
      title: "Activity Tracker",
      href: "/activities",
      icon: "⏱️",
    },
    {
      title: "Transaction Manager",
      href: "/transactions",
      icon: "💳",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Tracker</h1>

        <div className="space-y-4" role="main">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card block p-6 transition-all hover:scale-102 focus-visible"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </div>
                <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
