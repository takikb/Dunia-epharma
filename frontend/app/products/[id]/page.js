// frontend/app/products/[id]/page.js
'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar'; // 3 levels up to components
import Footer from '../../../components/Footer'; // 3 levels up to components
import { useAuth } from '../../../context/AuthContext'; // 3 levels up to context

// Fallback Catalog database (for mock item viewing when offline)
const MOCK_CATALOG = {
  "mock1": {
    name: "Hyaluronic Acid 2% + B5",
    description: "Deep hydration and barrier support for all skin types. Formulated with pure hyaluronic acid to lock in moisture and Vitamin B5 to soothe the lipid matrix.",
    price: 2400,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLt1MRDIgA_3fTt-yjhq2HB5oeolXTE_11oBPFQWtwUHqHB7zJN5jDdT7K6nu08leaqloaZud21RyA-OtK-rDBH1uOR-MHeJLxEETOQQM9lyuQ6UbWTxgmi1AU7wbsJ5egIn1QkxPUwZh6Ks6r_rGOXaxZmC4sDXYu8RyqgQgH9uru6Do9RQuRGGBc3kdGy1BBDBjpiTGT1nceYDggh_rKXkGcvdjUtYhji7EM3_16NiXr8lkBYs8Ws1rwaz",
    category: "Serum",
    tags: ["for-normal-skin", "hydrating"],
    ingredients: "Aqua (Water), Sodium Hyaluronate, Pentylene Glycol, Panthenol, Phenoxyethanol."
  },
  "mock2": {
    name: "Ceramide Repair Cream",
    description: "Rich, soothing skin cream formulated with skin-identical ceramides and hydrating lipids to completely restore compromised skin barriers.",
    price: 3100,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvxkzl304-v-613D54MyDI-zq6z-qYCrqTsuqQEoxec-i7UsBxr4foIoqDXQpx_MSsl38mBtVTob9WFbw0iCqyxstcEJS_Ws9qjsfQMCfiQJ7nNIZFQNbhcLe8ee3MjXYFM5QgfmMaclgY-NY552QJNBMCZxm6tUjZyzdD3z2BIsGp3mH8H0CPCJ4-oGzWoo33k0UdVou9dxsrqouh5QGegBkdPMfawvrsQR9M-o0c1JLj_uDNhxkL0h2pz",
    category: "Moisturizer",
    tags: ["for-dry-skin", "soothing"],
    ingredients: "Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Glycerin."
  },
  "mock3": {
    name: "Gentle Salicylic Acid Cleanser",
    description: "A purifying, non-stripping gel cleanser that gently exfoliates dead skin cells, clears congested pores, and regulates sebum without causing irritation.",
    price: 4200,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvTA17G1JI4oNPdM16ziyIs9pHtCoNFkZ-cJOVAkTcHQk7DcuOPuE2JFvv2nHp4VB6howZyWupqT9XfwpxDEVIDWl52YvCMZzX72_OFw9w6pxdEiHDOW-JNxIYu2TGwwSRc-qK2St0rB8d2hRJE5cgyc4rqq-dukX0s9pA_dJcxIiUTWEv33tnCOF3Ac1WOt2JiYE9xpm_uxA_bjh3MdkTEJ7Q3hTsekoUoPUxPurpaCt2ymUBbsOug-cY",
    category: "Cleanser",
    tags: ["for-oily-skin", "anti-acne"],
    ingredients: "Aqua (Water), Cocamidopropyl Dimethylamine, Salicylic Acid, Glycerin, Phenoxyethanol."
  },
  "mock4": {
    name: "Retinol 0.5% in Squalane",
    description: "Highly stable, water-free solution containing 0.5% pure Retinol in plant-derived Squalane. Accelerates cellular renewal for diminished fine lines and uniform tone.",
    price: 2800,
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsbfbLAIFkLFGDrtTRhw6x0wmmtEp1cGUm5odyyKAkKih8ZyC_RR4LPl8K8qnWwBuMyEXsTMDb3rKa3ZbpZd6AbuU7OYwMk_LRdMYgv8zVn4v7WAJZjFPnZ2VIav6CLv3dTRZhhtCbvxes8HG-BhPMfYPw2x7BN03JJAl0-EDspIzwTSEavSOzQkQHFPBMDw8y0MuOwL38VfEVcT1v8LzQow-MnH-H9yXm5llyrxkziZnpaNykNlbQk-S0y",
    category: "Treatment",
    tags: ["for-normal-skin", "anti-aging"],
    ingredients: "Squalane, Caprylic/Capric Tryglyceride, Retinol, Solanum Lycopersicum Fruit Extract."
  }
};

