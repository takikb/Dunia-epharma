// frontend/app/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar'; // Standardized relative import matching file casing
import Footer from '../components/Footer'; // Standardized relative import matching file casing
import { useAuth } from '../context/AuthContext'; // Imported global auth context

// Fallback Mock Products (Preserving your exact HTML text, prices, categories, and images)
const MOCK_PRODUCTS = [
  {
    _id: "mock1",
    name: "Hyaluronic Acid 2% + B5",
    description: "Deep hydration and barrier support for all skin types.",
    price: 2400,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLt1MRDIgA_3fTt-yjhq2HB5oeolXTE_11oBPFQWtwUHqHB7zJN5jDdT7K6nu08leaqloaZud21RyA-OtK-rDBH1uOR-MHeJLxEETOQQM9lyuQ6UbWTxgmi1AU7wbsJ5egIn1QkxPUwZh6Ks6r_rGOXaxZmC4sDXYu8RyqgQgH9uru6Do9RQuRGGBc3kdGy1BBDBjpiTGT1nceYDggh_rKXkGcvdjUtYhji7EM3_16NiXr8lkBYs8Ws1rwaz",
    category: "Serum",
    discountPercentage: 15,
    tags: ["for-normal-skin", "hydrating"]
  },
  {
    _id: "mock2",
    name: "Ceramide Repair Cream",
    description: "Rich nourishment for compromised skin barriers.",
    price: 3100,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvxkzl304-v-613D54MyDI-zq6z-qYCrqTsuqQEoxec-i7UsBxr4foIoqDXQpx_MSsl38mBtVTob9WFbw0iCqyxstcEJS_Ws9qjsfQMCfiQJ7nNIZFQNbhcLe8ee3MjXYFM5QgfmMaclgY-NY552QJNBMCZxm6tUjZyzdD3z2BIsGp3mH8H0CPCJ4-oGzWoo33k0UdVou9dxsrqouh5QGegBkdPMfawvrsQR9M-o0c1JLj_uDNhxkL0h2pz",
    category: "Moisturizer",
    discountPercentage: 0,
    tags: ["for-dry-skin", "soothing"]
  },
  {
    _id: "mock3",
    name: "Gentle Salicylic Acid Cleanser",
    description: "Exfoliates without stripping essential moisture.",
    price: 4200,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvTA17G1JI4oNPdM16ziyIs9pHtCoNFkZ-cJOVAkTcHQk7DcuOPuE2JFvv2nHp4VB6howZyWupqT9XfwpxDEVIDWl52YvCMZzX72_OFw9w6pxdEiHDOW-JNxIYu2TGwwSRc-qK2St0rB8d2hRJE5cgyc4rqq-dukX0s9pA_dJcxIiUTWEv33tnCOF3Ac1WOt2JiYE9xpm_uxA_bjh3MdkTEJ7Q3hTsekoUoPUxPurpaCt2ymUBbsOug-cY",
    category: "Cleanser",
    discountPercentage: 0,
    tags: ["for-oily-skin", "anti-acne"]
  },
  {
    _id: "mock4",
    name: "Retinol 0.5% in Squalane",
    description: "Anti-aging complex for nightly skin renewal.",
    price: 2800,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsbfbLAIFkLFGDrtTRhw6x0wmmtEp1cGUm5odyyKAkKih8ZyC_RR4LPl8K8qnWwBuMyEXsTMDb3rKa3ZbpZd6AbuU7OYwMk_LRdMYgv8zVn4v7WAJZjFPnZ2VIav6CLv3dTRZhhtCbvxes8HG-BhPMfYPw2x7BN03JJAl0-EDspIzwTSEavSOzQkQHFPBMDw8y0MuOwL38VfEVcT1v8LzQow-MnH-H9yXm5llyrxkziZnpaNykNlbQk-S0y",
    category: "Treatment",
    discountPercentage: 0,
    tags: ["for-normal-skin", "anti-aging"]
  }
];

