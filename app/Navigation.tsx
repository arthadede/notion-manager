'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="nav-title">Tracker</span>
          </div>
          <div className="nav-links">
            <div className="nav-link placeholder"></div>
            <div className="nav-link placeholder"></div>
            <div className="nav-link placeholder"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-title">Tracker</span>
        </div>
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-link-text">Home</span>
          </Link>
          <Link
            href="/activities"
            className={`nav-link ${pathname === '/activities' ? 'active' : ''}`}
          >
            <span className="nav-link-text">Activities</span>
          </Link>
          <Link
            href="/transactions"
            className={`nav-link ${pathname === '/transactions' ? 'active' : ''}`}
          >
            <span className="nav-link-text">Transactions</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}