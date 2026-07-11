// frontend/app/admin/layout.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [authLoading, setAuthLoading] = useState(true);

  // Strict Security Constraint: Only allow logged-in ADMINS
  useEffect(() => {
    const verifyAdmin = () => {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      } else {
        setAuthLoading(false);
      }
    };

    setTimeout(verifyAdmin, 0);
  }, [user]);

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center font-body-lg text-primary bg-background">
        Verifying administrator credentials...
      </main>
    );
  }

  return (
    <div className="text-gray-800 min-h-screen flex bg-[#F9FAFB] font-sans w-full">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen z-40">
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDskH8uN5CFTXUknT7SE8XS7gCltxdKsgd6hezsOW7XXyGNjxFZUXSbiyYWAPFBQITNnyY_Zybey4GpwwiTpVneZiY9Tia4vWHwqG5p9_oZx03jvEgIsL0g9owEvQcFAEQ6-lOI0b2ccCY7ocBXXxQ483Rct3K44yDoPj4JDlNywaZ2ARhIcY1g5vD9O9bDlxQzY_FPWEB92P3lAkXg40wvFs2HQsUkUYWsWgNvKOtCrtNvETvGBioo1N7sutUKJo61Mfw2JQM9Fs6T" 
            alt="DUNIA" 
            className="h-8 w-auto object-contain" 
          />
          <span className="ml-2 text-[10px] uppercase tracking-widest text-gray-400">Clinical</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <Link 
            className={`flex items-center px-3 py-2.5 rounded-lg border-l-4 transition-colors ${
              pathname === '/admin' 
                ? 'bg-purple-50 text-primary border-primary' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
            }`} 
            href="/admin"
          >
            <span className={`material-symbols-outlined mr-3 ${pathname === '/admin' ? 'icon-fill' : ''}`}>dashboard</span>
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Inventory (New Product) */}
          <Link 
            className={`flex items-center px-3 py-2.5 rounded-lg border-l-4 transition-colors ${
              pathname === '/admin/inventory' 
                ? 'bg-purple-50 text-primary border-primary' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
            }`} 
            href="/admin/inventory"
          >
            <span className={`material-symbols-outlined mr-3 ${pathname === '/admin/inventory' ? 'icon-fill' : ''}`}>inventory_2</span>
            <span className="font-medium">Inventory</span>
          </Link>

          {/* Bundles (New Bundle) */}
          <Link 
            className={`flex items-center px-3 py-2.5 rounded-lg border-l-4 transition-colors ${
              pathname === '/admin/bundles' 
                ? 'bg-purple-50 text-primary border-primary' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
            }`} 
            href="/admin/bundles"
          >
            <span className={`material-symbols-outlined mr-3 ${pathname === '/admin/bundles' ? 'icon-fill' : ''}`}>view_cozy</span>
            <span className="font-medium">Bundles</span>
          </Link>

          {/* Orders */}
          <Link 
            className={`flex items-center px-3 py-2.5 rounded-lg border-l-4 transition-colors ${
              pathname === '/admin/orders' 
                ? 'bg-purple-50 text-primary border-primary' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
            }`} 
            href="/admin/orders"
          >
            <span className={`material-symbols-outlined mr-3 ${pathname === '/admin/orders' ? 'icon-fill' : ''}`}>shopping_cart</span>
            <span className="font-medium">Orders</span>
          </Link>

          {/* Customers (Dynamic Sidebar Link) */}
          <Link 
            className={`flex items-center px-3 py-2.5 rounded-lg border-l-4 transition-colors ${
              pathname === '/admin/customers' 
                ? 'bg-purple-50 text-primary border-primary' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
            }`} 
            href="/admin/customers"
          >
            <span className={`material-symbols-outlined mr-3 ${pathname === '/admin/customers' ? 'icon-fill' : ''}`}>groups</span>
            <span className="font-medium">Customers</span>
          </Link>

          {/* Logout */}
          <button 
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-error hover:bg-red-50 transition-colors rounded-lg border-l-4 border-transparent mt-8"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {user ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">{user ? user.name : 'Admin'}</p>
              <p className="text-[10px] text-gray-500">Store Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT WORKSPACE COLUMN ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-20 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm md:shadow-none">
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 mr-4">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-xl font-black tracking-tighter text-primary">DUNIA</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full bg-gray-100 border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:bg-white focus:border-primary transition-all text-gray-900 placeholder-gray-500" 
              placeholder="Search orders, products, or customers..." 
              type="text" 
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-900 relative p-2">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-gray-500 hover:text-gray-900 p-2 hidden sm:block">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="flex-grow">
          {children}
        </div>

      </div>
    </div>
  );
}