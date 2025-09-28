'use client';

import React from 'react';
import DesktopSidebar from '../navigation/DesktopSidebar';
import MobileNavigation from '../navigation/MobileNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main Content */}
      <div className="lg:ml-64 pb-20 lg:pb-0">
        <main className={`min-h-screen ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
