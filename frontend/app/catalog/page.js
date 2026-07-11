// frontend/app/catalog/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

// Unified Predefined System Categories (Matching constants.ts exactly)
const SYSTEM_CATEGORIES = [
  { label: 'Skincare', value: 'Skincare' },
  { label: 'Haircare', value: 'Haircare' },
  { label: 'Bodycare', value: 'Bodycare' },
  { label: 'Baby & Mother', value: 'Baby & Mother' },
  { label: 'Hygiene', value: 'Hygiene' },
  { label: 'Supplements & Wellness', value: 'Supplements & Wellness' }
];

// Rich Fallback Catalog database (Expanded to 8 premium items across multiple categories)
const MOCK_CATALOG = [
  {
    _id: "mock1", 
    name: "Advanced Retinol Complex",
    description: "0.5% Pure Retinol Complex for nightly cellular skin renewal.",
    price: 8500,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaIQQLuNXHNBMWOtXu0snUoj4_CglUtqeMw9MahtLuzSjn9v5JcZ8WtCU736cCqnK4c4d-JB9oBcvNtrQD4X6IonHt2pMCh3HlNPqR1JSb7aJ-lEORhN-0XKPZ6Y07WF7ciAA5ZdhVWW1ceLydpvmECBeIcBuaV5qmbW7IJ5wA5pBQSPK8zYP1i8DI3_3eq8aNmhV9ohXLakrJGGqZEh_Q8ZHkitglvjQ296l7-nnWKxLo3Bh47MWGYGh2OI6nwoe22wJ8RzWHmJwU",
    category: "Skincare",
    discountPercentage: 0,
    tags: ["for-normal-skin", "anti-aging"],
    createdAt: "2026-07-09T12:00:00.000Z"
  },
  {
    _id: "mock2", 
    name: "Ceramide Repair Cream",
    description: "Rich nourishment to fully restore compromised skin barriers.",
    price: 3100,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuvxkzl304-v-613D54MyDI-zq6z-qYCrqTsuqQEoxec-i7UsBxr4foIoqDXQpx_MSsl38mBtVTob9WFbw0iCqyxstcEJS_Ws9qjsfQMCfiQJ7nNIZFQNbhcLe8ee3MjXYFM5QgfmMaclgY-NY552QJNBMCZxm6tUjZyzdD3z2BIsGp3mH8H0CPCJ4-oGzWoo33k0UdVou9dxsrqouh5QGegBkdPMfawvrsQR9M-o0c1JLj_uDNhxkL0h2pz",
    category: "Skincare",
    discountPercentage: 0,
    tags: ["for-dry-skin", "hydrating"],
    createdAt: "2026-07-10T12:00:00.000Z"
  },
  {
    _id: "mock3", 
    name: "Gentle Salicylic Acid Cleanser",
    description: "Exfoliates congested pores without stripping essential moisture.",
    price: 4200,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwNLsmrIaytihkpSNDy1PeL5NQGBkmqUuOAban9OY4OetjV7mcjimZDyJJJabtI_Xcmj6JzTTSlkD7DGAnsM1_6JBrOLnbT25s9YPYoys2_G4KR0DsCDNgInbMNYeqrrvvHPNv1w-1IsQshL5949PhMKYf5sa8QTlpTJyN-3tdWjyiki-SGDqSf3RDaSVzpooxvAZHW8gfsGQtyq5ITGNnKrC9WmyZxz4R-13I8SxJQj6IXX2tp2CRGNcN0K_SkeAto-yItFl1qVUQ",
    category: "Skincare",
    discountPercentage: 10,
    tags: ["for-oily-skin", "anti-acne"],
    createdAt: "2026-07-11T10:00:00.000Z"
  },
  {
    _id: "mock4",
    name: "La Roche-Posay Foaming Gel",
    description: "Gently purifies oily skin thanks to high-purity cleansing agents.",
    price: 3200,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIYPloT3hVu2Mlgvrx2TLss4S9A4a3aTtF4DsqtE7Y0_2ZPvZ6Sps_sPPK_kf9KZeBpNdbmClsvneQA4FCevZqeNd9bCya_2_C2oGM5zuLb7ENNjt_2F5-aq3L8aINH_8iOAeCJ5ARaSePFWivZ9y7Mzy68qmRuImHxAzHuXnw1Ta_JWAUTW5siOcP4fPnvc_WqSuWEb6bZWoXZX6EyPlbk_64mwGIOMjnPazgghlEBuRVya83l53VNuogkJveHzEisie8t4Pr_N95",
    category: "Skincare",
    discountPercentage: 15,
    tags: ["for-oily-skin", "for-sensitive-skin", "anti-acne", "cleanser"],
    createdAt: "2026-07-11T10:30:00.000Z"
  },
  {
    _id: "mock5",
    name: "Klorane Nourishing Mango Shampoo",
    description: "Nourishes and restructures damaged hair shafts with mango butter.",
    price: 2200,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1605Z5wGYamgkB1B9Dk9efaUfaeArcNqgI4DBNTxJ2_t_jKTq1zkX7L845KIJMd3kYywamgARhAMJqzJrwYxel-czSMidU05QspYgu_x9GQuCcXs8CdB9Dh959PNL-WmrOmP_c0DPi0_iRppLBQn9Z8XYhB_cBomew0--ew-4ZODECUHNRA1lzbe6c6yuFw00_kNvcwm9cavVDaL9zjPOpQJ-Yf12P0BrBrXwufhvdcTzmXxF5Hcz1g4bvx_N5US82OfhPS5k1dUG5Ck",
    category: "Haircare",
    discountPercentage: 0,
    tags: ["for-dry-hair", "for-damaged-hair", "shampoo"],
    createdAt: "2026-07-08T09:00:00.000Z"
  },
  {
    _id: "mock6",
    name: "Vichy Dercos Anti-Dandruff DS",
    description: "Eliminates stubborn dandruff and regulates excess sebum on oily scalps.",
    price: 3500,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwNLsmrIaytihkpSNDy1PeL5NQGBkmqUuOAban9OY4OetjV7mcjimZDyJJJabtI_Xcmj6JzTTSlkD7DGAnsM1_6JBrOLnbT25s9YPYoys2_G4KR0DsCDNgInbMNYeqrrvvHPNv1w-1IsQshL5949PhMKYf5sa8QTlpTJyN-3tdWjyiki-SGDqSf3RDaSVzpooxvAZHW8gfsGQtyq5ITGNnKrC9WmyZxz4R-13I8SxJQj6IXX2tp2CRGNcN0K_SkeAto-yItFl1qVUQ",
    category: "Haircare",
    discountPercentage: 0,
    tags: ["for-oily-hair", "anti-dandruff", "shampoo"],
    createdAt: "2026-07-08T10:00:00.000Z"
  },
  {
    _id: "mock7",
    name: "Mustela Gentle Baby Cleansing Gel",
    description: "Gently cleanses baby face, body, and hair. Lightly perfumed.",
    price: 2600,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYbsddsZLoMfoAyFTytyLRecvGuCCilxruuF-9NE6Uk2WVi8sqZPJDiY8oKcXowtX_BXiWubger13dI4gvMSjV-FPaxqeT-uBPVIA3ho9SHzyStn-Utmu8zpuK5m-nYcjLybPSZVLYHMxizuiM9IbgfTk2fJ_kTMeTftmJu_nLHwUP9nPfFcIbxwuAW09g3OW80PX3ceABD_4l62nn8ZHzv0eurFwwMxaOLYnHTqPRFDdj7A4MzNdSrx9gzzR8lLU0-nnELUqdEoxg",
    category: "Baby & Mother",
    discountPercentage: 0,
    tags: ["for-normal-skin", "for-sensitive-skin", "cleanser", "contains-fragrance"],
    createdAt: "2026-07-05T12:00:00.000Z"
  },
  {
    _id: "mock8",
    name: "Clinical Vitamin C + Zinc PCA",
    description: "Reinforces cellular immune protection and accelerates skin healing.",
    price: 1900,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMXgXChWZDdTDbMAnqVgQulyotUH9WCRUptTjDeRUC5P8Ew23A2qdQ2OBsuUgg7qiN2hfaCVQOZ8133SuVU_ap7IKZ0M03C6jFSVz-SKeu8YlYvIkMatOXtnZUBRO6DokB0NrrpvcVA9mMKrFuGYCzY4XC2nJBp_GA4toBXtESvepKIZaypa6mNKOUwHVMlfBfgfmcnSmhOccslk6bGRDhGwqWfiEP7kMMzH1-u776nWjIAF04jf2p-cScrTv8nJ9C_wVwcMCc8TGg",
    category: "Supplements & Wellness",
    discountPercentage: 0,
    tags: ["hydrating", "brightening"],
    createdAt: "2026-07-04T12:00:00.000Z"
  }
];

