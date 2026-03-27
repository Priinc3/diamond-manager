'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  LogOut,
  Diamond,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="mobile-header">
        <div className="mobile-header-brand">
          <Diamond size={20} strokeWidth={1.5} color="var(--accent)" />
          <span className="mobile-header-title">Diamond Manager</span>
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Diamond size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="sidebar-title">Diamond Manager</h2>
              <p className="sidebar-version">v1.0.0</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="sidebar-avatar-img"
                  />
                ) : (
                  <span>{user.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="sidebar-user-email">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleSignOut} className="sidebar-logout">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
