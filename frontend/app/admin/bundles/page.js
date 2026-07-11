// frontend/app/admin/inventory/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminInventory() {
  const { token } = useAuth();

  // --- View Control (false: list products/bundles, true: active bundle creator form) ---
  const [isCreatingBundle, setIsScb] = useState(false);

  // --- Database States ---
  const [products, setProducts] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Form States (Bundle Creator) ---
  const [bundleName, setBundleName] = useState('');
  const [sku, setSku] = useState('BDL-SKN-SUM-001');
  const [marketingDescription, setMarketingDescription] = useState('');
  const [bundleSalesPrice, setBundleSalesPrice] = useState(1500);
  const [selectedSkinType, setSelectedSkinType] = useState('Sensitive');
  const [selectedConcerns, setSelectedConcerns] = useState(['Redness/Rosacea']);
  
  // Selected components inside the bundle: array of { product: {}, quantity: number }
  const [bundleComponents, setBundleComponents] = useState([]);

  // Modal selector state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch products and active packs from database on mount
  const refreshInventory = async () => {
    if (!token) return;
    try {
      const pRes = await fetch('http://localhost:5000/api/products');
      const pData = await pRes.json();
      if (pRes.ok) setProducts(pData);

      const pkRes = await fetch('http://localhost:5000/api/packs');
      const pkData = await pkRes.json();
      if (pkRes.ok) setPacks(pkData);
    } catch (err) {
      console.log('Error pulling database inventory.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch products and active packs from database on mount
  useEffect(() => {
    const runRefresh = () => {
      refreshInventory();
    };

    // Defer the execution asynchronously to satisfy strict React 19 compiler rules
    setTimeout(runRefresh, 0);
  }, [token]);

  // 2. Multiplier adjustments inside the bundle components
  const adjustComponentQuantity = (productId, delta) => {
    const updated = bundleComponents.map(comp => {
      if (comp.product._id === productId) {
        const newQty = comp.quantity + delta;
        return { ...comp, quantity: newQty > 0 ? newQty : 1 };
      }
      return comp;
    });
    setBundleComponents(updated);
  };

  // 3. Select / Toggle products in the Selection Modal
  const handleToggleProductInModal = (prod) => {
    const exists = bundleComponents.some(c => c.product._id === prod._id);
    if (exists) {
      setBundleComponents(bundleComponents.filter(c => c.product._id !== prod._id));
    } else {
      setBundleComponents([...bundleComponents, { product: prod, quantity: 1 }]);
    }
  };

  // 4. Toggle Target Concerns array
  const handleConcernToggle = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  // 5. Calculate Dynamic Pricing Math on the fly
  const calculateOriginalValue = () => {
    return bundleComponents.reduce((sum, comp) => sum + (comp.product.price * comp.quantity), 0);
  };

  const originalValue = calculateOriginalValue();
  const discountPercentage = originalValue > 0 
    ? Math.round(((originalValue - bundleSalesPrice) / originalValue) * 100) 
    : 0;
  const customerSavings = originalValue > bundleSalesPrice ? originalValue - bundleSalesPrice : 0;

  // 6. Submit Bundle payload to POST /api/packs
  const handleCreateBundleSubmit = async (e) => {
    e.preventDefault();
    if (!bundleName || bundleComponents.length < 2) {
      alert('⚠️ A bundle must have a name and contain at least 2 products.');
      return;
    }

    // Map Skin Type and Skin Concerns directly to backend standardized tags
    const tagMappings = {
      'Sensitive': 'for-sensitive-skin',
      'Dry': 'for-dry-skin',
      'Oily': 'for-oily-skin',
      'Combination': 'for-combination-skin',
      'Normal': 'for-normal-skin',
      'Redness/Rosacea': 'soothing',
      'Dehydration': 'hydrating',
      'Aging/Wrinkles': 'anti-aging'
    };

    const compiledTags = [];
    if (tagMappings[selectedSkinType]) compiledTags.push(tagMappings[selectedSkinType]);
    selectedConcerns.forEach(c => {
      if (tagMappings[c]) compiledTags.push(tagMappings[c]);
    });

    const payload = {
      name: bundleName,
      description: marketingDescription || `Bundled routine curated for ${selectedSkinType} skin.`,
      price: Number(bundleSalesPrice),
      imageUrl: bundleComponents[0]?.product.imageUrl || "https://example.com/default-pack.jpg", // Default to first product image
      products: bundleComponents.map(c => c.product._id),
      tags: compiledTags
    };

    try {
      const response = await fetch('http://localhost:5000/api/packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('🎉 New Product Bundle created successfully!');
        setIsScb(false); // Return to inventory view
        setBundleComponents([]);
        setBundleName('');
        setMarketingDescription('');
        refreshInventory(); // Reload database
      } else {
        const errData = await response.json();
        alert(errData.message || 'Error saving bundle.');
      }
    } catch (err) {
      alert('Error connecting to the database server.');
    }
  };

  if (loading) {
    return (
      <main className="pt-20 text-center font-body-lg text-primary bg-background min-h-[50vh] flex items-center justify-center">
        Synchronizing clinical stock ledger...
      </main>
    );
  }

  return (
    <div className="flex-1 p-8">
      
      {!isCreatingBundle ? (
        /* ================= VIEW 1: INVENTORY & BUNDLES CATALOG LIST ================= */
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Directory</h1>
            <button 
              onClick={() => setIsScb(true)}
              className="px-6 py-3 bg-secondary text-white rounded-full font-semibold hover:opacity-90 shadow-sm active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span> Create New Bundle
            </button>
          </div>

          {/* Active Bundles Section */}
          <section className="bg-white rounded-xl p-6 border border-gray-200 soft-shadow">
            <h2 className="text-lg font-bold text-primary mb-6">Active Routines &amp; Packs ({packs.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packs.map(pack => (
                <div key={pack._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex gap-4 items-center">
                  <img src={pack.imageUrl} alt={pack.name} className="w-16 h-16 object-cover rounded-lg bg-white border" />
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{pack.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{pack.products?.length} products • {pack.price.toLocaleString()} DZD</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Standard Products Table */}
          <section className="bg-white rounded-xl border border-gray-200 soft-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Active Stock Registry ({products.length} items)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[10px] font-semibold uppercase tracking-wider border-b border-gray-200">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Base Price</th>
                    <th className="py-4 px-6 text-center">Stock</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {products.map(prod => {
                    const isLowStock = prod.stockQuantity <= prod.lowStockThreshold;
                    return (
                      <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 object-cover rounded border" />
                          <span className="font-medium text-gray-900">{prod.name}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-500">{prod.category}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">{prod.price.toLocaleString()} DZD</td>
                        <td className="py-4 px-6 text-center font-medium font-sans-nums">{prod.stockQuantity}</td>
                        <td className="py-4 px-6">
                          {isLowStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                              Low Stock Alert
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E0F7FA] text-secondary">
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        /* ================= VIEW 2: DUAL-COLUMN BUNDLE CREATOR SCREEN ================= */
        <div className="max-w-[1600px] mx-auto">
          {/* Header Bar */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsScb(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
              <h2 className="text-headline-md font-headline-md text-tertiary" style={{ color: 'rgb(93, 42, 130)' }}>
                Create New Product Bundle
              </h2>
            </div>
          </header>

          {/* Form Content */}
          <form onSubmit={handleCreateBundleSubmit} className="flex gap-8">
            
            {/* Left Column (Main Forms) */}
            <div className="flex-1 space-y-8">
              
              {/* Bundle Identity Card */}
              <div className="bg-surface-container-lowest rounded-2xl card-border soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-tertiary" style={{ color: 'rgb(93, 42, 130)' }}>loyalty</span>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">Bundle Identity</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Bundle Name</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg input-border input-focus bg-surface-container-lowest text-body-md text-on-surface" 
                      placeholder="e.g. Skin Soothing Summer Ritual" 
                      type="text"
                      value={bundleName}
                      onChange={(e) => setBundleName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-2">SKU Reference</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg input-border input-focus bg-surface-container-lowest text-body-md text-on-surface font-mono" 
                      type="text" 
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Marketing Description</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-lg input-border input-focus bg-surface-container-lowest text-body-md text-on-surface resize-none" 
                    placeholder="Describe the curative benefits of this bundle..." 
                    rows={3}
                    value={marketingDescription}
                    onChange={(e) => setMarketingDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Component Products Card */}
              <div className="bg-surface-container-lowest rounded-2xl card-border soft-shadow">
                <div className="p-8 border-b border-surface-container-highest flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'rgb(93, 42, 130)' }}>shopping_bag</span>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface">Component Products</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary font-headline-sm text-body-md flex items-center gap-2 hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors border border-primary"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span> Add Products
                  </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-surface-container-low text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-3 text-center">Qty</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Selected Component Rows */}
                <div className="divide-y divide-surface-container-highest min-h-[100px]">
                  {bundleComponents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No products added yet. Click &apos;Add Products&apos; above to compile your bundle.
                    </div>
                  ) : (
                    bundleComponents.map((comp) => (
                      <div key={comp.product._id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-surface-bright transition-colors">
                        <div className="col-span-5 flex items-center gap-4">
                          <img className="w-12 h-12 rounded-lg object-cover border" src={comp.product.imageUrl} alt={comp.product.name} />
                          <div>
                            <p className="text-body-md font-headline-sm text-on-surface">{comp.product.name}</p>
                            <p className="text-label-sm text-on-surface-variant mt-1">Stock: {comp.product.stockQuantity} units</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-body-md font-medium text-on-surface">
                          {comp.product.price.toLocaleString()} DZD
                        </div>
                        <div className="col-span-3 flex justify-center items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => adjustComponentQuantity(comp.product._id, -1)}
                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-body-md font-medium w-4 text-center">{comp.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => adjustComponentQuantity(comp.product._id, 1)}
                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <div className="col-span-2 text-right text-body-md font-headline-sm text-on-surface">
                          {(comp.product.price * comp.quantity).toLocaleString()} DZD
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub-Total values */}
                <div className="p-8 bg-surface-bright border-t border-surface-container-highest flex justify-end items-center gap-4 rounded-b-2xl">
                  <span className="text-body-md text-on-surface-variant">Component Total Value:</span>
                  <span className="text-headline-md font-headline-md text-tertiary" style={{ color: 'rgb(93, 42, 130)' }}>
                    {originalValue.toLocaleString()} DZD
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (Strategy & Sidebar Context) */}
            <div className="w-[380px] flex-shrink-0 space-y-8">
              
              {/* Pricing Strategy Card */}
              <div className="bg-surface-container-lowest rounded-2xl card-border soft-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-low rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <span className="material-symbols-outlined" style={{ color: 'rgb(93, 42, 130)' }}>payments</span>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface">Pricing Strategy</h3>
                  </div>
                  
                  <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Bundle Sales Price</label>
                  <div className="flex items-baseline gap-2 p-4 rounded-xl border border-primary bg-surface-container-lowest mb-6">
                    <span className="text-headline-sm font-bold text-tertiary" style={{ color: 'rgb(93, 42, 130)' }}>DZD</span>
                    <input 
                      className="text-display-lg font-display-lg text-tertiary bg-transparent border-none p-0 focus:ring-0 w-full outline-none" 
                      type="number" 
                      value={bundleSalesPrice}
                      onChange={(e) => setBundleSalesPrice(Number(e.target.value))}
                      style={{ color: 'rgb(93, 42, 130)' }}
                    />
                  </div>

                  <div className="bg-surface-bright rounded-xl p-6 space-y-4">
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Original Value</span>
                      <span className="line-through text-error">{originalValue.toLocaleString()} DZD</span>
                    </div>
                    <div className="flex justify-between text-body-md items-center">
                      <span className="text-on-surface-variant">Discount</span>
                      <span className="bg-error-container text-on-error-container text-label-sm font-bold px-2 py-1 rounded-md">
                        - {discountPercentage}%
                      </span>
                    </div>
                    <div className="pt-4 border-t border-surface-variant flex justify-between items-center">
                      <span className="text-body-md font-headline-sm text-on-surface">Total Customer Savings</span>
                      <span className="text-headline-sm font-headline-sm text-primary">
                        {customerSavings.toLocaleString()} DZD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Audience Card */}
              <div className="bg-surface-container-lowest rounded-2xl card-border soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-tertiary" style={{ color: 'rgb(93, 42, 130)' }}>groups</span>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">Target Audience</h3>
                </div>
                
                <div className="mb-8">
                  <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Skin Type Focus</label>
                  <div className="flex flex-wrap gap-2">
                    {['Sensitive', 'Dry', 'Oily', 'Combination', 'Normal'].map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setSelectedSkinType(type)}
                        className={`px-4 py-2 rounded-full border text-body-md transition-colors ${
                          selectedSkinType === type 
                            ? 'border-primary bg-primary-fixed text-on-primary-fixed' 
                            : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Target Concerns</label>
                  <div className="space-y-3">
                    {['Redness/Rosacea', 'Dehydration', 'Aging/Wrinkles'].map(concern => {
                      const isChecked = selectedConcerns.includes(concern);
                      return (
                        <label 
                          key={concern}
                          onClick={() => handleConcernToggle(concern)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isChecked ? 'border-primary bg-primary-fixed-dim/10' : 'border-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            isChecked ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface-container-lowest'
                          }`}>
                            {isChecked && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </div>
                          <span className={`text-body-md ${isChecked ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
                            {concern}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </form>

          {/* Sticky Footer Action Bar */}
          <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center bg-[#F9FAFB] sticky bottom-0 pb-8 z-10">
            <button 
              type="button"
              onClick={() => {
                setBundleComponents([]);
                setIsScb(false);
              }}
              className="text-on-surface-variant hover:text-error flex items-center gap-2 text-body-md font-headline-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Discard Changes
            </button>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsScb(false)}
                className="px-6 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-headline-sm text-body-md hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreateBundleSubmit}
                className="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-md transition-colors shadow-sm"
              >
                Create Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS SELECTION OVERLAY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-xl w-full relative shadow-lg flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">Select Bundle Components</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable list of products */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {products.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No inventory products registered. Create products first.
                </div>
              ) : (
                products.map((prod) => {
                  const isChecked = bundleComponents.some(c => c.product._id === prod._id);
                  return (
                    <label key={prod._id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 object-cover rounded border" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{prod.name}</p>
                          <p className="text-xs text-gray-400">{prod.price.toLocaleString()} DZD • Stock: {prod.stockQuantity}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isChecked}
                          onChange={() => handleToggleProductInModal(prod)}
                        />
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-secondary border-secondary text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <span className="material-symbols-outlined text-[14px]">check</span>}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t pt-6 mt-6 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Confirm Selection ({bundleComponents.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}