export default function ProductDetail({ params }) {
  // 1. Safely unwrap page params Promise for Next.js 16 (Turbopack)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { user } = useAuth();

  // --- States ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  // --- Custom Luxury Toast Alert State ---
  const [toast, setToast] = useState({ show: false, message: '' });

  // 2. Fetch Single Product details from live backend or fallback to mock catalog
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/single/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedImage(data.imageUrl);
        } else if (MOCK_CATALOG[id]) {
          // Render mock item directly if matched
          setProduct(MOCK_CATALOG[id]);
          setSelectedImage(MOCK_CATALOG[id].imageUrl);
        }
      } catch (err) {
        console.log('⚠️ Backend offline. Displaying local dynamic mock product details.');
        if (MOCK_CATALOG[id]) {
          setProduct(MOCK_CATALOG[id]);
          setSelectedImage(MOCK_CATALOG[id].imageUrl);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 3. Multiplier logic handlers
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => {
    setQuantity(quantity + 1);
  };

  // 4. Custom Add to Cart (Adds the selected quantity instead of 1)
  const handleAddToCart = () => {
    if (!product) return;

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const productId = product._id || id;
      const existingItemIndex = cart.findIndex((item) => item.product === productId);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({ product: productId, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Trigger our beautiful glassmorphic alert
      setToast({ show: true, message: `✅ Added ${quantity}x ${product.name} to your shopping cart!` });
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 2500);

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-40 pb-20 text-center font-body-lg text-primary">
          Compiling pristine clinical details...
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-40 pb-20 text-center font-body-lg text-error">
          ⚠️ Product details not found in registry.
        </main>
      </>
    );
  }

  // Check if skin matches user's profile
  const isPerfectMatch = user && product.tags && product.tags.includes(`for-${user.customerProfile.skinType.toLowerCase()}-skin`);

  // Compile the final gallery list to display
  const galleryList = product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [];

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-section-gap px-container-padding-mobile md:px-container-padding-desktop max-w-[1440px] mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-12" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/catalog" className="hover:text-primary transition-colors">Products</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-medium">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-6">
            {/* Main Canvas image (Dynamically swaps based on state) */}
            <div className="bg-[#F9FAFB] rounded-[40px] aspect-square flex items-center justify-center overflow-hidden ambient-shadow relative group">
              <img 
                alt={product.name} 
                className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" 
                src={selectedImage} 
              />
            </div>
            
            {/* Dynamic Thumbnails selector (Automatically handles 4 uploaded images or falls back to 3 mock ones) */}
            <div className={`grid gap-4 ${galleryList.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {galleryList.length > 0 ? (
                /* Dynamic Gallery (Populated straight from Cloudinary) */
                galleryList.map((url, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className={`bg-[#F9FAFB] rounded-2xl aspect-square overflow-hidden border-2 focus:outline-none p-2 transition-colors ${
                      selectedImage === url ? 'border-secondary' : 'border-transparent hover:border-surface-variant'
                    }`}
                  >
                    <img alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply opacity-90" src={url} />
                  </button>
                ))
              ) : (
                /* Standard Fallback Mock Gallery (Your original 3-column layout) */
                <>
                  <button 
                    onClick={() => setSelectedImage(product.imageUrl)}
                    className={`bg-[#F9FAFB] rounded-2xl aspect-square overflow-hidden border-2 focus:outline-none p-2 transition-colors ${
                      selectedImage === product.imageUrl ? 'border-secondary' : 'border-transparent hover:border-surface-variant'
                    }`}
                  >
                    <img alt="Main View" className="w-full h-full object-contain mix-blend-multiply opacity-90" src={product.imageUrl} />
                  </button>
                  <button 
                    onClick={() => setSelectedImage("https://lh3.googleusercontent.com/aida-public/AB6AXuDsMnGtA10QyGRzXZ6Xq8oHb3zW2QLfMfNgq2A2sC0Wy1B0HyLBGqNlussZ-tMGnpZQ6z24eZLaGSz0tMKx9SJVwLYoqjpZ9Bwn9fCncPzuTQEFMln1z7-rdtLjFLOPL1Y23-AyhbnSNiXLURsY0unmR32X9bKh17EBE01KfnBGWBWU-8guS1NGM4fFH43t3dWS4kf-7sFIgMF3ZMxfu5aqv6HA6raJTUNvdGAPQANZiT-UBx8pRh5U5IjJgEdTwe2uw6DA3442GY9e")}
                    className={`bg-[#F9FAFB] rounded-2xl aspect-square overflow-hidden border-2 focus:outline-none p-2 transition-colors ${
                      selectedImage.includes('AB6AXuDsMnG') ? 'border-secondary' : 'border-transparent hover:border-surface-variant'
                    }`}
                  >
                    <img alt="Droplet Macro View" className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsMnGtA10QyGRzXZ6Xq8oHb3zW2QLfMfNgq2A2sC0Wy1B0HyLBGqNlussZ-tMGnpZQ6z24eZLaGSz0tMKx9SJVwLYoqjpZ9Bwn9fCncPzuTQEFMln1z7-rdtLjFLOPL1Y23-AyhbnSNiXLURsY0unmR32X9bKh17EBE01KfnBGWBWU-8guS1NGM4fFH43t3dWS4kf-7sFIgMF3ZMxfu5aqv6HA6raJTUNvdGAPQANZiT-UBx8pRh5U5IjJgEdTwe2uw6DA3442GY9e" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage("https://lh3.googleusercontent.com/aida-public/AB6AXuBRnF2dSzUjsYFzvMud2EcVjPFKECyeUagJNKgwQnBfjp9oUXzyqzYDhlz0BVJZqf8acKyh6tztfjwL7H0OgXxzuhZy42g39QDDyNZTgYCEXhoUHSLYMqROV04Y2sw-P5Tn22Y1heerBakWmZNfND3vYJ9-iEfiA2OIFFfqoxv3k5cPCrT0u9-_addZIe9dmny65pdE9EBl4iDxApnygghQqqBD0TO7556ICYFef3WgZDeo58-JHM5Fw5un6a0nbWo4TP-3B-lsxYgB")}
                    className={`bg-[#F9FAFB] rounded-2xl aspect-square overflow-hidden border-2 focus:outline-none p-2 transition-colors ${
                      selectedImage.includes('AB6AXuBRnF2') ? 'border-secondary' : 'border-transparent hover:border-surface-variant'
                    }`}
                  >
                    <img alt="Label Detail View" className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRnF2dSzUjsYFzvMud2EcVjPFKECyeUagJNKgwQnBfjp9oUXzyqzYDhlz0BVJZqf8acKyh6tztfjwL7H0OgXxzuhZy42g39QDDyNZTgYCEXhoUHSLYMqROV04Y2sw-P5Tn22Y1heerBakWmZNfND3vYJ9-iEfiA2OIFFfqoxv3k5cPCrT0u9-_addZIe9dmny65pdE9EBl4iDxApnygghQqqBD0TO7556ICYFef3WgZDeo58-JHM5Fw5un6a0nbWo4TP-3B-lsxYgB" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            
            {/* Dynamic AI Compatibility Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm shadow-sm">
                {isPerfectMatch 
                  ? `✨ 98% Match for your ${user.customerProfile.skinType} Skin` 
                  : '✨ Prescribed Clinical Care Product'}
              </span>
            </div>

            {/* Titles & Price */}
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg font-light tracking-tight text-on-surface mb-2">
              {product.name}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
              {product.category} Formulation
            </p>
            <div className="font-headline-md text-headline-md text-primary font-medium mb-8">
              {product.price ? product.price.toLocaleString() : '---'} DZD
            </div>

            {/* Description */}
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8 max-w-prose">
              {product.description}
            </p>

            {/* Key Ingredients */}
            <div className="mb-10">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-3 uppercase tracking-wider">Key Active Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Pure {product.category} Base</span>
                {product.tags && product.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase">
                    {tag.replace('for-', '').replace('-skin', '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart Actions */}
            <div className="flex items-center gap-4 mb-12">
              {/* Quantity Selector State */}
              <div className="flex items-center bg-[#F9FAFB] rounded-full border border-surface-variant px-2 h-14">
                <button onClick={decreaseQty} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="font-body-md text-body-md w-8 text-center text-on-surface">{quantity}</span>
                <button onClick={increaseQty} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>

              {/* Dynamic Add to Cart CTA */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-secondary text-white rounded-full font-label-sm text-label-sm tracking-wide shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                Add to Cart
              </button>
            </div>

            {/* Dynamic Accordions */}
            <div className="border-t border-surface-variant divide-y divide-surface-variant">
              <details className="group py-5 cursor-pointer" open>
                <summary className="flex items-center justify-between font-body-md text-body-md font-medium text-on-surface list-none">
                  How to Use
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-45 text-on-surface-variant">add</span>
                </summary>
                <div className="pt-4 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Apply 2-3 drops to entire face morning and evening before heavier creams. If irritation occurs, cease use and consult a physician. Use only as directed on unbroken skin. Patch testing prior to use is advised.
                </div>
              </details>

              <details className="group py-5 cursor-pointer">
                <summary className="flex items-center justify-between font-body-md text-body-md font-medium text-on-surface list-none">
                  Full Ingredients
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-45 text-on-surface-variant">add</span>
                </summary>
                <div className="pt-4 font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm">
                  {product.ingredients || 'Aqua (Water), Pentylene Glycol, Phenoxyethanol, Tamarindus Indica Seed Gum, Xanthan gum, Isoceteth-20, Chlorphenesin.'}
                </div>
              </details>

              <details className="group py-5 cursor-pointer">
                <summary className="flex items-center justify-between font-body-md text-body-md font-medium text-on-surface list-none">
                  Shipping &amp; Returns
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-45 text-on-surface-variant">add</span>
                </summary>
                <div className="pt-4 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Complimentary standard shipping on all orders over 10,000 DZD. Returns accepted within 30 days for unopened products in their original packaging.
                </div>
              </details>
            </div>

          </div>
        </div>
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