const MOCK_ROUTINE = [
  {
    _id: "mock3",
    name: "Purifying Gel Cleanser",
    description: "Salicylic Acid 2% Exfoliator.",
    price: 3200,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIYPloT3hVu2Mlgvrx2TLss4S9A4a3aTtF4DsqtE7Y0_2ZPvZ6Sps_sPPK_kf9KZeBpNdbmClsvneQA4FCevZqeNd9bCya_2_C2oGM5zuLb7ENNjt_2F5-aq3L8aINH_8iOAeCJ5ARaSePFWivZ9y7Mzy68qmRuImHxAzHuXnw1Ta_JWAUTW5siOcP4fPnvc_WqSuWEb6bZWoXZX6EyPlbk_64mwGIOMjnPazgghlEBuRVya83l53VNuogkJveHzEisie8t4Pr_N95",
    stepLabel: "Step 1: Cleanse"
  },
  {
    _id: "mock1",
    name: "Niacinamide 10% Serum",
    description: "Pore Refining & Soothing Complex.",
    price: 4800,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDicahlvowdjpDxKfRcK-TVBE0T0TXJKm4TAbcrOWA-TBwj0ZO3e7e4AnaQUHwj2xxObqRCEJiTDBjqtpotIFRvTwwah02tJUqLwUAjyP0K8O6yjm6d3aag0nsWAwNt0eMuf4vQrCC700IFbXno7wg9mKfmE1qz8jzkhud2cAVbOZQwmyGoJD36PMg5d3JIHV3P5c9Z5FqTfZJU_Q8jGNcBrHKc_KQkSas3DwiGSzURmWmfsbON0CQo2wZj9LWGfMnG_DkOD-s-5iqt",
    stepLabel: "Step 2: Treat"
  },
  {
    _id: "mock2",
    name: "Ceramide Barrier Cream",
    description: "Deep Hydration lipid barrier builder.",
    price: 5500,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBN1XgHxzm8AR6QvqWiV_MI9L_TToepBxoeMO3jSGjdnhy3M_dabFqezAAQSaV4V1DOvAMZq_EPuQYyXAAuT7hQwDmgce7WXYIEqat4XGhVucfVSTHZAVm3P9tDueTOrwOr9UtS3IUDuz3OHZZP42Ki5sE8yY3YTRB7hN_Oiu3t1i2fC0ayY3ZoK-NFFFHQPC7mcoIqB5oZEdPHSWSGgcYI4_QGfLk0ZxF5xUIaWaMLrCpy-Htt1dGG6At-B3Q2BxWepA5t95ubszuz",
    stepLabel: "Step 3: Moisturize"
  }
];

