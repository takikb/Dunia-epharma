// frontend/src/components/Navbar.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Allows us to show which page is active

  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // 1. Handle glassmorphism background blur adjustment on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Read LocalStorage cart on mount to calculate dynamic item counter
  useEffect(() => {
    const calculateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (error) {
        setCartCount(0);
      }
    };

    calculateCartCount();

    // Listen for storage events (e.g. if the user modifies cart in another tab)
    window.addEventListener('storage', calculateCartCount);
    return () => window.removeEventListener('storage', calculateCartCount);
  }, [pathname]); // Recalculates on page transitions to keep the badge up-to-date

  const handleOrdersClick = () => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/orders'); // Route to Customer Orders dashboard
    }
  };

  return (
    <header 
      id="main-nav" 
      className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop h-20 transition-all duration-300 backdrop-blur-md ${
        isScrolled 
          ? 'shadow-sm bg-white/95 border-b border-surface-variant/30' 
          : 'bg-white/80'
      }`}
    >
      {/* Brand Logo */}
      <div className="flex-1 flex items-center justify-start">
        <Link href="/" className="block h-10">
          <img 
            alt="DUNIA Logo" 
            className="h-full w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARpMrKLeUcFECoZZfs4WISrbLe8pf1joO4ORMVw1t5JZSFb7oBokg6vLsfBtQqAE8PI4vfyjWUnPIypz696CdWWFV8FY5nG7rLQUR9g5CF1vDeuyGiBmGZMIObcwoTcEwCHmRc4SvuBRMXIDhdGYApKEA6z4DA2ED5T4K2lzajMG2sqynRc5HWOhEi5WippGnZSNF2UvsE_9a1WdP7EWFpoqgQgf5eaNi9B5RIkpe-cTkxH5azXGahvbHyqxVBofLnM0UYwRiHG2GALG8" 
          />
        </Link>
      </div>

      {/* Dynamic Navigation Links: Aligned next to Home and Products */}
      <nav className="flex-grow hidden md:flex items-center justify-center gap-12">
        <Link 
          href="/" 
          className={`font-label-sm text-label-sm uppercase tracking-widest pb-1 transition-colors ${
            pathname === '/' 
              ? 'text-primary border-b-2 border-secondary font-semibold' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          HOME
        </Link>
        <Link 
          href="/catalog" 
          className={`font-label-sm text-label-sm uppercase tracking-widest pb-1 transition-colors ${
            pathname === '/catalog' 
              ? 'text-primary border-b-2 border-secondary font-semibold' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          PRODUCTS
        </Link>

        {/* Dynamic Orders Tab (Only displayed when logged in to satisfy your "keep clear on logout" rule) */}
        {user && (
          <Link 
            href="/orders" 
            className={`font-label-sm text-label-sm uppercase tracking-widest pb-1 transition-colors ${
              pathname === '/orders' 
                ? 'text-primary border-b-2 border-secondary font-semibold' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            ORDERS
          </Link>
        )}
      </nav>

      {/* Utilities Container (Dynamically cleared when logged out) */}
      <div className="flex-1 flex justify-end gap-4">
        {user ? (
          <>
            {/* Favorites (Only visible if logged in) */}
            <button aria-label="favorite" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors duration-300 rounded-full scale-95 active:scale-90 transition-transform">
              <span className="material-symbols-outlined">favorite</span>
            </button>

            {/* Dynamic Shopping Cart (Only visible if logged in) */}
            <Link 
              href="/checkout" 
              aria-label="shopping_cart" 
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors duration-300 rounded-full scale-95 active:scale-90 transition-transform flex items-center justify-center relative"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-secondary text-white font-semibold text-[9px] rounded-full flex items-center justify-center px-1 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <button 
              onClick={handleOrdersClick} 
              aria-label="person" 
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors duration-300 rounded-full scale-95 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">person</span>
            </button>

            {/* Secure Logout */}
            <button 
              onClick={logout} 
              aria-label="logout" 
              className="p-2 text-error hover:bg-error-container/20 transition-colors rounded-full scale-95 active:scale-90"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </>
        ) : (
          /* Cleared State: Clean, premium text Link to authenticate */
          <Link 
            href="/login" 
            className="font-label-sm text-label-sm uppercase tracking-widest text-primary hover:text-secondary transition-all px-6 py-2.5 rounded-full border border-primary/20 hover:border-secondary/40 shadow-sm active:scale-95"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;