export default function LandingPage() {
  const { user } = useAuth(); // Retrieve the logged-in user state

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Fetch live products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data = await response.json();
          // If backend has products, use them. Otherwise, fall back to mock data
          setProducts(data.length > 0 ? data.slice(0, 4) : MOCK_PRODUCTS);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (error) {
        console.log('⚠️ Backend offline. Displaying dynamic mock products.');
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Client-Side Add To Cart Function
  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = cart.findIndex((item) => item.product === product._id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({ product: product._id, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Trigger custom visual toast alert
      setToast({ show: true, message: `✅ Added ${product.name} to your shopping cart!` });

      // Automatically hide the alert after 2.5 seconds
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 2500);

    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-32 md:pt-40 pb-section-gap max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap mt-8">
          <div className="relative w-full min-h-[80vh] flex items-center justify-center bg-primary-fixed rounded-[40px] md:rounded-[60px] overflow-hidden p-8 md:p-20">
            <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-white/40 blur-3xl rounded-full mix-blend-overlay"></div>
            <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-secondary-fixed/30 blur-3xl rounded-full mix-blend-overlay"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
              
              {/* Hero Text */}
              <div className="max-w-xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md text-primary font-label-sm text-label-sm uppercase tracking-widest mb-8 border border-white/20">
                  The Soft Clinical Era
                </span>
                <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary-fixed mb-6 leading-tight">
                  Purity meets <br />
                  <span className="italic text-primary">profound efficacy.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-primary-fixed-variant mb-10 max-w-md opacity-90">
                  Experience skincare elevated by pharmaceutical rigor and softened by sensory indulgence. A calming ritual for your most vital organ.
                </p>
                <a 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-container hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary/20" 
                  href="#discover"
                >
                  Explore the Collection
                </a>
              </div>

              {/* Hero Image */}
              <div className="relative h-[50vh] lg:h-[70vh] w-full flex items-center justify-center">
                <div className="organic-shape overflow-hidden w-full h-full max-w-[500px] max-h-[600px] ambient-shadow relative bg-white/20 backdrop-blur-sm border border-white/40 p-4">
                  <img 
                    className="w-full h-full object-cover rounded-[inherit]" 
                    alt="A luxurious clinical skincare product lineup"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLvF8PVbk9vCvnZNzHttEAtQ_mPX5yYE1uXnFvYcTN2Iebq8moVuhxjxTSlh9yAKRXFFQ0QOXYEGC1GOGr0e6__CZtQL1hrh7drzkhY25AX50SONoUUs1pZEcTvHOVVM3aZx6vVIJPqyIlUkBoPNJEd8-w2AFKdubElBpFfXj_UAnvufJPGwxn9PPYxArRQ5Rv6dfqnwsgEhEQ03QHH7h5La7o68_vgL042KeyWIHaD4R_Ac1LetySuRzFY" 
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section (Soft Geometry) */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">The Dunia Protocol</h2>
            <div className="w-12 h-[1px] bg-outline-variant mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center soft-shadow-hover transition-all duration-500 group border border-transparent hover:border-surface-variant">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 300 }}>science</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-4">Dermatological Precision</h3>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80">Formulated with clinically-backed active ingredients at optimal concentrations for transformative results.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center soft-shadow-hover transition-all duration-500 group border border-transparent hover:border-surface-variant translate-y-4 md:translate-y-8">
              <div className="w-16 h-16 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 300 }}>spa</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-4">Sensorial Elegance</h3>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80">Textures that melt seamlessly into the skin, transforming routine application into a mindful daily ritual.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center soft-shadow-hover transition-all duration-500 group border border-transparent hover:border-surface-variant">
              <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 300 }}>water_drop</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-4">Barrier Integrity</h3>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80">Prioritizing the lipid matrix to ensure resilience, hydration retention, and protection against urban stressors.</p>
            </div>
          </div>
        </section>

        {/* Dynamic Products Catalog Grid */}
        <section id="discover" className="px-container-padding-mobile md:px-container-padding-desktop mb-section-gap">
          <div className="flex items-end justify-between mb-16 w-full">
            <div className="flex-1"></div>
            <div className="flex flex-col items-center text-center">
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Curated For You</h2>
              <div className="w-12 h-[1px] bg-outline-variant mx-auto"></div>
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/catalog" className="font-label-sm text-label-sm uppercase tracking-widest transition-all duration-300 hover:opacity-70 flex items-center gap-2" style={{ color: '#007580' }}>
                VIEW ALL
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              // Calculate discounted price
              const discountAmount = (product.price * product.discountPercentage) / 100;
              const finalPrice = product.price - discountAmount;

              return (
                <div key={product._id} className="group">
                  <div className="relative aspect-square bg-surface-container-low rounded-xl overflow-hidden mb-6 flex items-center justify-center p-8 soft-shadow-hover transition-all duration-500">
                    {/* Discount Badge */}
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-[10px] rounded-full uppercase tracking-widest">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                    <Link href={`/products/${product._id}`}>
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500 cursor-pointer" 
                        src={product.imageUrl} 
                      />
                    </Link>
                  </div>
                  <div className="px-2">
                    <span className="block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
                      {product.category}
                    </span>
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-body-lg font-semibold text-on-surface mb-2 hover:underline cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-body-md text-on-surface-variant opacity-80 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-headline-md text-primary">
                        {finalPrice.toLocaleString()} DZD
                      </span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Skin Quiz Callout Banner (Only visible if the user is not logged in) */}
        {!user && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop my-16">
            <div className="relative max-w-[1440px] mx-auto rounded-[2.5rem] overflow-hidden h-80 flex items-center justify-center">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  alt="Skincare products background" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLvF8PVbk9vCvnZNzHttEAtQ_mPX5yYE1uXnFvYcTN2Iebq8moVuhxjxTSlh9yAKRXFFQ0QOXYEGC1GOGr0e6__CZtQL1hrh7drzkhY25AX50SONoUUs1pZEcTvHOVVM3aZx6vVIJPqyIlUkBoPNJEd8-w2AFKdubElBpFfXj_UAnvufJPGwxn9PPYxArRQ5Rv6dfqnwsgEhEQ03QHH7h5La7o68_vgL042KeyWIHaD4R_Ac1LetySuRzFY" 
                />
              </div>
              {/* Glassmorphism Overlay */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl"></div>
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <h2 className="text-display-lg-mobile font-light mb-4 text-on-surface">Curious about what your skin really needs?</h2>
                <p className="text-on-surface-variant text-body-lg mb-8 max-w-xl">Take our 2-minute skin quiz and unlock the exact products that fit your unique profile.</p>
                <Link 
                  className="inline-flex items-center justify-center px-10 py-4 bg-primary-container text-on-primary rounded-full font-semibold shadow-lg hover:bg-primary transition-all duration-300" 
                  href="/register"
                >
                  Reveal Your Routine
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* ================= PREMIUM GLASSMORPHIC TOAST NOTIFICATION ================= */}
      {toast.show && (
        <div className="fixed bottom-10 right-10 z-50 glass-panel ambient-shadow rounded-xl px-6 py-4 flex items-center gap-3 animate-slide-in-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          </div>
          <p className="font-body-md text-on-surface font-semibold tracking-wide">
            {toast.message}
          </p>
        </div>
      )}
    </>
  );
}