// frontend/app/checkout/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Checkout() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Checkout State Flow ---
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Custom Success Modal State ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Cart State ---
  const [cartItems, setCartItems] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // --- Form Fields State ---
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');

  // --- Step 2: Shipping Options ---
  const [deliveryType, setDeliveryType] = useState('HOME_DELIVERY');
  const [deliveryCompany, setDeliveryCompany] = useState('Yalidine');

  // 1. On mount: Load Cart from LocalStorage and fetch corresponding Catalog items
  useEffect(() => {
    const loadCartAndProducts = async () => {
      // Security Guard: Redirect guests immediately to login
      if (!user && !authLoading) {
        router.push('/login');
        return;
      }

      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (savedCart.length === 0) {
          setTimeout(() => setCartLoading(false), 0);
          return;
        }

        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const products = await response.json();
          setCatalogProducts(products);

          const enrichedCart = savedCart.map(cartItem => {
            const matchedProduct = products.find(p => p._id === cartItem.product);
            return {
              ...cartItem,
              details: matchedProduct || null
            };
          }).filter(item => item.details !== null);

          setCartItems(enrichedCart);
        }
      } catch (err) {
        console.error('Error loading checkout cart details:', err);
      } finally {
        setCartLoading(false);
      }
    };

    // Pre-populate email and name asynchronously if the user is already logged in
    if (user) {
      setTimeout(() => {
        setEmail(user.email || '');
        setFullname(user.name || '');
      }, 0);
    }

    loadCartAndProducts();
  }, [user, authLoading]);

  const handleNextStep = () => {
    if (!email || !phone || !fullname || !wilaya || !commune || !address) {
      setError('Please fill in all contact and shipping address fields.');
      return;
    }
    setError('');
    setCheckoutStep(2);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user || !token) {
      setError('You must be logged in to complete your purchase.');
      setLoading(false);
      return;
    }

    const compiledShippingAddress = `${address}, ${commune}, Wilaya: ${wilaya}`;
    const formattedItems = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity
    }));

    const payload = {
      items: formattedItems,
      shippingAddress: compiledShippingAddress,
      phoneNumber: phone,
      deliveryCompany,
      deliveryType
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('cart');
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
          router.push('/');
        }, 2500);

      } else {
        setError(data.message || 'Error processing checkout.');
        setLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to the checkout server.');
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscounts = 0;

    cartItems.forEach(item => {
      if (item.details) {
        const itemSubtotal = item.details.price * item.quantity;
        subtotal += itemSubtotal;

        if (item.details.discountPercentage > 0) {
          totalDiscounts += ((item.details.price * item.details.discountPercentage) / 100) * item.quantity;
        }
      }
    });

    const shippingEstimate = deliveryType === 'STOP_DESK' ? 300 : 500;
    const finalTotal = subtotal - totalDiscounts + shippingEstimate;

    return {
      subtotal,
      totalDiscounts,
      shippingEstimate,
      finalTotal
    };
  };

  const totals = calculateTotals();

  if (cartLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center font-body-lg text-primary bg-background">
        Compiling your clinical checkout cart...
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background gap-6">
        <h2 className="text-2xl font-light text-primary">Your shopping cart is empty.</h2>
        <p className="text-on-surface-variant text-body-md max-w-md">Add some personalized dermatological care products to your catalog to proceed.</p>
        <Link href="/catalog" className="px-8 py-3 bg-secondary text-white rounded-full font-semibold shadow hover:bg-secondary/90 transition-colors">
          Browse Catalog
        </Link>
      </main>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen relative">
      
      <Navbar />

      {/* Main Layout Grid */}
      <main className="max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop mt-8 pt-20 mb-section-gap flex flex-col-reverse lg:flex-row gap-gutter">
        
        {/* ================= LEFT COLUMN: FORM SECTIONS ================= */}
        <div className="w-full lg:w-[60%] flex flex-col space-y-6">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">Checkout</h1>
          
          {/* Progress Indicator */}
          <div className="w-full space-y-2 mb-6 mt-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-[0.15em]">
                {checkoutStep === 1 ? 'Contact & Details' : 'Shipping & Payment'}
              </span>
              <span className="text-[10px] font-medium text-secondary">Step {checkoutStep} of 2</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-300"
                style={{ width: checkoutStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {checkoutStep === 1 ? (
            /* ================= STEP 1 FORM ================= */
            <div className="space-y-8">
              {/* Contact Information */}
              <section className="space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">contact_mail</span>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1 relative pt-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="email">Email Address</label>
                    <input 
                      className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md" 
                      id="email" 
                      placeholder="you@example.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1 relative pt-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="phone">Phone Number</label>
                    <input 
                      className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md" 
                      id="phone" 
                      placeholder="+213 XX XX XX XX" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Details */}
              <section className="space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  Delivery Details
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1 relative pt-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="fullname">Full Name</label>
                    <input 
                      className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md" 
                      id="fullname" 
                      placeholder="Jane Doe" 
                      type="text"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1 relative pt-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="wilaya">Wilaya (Province)</label>
                      <select 
                        className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md appearance-none" 
                        id="wilaya"
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                      >
                        <option disabled value="">Select Wilaya</option>
                        <option value="Setif">19 - Setif</option>
                        <option value="Alger">16 - Alger</option>
                        <option value="Oran">31 - Oran</option>
                        <option value="Constantine">25 - Constantine</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-5 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                    <div className="flex flex-col space-y-1 relative pt-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="commune">Commune</label>
                      <input 
                        className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md" 
                        id="commune" 
                        placeholder="City/District" 
                        type="text"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 relative pt-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 bg-surface-container-low absolute top-0 left-2 px-1 z-10" htmlFor="address">Detailed Address</label>
                    <input 
                      className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md" 
                      id="address" 
                      placeholder="Street, Building, Apartment" 
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Continue Action */}
              <button 
                onClick={handleNextStep}
                className="w-full bg-secondary hover:bg-on-secondary-fixed-variant text-white font-body-lg text-body-lg py-4 rounded-full shadow-[0_8px_30px_rgba(0,104,118,0.2)] transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 mt-12"
              >
                Next <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* ================= STEP 2 FORM ================= */
            <div className="space-y-8">
              {/* Delivery Methods & Carriers */}
              <section className="space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  Shipping Options
                </h2>
                
                <div className="space-y-6">
                  {/* Delivery Method Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setDeliveryType('HOME_DELIVERY')}
                      className={`rounded-xl p-4 cursor-pointer relative shadow-sm transition-all border-2 ${
                        deliveryType === 'HOME_DELIVERY' 
                          ? 'bg-surface-container-lowest border-secondary' 
                          : 'bg-surface-container-low border-surface-variant hover:border-secondary'
                      }`}
                    >
                      {deliveryType === 'HOME_DELIVERY' && (
                        <div className="absolute top-2 right-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        </div>
                      )}
                      <h3 className="font-body-md font-medium text-on-surface">Home Delivery</h3>
                      <p className="font-label-sm text-on-surface-variant">Delivered to your door</p>
                    </div>

                    <div 
                      onClick={() => setDeliveryType('STOP_DESK')}
                      className={`rounded-xl p-4 cursor-pointer relative shadow-sm transition-all border-2 ${
                        deliveryType === 'STOP_DESK' 
                          ? 'bg-surface-container-lowest border-secondary' 
                          : 'bg-surface-container-low border-surface-variant hover:border-secondary'
                      }`}
                    >
                      {deliveryType === 'STOP_DESK' && (
                        <div className="absolute top-2 right-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        </div>
                      )}
                      <h3 className="font-body-md font-medium text-on-surface">Delivery Desk (Stop Desk)</h3>
                      <p className="font-label-sm text-on-surface-variant">Pick up from a local agency</p>
                    </div>
                  </div>

                  {/* Select Carrier */}
                  <div>
                    <h4 className="font-label-sm text-label-sm text-on-surface-variant mb-3 uppercase tracking-wider">Select Carrier</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Yalidine Express */}
                      <div 
                        onClick={() => setDeliveryCompany('Yalidine')}
                        className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${
                          deliveryCompany === 'Yalidine' 
                            ? 'bg-surface-container-lowest border-secondary' 
                            : 'bg-surface-container-low border-surface-variant hover:border-secondary'
                        }`}
                      >
                        <h3 className="font-body-md font-medium text-on-surface">Yalidine Express</h3>
                        <p className="font-label-sm text-on-surface-variant">2-3 Business Days</p>
                      </div>

                      {/* ZR Express */}
                      <div 
                        onClick={() => setDeliveryCompany('Nord et Sud')}
                        className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${
                          deliveryCompany === 'Nord et Sud' 
                            ? 'bg-surface-container-lowest border-secondary' 
                            : 'bg-surface-container-low border-surface-variant hover:border-secondary'
                        }`}
                      >
                        <h3 className="font-body-md font-medium text-on-surface">ZR Express</h3>
                        <p className="font-label-sm text-on-surface-variant">1-2 Business Days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method Block */}
              <section className="space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  Payment Method
                </h2>
                <div className="border-2 border-secondary bg-surface-container-lowest rounded-lg p-6 flex items-start gap-4 cursor-pointer relative shadow-[0_4px_20px_rgba(0,104,118,0.05)] transition-transform duration-300 hover:scale-[1.01]">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                  </div>
                  <div>
                    <h3 className="font-body-lg text-body-lg text-primary font-medium">Cash on Delivery</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Pay when you receive your order in perfect condition.</p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1 border border-surface-variant text-on-surface-variant font-body-lg text-body-lg py-4 rounded-full transition-colors active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span> Back
                </button>
                
                <button 
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="flex-[2] bg-secondary hover:bg-on-secondary-fixed-variant text-white font-body-lg text-body-lg py-4 rounded-full shadow-[0_8px_30px_rgba(0,104,118,0.2)] transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Confirm Order'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          <p className="text-center font-label-sm text-label-sm text-on-surface-variant">By confirming your order, you agree to our Terms of Service and Privacy Policy.</p>
        </div>

        {/* ================= RIGHT COLUMN: ORDER SUMMARY (40%) ================= */}
        <div className="w-full lg:w-[40%] bg-surface-container-low border border-surface-variant rounded-xl p-8 sticky top-28 h-fit shadow-[0_10px_40px_rgba(93,42,130,0.03)]">
          <h2 className="font-headline-md text-headline-md text-primary mb-6 pb-4 border-b border-surface-variant">Order Summary</h2>
          
          {/* Cart Items */}
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.product} className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-DEFAULT overflow-hidden bg-surface-container-lowest flex-shrink-0 border border-surface-variant">
                  <img alt={item.details?.name} className="w-full h-full object-cover mix-blend-multiply" src={item.details?.imageUrl} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-body-md text-body-md font-medium text-on-surface line-clamp-1">{item.details?.name}</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{item.details?.category} • Clinical Strength</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-body-md text-body-md font-medium text-primary">{(item.details?.price || 0).toLocaleString()} DZD</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Code Input */}
          <div className="mb-8 relative flex items-center">
            <input className="dunia-input rounded-DEFAULT px-4 py-3 w-full font-body-md pr-24" placeholder="Promo code" type="text" />
            <button className="absolute right-2 top-2 bottom-2 bg-surface-container-highest hover:bg-tertiary-container hover:text-white text-on-surface font-label-sm text-label-sm px-4 rounded-DEFAULT transition-colors duration-200">Apply</button>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 border-t border-surface-variant pt-6 mb-6">
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Subtotal</span>
              <span>{totals.subtotal.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Shipping Estimate</span>
              <span>{totals.shippingEstimate.toLocaleString()} DZD</span>
            </div>
            {totals.totalDiscounts > 0 && (
              <div className="flex justify-between font-body-md text-body-md text-secondary font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span> Applied Catalog Discounts
                </span>
                <span>- {totals.totalDiscounts.toLocaleString()} DZD</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center border-t border-surface-variant pt-6">
            <span className="font-headline-md text-headline-md text-on-surface">Total</span>
            <span className="font-headline-md text-headline-md font-semibold text-primary">{totals.finalTotal.toLocaleString()} DZD</span>
          </div>
          <p className="text-right font-label-sm text-label-sm text-on-surface-variant mt-1">Including VAT</p>
        </div>

      </main>

      <Footer />

      {/* ================= PREMIUM CLINICAL LUXURY SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-md transition-all duration-500">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] p-10 md:p-12 max-w-md w-full text-center relative shadow-[0_20px_50px_rgba(69,13,106,0.12)] animate-slide-in-up">
            
            {/* Elegant Circular Success Icon */}
            <div className="w-20 h-20 bg-[#E8F6F8] rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>check</span>
              </div>
            </div>
            
            {/* Editorial Content */}
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] mb-3 block">Order Confirmed</span>
            <h2 className="text-[#1F2937] font-display-lg-mobile text-display-lg-mobile md:text-[28px] font-light tracking-tight mb-4">
              Your canvas is ready.
            </h2>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-8">
              Thank you for choosing pharmaceutical elegance. We are preparing your personalized routine.
            </p>
            
            {/* Animated Progress Loader Line */}
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden relative">
              <div className="h-full bg-secondary rounded-full animate-progress-load w-full origin-left"></div>
            </div>
            <p className="text-[10px] text-outline mt-3 uppercase tracking-widest">Redirecting to home...</p>
          </div>
        </div>
      )}

    </div>
  );
}