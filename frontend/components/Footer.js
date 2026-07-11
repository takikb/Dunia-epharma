// frontend/src/components/Footer.jsx
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-surface-container-low pt-20 pb-base w-full">
      <div className="px-container-padding-mobile md:px-container-padding-desktop py-12 grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-[1440px] mx-auto border-t border-surface-variant">
        {/* Logo and Tagline */}
        <div className="col-span-1 flex flex-col gap-6">
          <Link href="/" className="font-headline-md text-headline-md tracking-widest font-light text-primary uppercase">
            DUNIA
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Precision meets indulgence in every drop.
          </p>
        </div>

        {/* Quick Links Map */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-2">Explore</h4>
            <Link href="/about" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">About Us</Link>
            <Link href="/ingredients" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">Ingredients</Link>
            <Link href="/clinical" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">Clinical Studies</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-2">Support</h4>
            <Link href="/shipping" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">Shipping</Link>
            <Link href="/contact" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">Contact</Link>
            <Link href="/terms" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:translate-x-1 transition-transform duration-200">Terms of Service</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="col-span-1 flex flex-col gap-6 items-start md:items-end">
          <p className="font-body-md text-body-md text-on-surface-variant opacity-80 md:text-right">
            © {new Date().getFullYear()} DUNIA Parapharmacie. Precision meets indulgence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;