export default function Catalog() {
  const { user, token } = useAuth();

  // --- Catalog States ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filtering States ---
  const [category, setCategory] = useState('Skincare'); // Defaults to Skincare
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [maxPrice, setMaxPrice] = useState(12000); // Dynamic Price slider state

  // --- Sorting States ---
  const [sortBy, setSortBy] = useState('recommended'); // Defaulted back to 'recommended'
  const [isSortOpen, setIsSortOpen] = useState(false);

  // --- AI Routine State ---
  const [routine, setRoutine] = useState(MOCK_ROUTINE);
  const [recLoading, setRecLoading] = useState(false);

  // --- Custom Luxury Toast Alert State ---
  const [toast, setToast] = useState({ show: false, message: '' });

  // 1. Fetch Main Catalog Products based on active category
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.length > 0 ? data : MOCK_CATALOG);
        } else {
          setProducts(MOCK_CATALOG);
        }
      } catch (err) {
        setProducts(MOCK_CATALOG);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [category]);

  // 2. Fetch AI Recommendations (Strict Deferred Execution to bypass linter limits)
  useEffect(() => {
    if (!user || !token) {
      const resetToDefault = () => {
        setRoutine(MOCK_ROUTINE);
      };
      setTimeout(resetToDefault, 0);
      return;
    }

    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/products/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length >= 2) {
            const mappedRoutine = data.products.slice(0, 3).map((prod, idx) => {
              const steps = ["Step 1: Cleanse", "Step 2: Treat", "Step 3: Moisturize"];
              return {
                _id: prod._id,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                imageUrl: prod.imageUrl,
                stepLabel: steps[idx] || "Recommended Item"
              };
            });
            setRoutine(mappedRoutine);
          }
        }
      } catch (err) {
        console.log('Error pulling recommendations, displaying default routine.');
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, token]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleConcernToggle = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleSortChange = (type) => {
    setSortBy(type);
    setIsSortOpen(false);
  };

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
      
      triggerToast(`✅ Added ${product.name} to your shopping cart!`);
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 2500);

    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFullRoutine = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      routine.forEach(item => {
        const existingItemIndex = cart.findIndex((cartItem) => cartItem.product === item._id);
        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += 1;
        } else {
          cart.push({ product: item._id, quantity: 1 });
        }
      });

      localStorage.setItem('cart', JSON.stringify(cart));
      
      triggerToast("🎉 AI Prescribed Routine Bundle added with 15% discount!");
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);

    } catch (error) {
      console.error(error);
    }
  };

  // --- DYNAMIC CLIENT-SIDE FILTERING & SORTING ENGINE ---
  const getProcessedProducts = () => {
    // 1. FILTERING: Category Check, Skin Concerns, and Max Price bounds
    let result = products.filter(product => {
      // Clean dynamic category fallback matching (Fixes offline sidebar category filter!)
      if (category && product.category !== category) return false;

      const discountAmount = (product.price * product.discountPercentage) / 100;
      const finalPrice = product.price - discountAmount;

      if (finalPrice > maxPrice) return false;

      if (selectedConcerns.length > 0) {
        const tagMappings = {
          'Acne & Blemishes': 'anti-acne',
          'Aging & Fine Lines': 'anti-aging',
          'Dryness': 'for-dry-skin',
          'Hyperpigmentation': 'brightening'
        };
        const targetTags = selectedConcerns.map(concern => tagMappings[concern]);
        return product.tags && product.tags.some(tag => targetTags.includes(tag));
      }

      return true;
    });

    // 2. SORTING: Supports live dynamic sorting including "Recommended" matching
    return result.sort((a, b) => {
      const aDiscount = (a.price * a.discountPercentage) / 100;
      const aFinalPrice = a.price - aDiscount;

      const bDiscount = (b.price * b.discountPercentage) / 100;
      const bFinalPrice = b.price - bDiscount;

      if (sortBy === 'recommended') {
        // AI Recommended Sorting: prioritizes matching skin type tags on top
        if (user && user.customerProfile) {
          const userSkinTag = `for-${user.customerProfile.skinType.toLowerCase()}-skin`;
          const aMatch = a.tags && a.tags.includes(userSkinTag) ? 1 : 0;
          const bMatch = b.tags && b.tags.includes(userSkinTag) ? 1 : 0;
          return bMatch - aMatch; // Moves matching items to the top
        }
        // Fallback to newest if user is logged out
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      } else if (sortBy === 'price-low') {
        return aFinalPrice - bFinalPrice;
      } else if (sortBy === 'price-high') {
        return bFinalPrice - aFinalPrice;
      } else if (sortBy === 'name-az') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      }
      return 0;
    });
  };

  const processedProducts = getProcessedProducts();

  const sortLabels = {
    'recommended': 'Recommended',
    'newest': 'Newest Arrivals',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'name-az': 'Name: A to Z'
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-section-gap px-container-padding-mobile md:px-container-padding-desktop max-w-[1440px] mx-auto w-full space-y-section-gap">
        
        {/* ================= AI PERSONALIZED ROUTINE BANNER ================= */}
        <section className="bg-[#E8F6F8] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          {/* Background Drops */}
          <div 
            className="absolute inset-0 opacity-30 mix-blend-multiply" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBL5VWyodci2Rw5GhXb9FiLjmrgBfRCdelEWiat55OCBWhXRHb8GRir6mhWexFKwIt0NkxFwisYrE6jKugvJf5sS2Z6OrEf_m7xecFtSOByuujWpuJocmg2V0FzhHqFRalLsjvQz3hYZE7xFlYft9P7mBQADv33y-bWX1Cu1yfUfA9kZEIeZtLZS_yp7mKrAV5dbnFrX5k_RY75IlQafeo1n-zPYl-XlCZ7v7wJwbdh8VIUCKksGhSjLd8J0mQ7D2zLPyoOLdr-DL49')" }}
          ></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase mb-2 block">
                {user ? `Welcome Back, ${user.name}` : 'Clinical Consultation'}
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-[#5D2A82]">
                {user ? 'Your Prescribed Routine' : 'Reveal Your Routine'}
              </h1>
            </div>
            
            {user ? (
              <button 
                onClick={handleAddFullRoutine}
                className="bg-[#5D2A82] text-white font-label-sm text-label-sm py-4 px-8 rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                Add Full Routine (15% Off)
              </button>
            ) : (
              <Link 
                href="/register"
                className="bg-primary text-white font-label-sm text-label-sm py-4 px-8 rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                Take the 2-Min Skin Quiz
              </Link>
            )}
          </div>

          {/* Routine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {routine.map((stepItem) => (
              <div key={stepItem._id} className="bg-surface-container-lowest rounded-lg p-6 ambient-shadow hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full relative">
                <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm py-1 px-3 rounded-full self-start mb-4 relative z-10">
                  {stepItem.stepLabel}
                </span>
                
                {/* Blurred Content Overlay for Logged out users */}
                <div className={`flex flex-col h-full ${!user ? 'blur-md pointer-events-none select-none' : ''}`}>
                  {/* Image Link */}
                  <Link href={`/products/${stepItem._id}`}>
                    <div className="aspect-square bg-surface-container-low rounded-DEFAULT mb-4 flex items-center justify-center overflow-hidden cursor-pointer">
                      <img className="w-full h-full object-cover" alt={stepItem.name} src={stepItem.imageUrl} />
                    </div>
                  </Link>

                  {/* Name Link */}
                  <Link href={`/products/${stepItem._id}`}>
                    <h3 className="font-headline-md text-headline-md text-primary mb-1 hover:underline cursor-pointer">
                      {stepItem.name}
                    </h3>
                  </Link>

                  <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4">
                    {stepItem.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant">
                    <span className="font-body-lg text-body-lg text-primary">
                      {stepItem.price ? stepItem.price.toLocaleString() : '---'} DZD
                    </span>
                    <button 
                      onClick={() => handleAddToCart(stepItem)}
                      className="text-secondary font-label-sm text-label-sm flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span> Add Step
                    </button>
                  </div>
                </div>

                {/* Lock Overlay Content shown on top of the blurred card */}
                {!user && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20">
                    <span className="material-symbols-outlined text-primary text-3xl mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>lock</span>
                    <p className="font-label-sm text-[10px] text-primary uppercase tracking-widest font-semibold">Locked</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= SPLIT CATALOG LAYOUT ================= */}
        <section className="flex flex-col lg:flex-row gap-gutter">
          
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-1/4 space-y-8 flex-shrink-0">
            
            {/* Dynamic Categories Selection List (Synchronized with SYSTEM_CATEGORIES) */}
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 border-b border-surface-variant pb-2">Category</h4>
              <ul className="space-y-3 font-body-md text-body-md">
                {SYSTEM_CATEGORIES.map((item) => {
                  const isActive = category === item.value;
                  return (
                    <li key={item.value}>
                      <button 
                        onClick={() => setCategory(item.value)}
                        className={`w-full text-left transition-colors flex items-center justify-between ${
                          isActive 
                            ? 'text-primary font-semibold' 
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        {item.label}{' '}
                        {isActive && <span className="material-symbols-outlined text-[16px]">chevron_right</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Skin Concerns Checklist */}
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 border-b border-surface-variant pb-2">Skin Concern</h4>
              <div className="space-y-3 font-body-md text-body-md">
                {['Acne & Blemishes', 'Aging & Fine Lines', 'Dryness', 'Hyperpigmentation'].map((concern) => {
                  const isChecked = selectedConcerns.includes(concern);
                  return (
                    <label key={concern} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isChecked}
                        onChange={() => handleConcernToggle(concern)}
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'border-2 border-secondary bg-secondary' 
                          : 'border-outline group-hover:border-secondary'
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${isChecked ? 'text-on-primary' : 'text-transparent'}`}>check</span>
                      </div>
                      <span className={isChecked ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                        {concern}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 border-b border-surface-variant pb-2">Price Range (DZD)</h4>
              <div className="pt-2">
                <input 
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-secondary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer mb-4"
                />
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Min: 1,000</span>
                  <span className="text-secondary font-semibold">Max: {maxPrice.toLocaleString()} DZD</span>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT CATALOG GRID */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Showing {processedProducts.length} Clinical Products
              </span>
              
              {/* Interactive Sorting Dropdown Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="font-label-sm text-label-sm text-primary flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-surface-variant hover:bg-surface-variant transition-colors"
                >
                  Sort by: {sortLabels[sortBy]} <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-surface-variant rounded-xl shadow-lg z-20 overflow-hidden font-body-md text-sm">
                    {/* RESTORED RECOMMENDED SORT OPTION */}
                    <button type="button" onClick={() => handleSortChange('recommended')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 block">Recommended</button>
                    <button type="button" onClick={() => handleSortChange('newest')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 block">Newest Arrivals</button>
                    <button type="button" onClick={() => handleSortChange('price-low')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 block">Price: Low to High</button>
                    <button type="button" onClick={() => handleSortChange('price-high')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 block">Price: High to Low</button>
                    <button type="button" onClick={() => handleSortChange('name-az')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 block">Name: A to Z</button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {processedProducts.map((product) => {
                const discountAmount = (product.price * product.discountPercentage) / 100;
                const finalPrice = product.price - discountAmount;

                const isPerfectMatch = user && product.tags && product.tags.includes(`for-${user.customerProfile.skinType.toLowerCase()}-skin`);

                return (
                  <div key={product._id} className="bg-surface-container-lowest rounded-lg p-6 ambient-shadow group relative flex flex-col">
                    {isPerfectMatch && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#5D2A82] text-on-primary font-label-sm text-label-sm py-1 px-3 rounded-full flex items-center gap-1">
                          ✨ Perfect Match
                        </span>
                      </div>
                    )}
                    <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface/50 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                    </button>
                    
                    {/* Dynamic Image Link */}
                    <Link href={`/products/${product._id}`}>
                      <div className="aspect-[4/5] bg-surface-container-low rounded-DEFAULT mb-4 overflow-hidden relative cursor-pointer">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} src={product.imageUrl} />
                      </div>
                    </Link>

                    <div className="flex-grow flex flex-col">
                      {/* Dynamic Title Link */}
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-headline-md text-headline-md text-primary mb-1 line-clamp-1 hover:underline cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="font-body-md text-body-md text-on-surface-variant mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4].map((starIdx) => (
                          <span key={starIdx} className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                        <span className="material-symbols-outlined text-[16px] text-secondary">star_half</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">(128)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-body-lg text-body-lg text-primary">
                        {finalPrice.toLocaleString()} DZD
                      </span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-10 h-10 rounded-full bg-secondary text-on-primary flex items-center justify-center hover:bg-on-secondary-container transition-colors shadow-sm hover:shadow-md"
                      >
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2">
              <button className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center">1</button>
              <button className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm transition-colors">2</button>
              <button className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm transition-colors">3</button>
              <button className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

          </div>
        </section>
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