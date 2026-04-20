import React, { useState } from 'react';
import { cn } from '@/lib/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const BridgeLogo = () => (
  <svg width="32" height="20" viewBox="0 0 60 37" fill="none">
    <path d="M2 31h56" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M10 31V19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M50 31V19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path
      d="M10 19C10 19 18 7 30 7C42 7 50 19 50 19"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}> = ({ icon, label, active = false, badge }) => (
  <button
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all',
      active
        ? 'bg-white bg-opacity-10 text-white'
        : 'text-white text-opacity-60 hover:text-opacity-80'
    )}
  >
    <span className="text-lg">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle = 'Dashboard',
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          'transition-all duration-200 bg-sidebar text-white flex flex-col',
          collapsed ? 'w-20' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-white border-opacity-10">
          {!collapsed && (
            <>
              <BridgeLogo />
              <span className="ml-2 font-bold">Bridge</span>
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 hover:bg-white hover:bg-opacity-10 rounded"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          <NavItem icon="📋" label="Queue" active={true} badge={3} />
          <NavItem icon="📊" label="Performance" />
          <NavItem icon="✓" label="Compliance" />
          <NavItem icon="⚙️" label="Policy" />
          <NavItem icon="👥" label="Team" />
        </nav>

        {/* User profile */}
        <div className="px-4 py-6 border-t border-white border-opacity-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <span className="font-bold">O</span>
            </div>
            {!collapsed && (
              <div className="text-sm">
                <p className="font-semibold">Officer</p>
                <p className="text-xs text-white text-opacity-60">james@bridge.co</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-15 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-text">{pageTitle}</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted">
              {new Date().toLocaleDateString()}
            </span>
            <div className="h-10 w-10 rounded-full bg-accent-bg flex items-center justify-center">
              <span className="text-sm font-bold text-accent">O</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
};
