// frontend/app/admin/inventory/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

// Standardized tag families (synchronized with constants.ts PRODUCT_TAGS)
const SKIN_SUITABILITY_TAGS = ['for-normal-skin', 'for-oily-skin', 'for-dry-skin', 'for-combination-skin', 'for-sensitive-skin'];
const SKIN_CONCERN_TAGS = ['anti-acne', 'anti-aging', 'brightening', 'soothing', 'hydrating'];
const SKIN_ROUTINE_TAGS = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask'];

const HAIR_SUITABILITY_TAGS = ['for-normal-hair', 'for-oily-hair', 'for-dry-hair', 'for-damaged-hair', 'hair-loss', 'anti-dandruff'];
const HAIR_ROUTINE_TAGS = ['shampoo', 'conditioner', 'hair-mask', 'hair-serum'];

const GLOBAL_ALLERGEN_TAGS = ['contains-fragrance', 'contains-parabens', 'contains-sulfates', 'contains-silicones', 'contains-essential-oils'];

export default function AdminInventory() {
  const { token } = useAuth();
  const router = useRouter();

  // --- View Toggle State (false: table directory, true: add/edit bento form) ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // Null if creating, ID if editing

  // --- Database States ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Bento Form Fields States ---
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Skincare');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState(500);
  const [salePrice, setSalePrice] = useState(1200);
  const [sku, setSku] = useState('DS-SKIN-001');
  const [stockQuantity, setStockQuantity] = useState(150);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState([]);

  // 1. Fetch products from database on mount
  const refreshInventory = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.log('Error pulling database inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const runRefresh = () => {
      refreshInventory();
    };
    setTimeout(runRefresh, 0);
  }, [token]);

  // 2. Reset tags asynchronously when category shifts
  useEffect(() => {
    if (editingProductId) return; // Prevent overwriting tags when editing an existing product on load
    
    const resetTagsToCategoryFamily = () => {
      if (['Skincare', 'Bodycare', 'Baby & Mother', 'Hygiene'].includes(category)) {
        setTags(['for-normal-skin', 'for-sensitive-skin', 'anti-acne', 'hydrating']);
      } else if (category === 'Haircare') {
        setTags(['for-normal-hair', 'shampoo']);
      } else {
        setTags([]);
      }
    };

    setTimeout(resetTagsToCategoryFamily, 0);
  }, [category, editingProductId]);

  // --- CUSTOM DYNAMIC EXCEL/CSV EXPORTER ---
  const handleExportExcel = () => {
    if (filteredProducts.length === 0) {
      alert('⚠️ No products available in this view to export.');
      return;
    }

    // A. Define table column headers
    const headers = ['Product ID', 'Product Name', 'Category', 'Price (DZD)', 'Stock', 'Low Stock Threshold', 'Tags'];

    // B. Compile rows safely escaping quotes and commas
    const rows = filteredProducts.map(p => [
      p._id,
      `"${p.name.replace(/"/g, '""')}"`, // Escape internal quotes to prevent Excel formatting corruption
      p.category,
      p.price,
      p.stockQuantity,
      p.lowStockThreshold || 5,
      `"${p.tags.join(', ')}"` // Group tags as a single cell
    ]);

    // C. Prepend BOM (\uFEFF) to force Microsoft Excel to read in UTF-8
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // D. Compile blob and trigger instant browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dunia_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD: DELETE PRODUCT ---
  const handleDeleteProduct = async (id) => {
    if (!confirm('⚠️ Are you sure you want to permanently delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('🗑️ Product purged successfully!');
        refreshInventory();
      } else {
        alert('Error deleting product from ledger.');
      }
    } catch (err) {
      alert('Error connecting to database server.');
    }
  };

  // --- CRUD: OPEN EDIT FORM ---
  const handleOpenEditForm = (prod) => {
    setEditingProductId(prod._id);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description || '');
    setCostPrice(Math.round(prod.price * 0.4)); // Fallback mock cost price
    setSalePrice(prod.price);
    setSku(prod.sku || 'DS-SKIN-001');
    setStockQuantity(prod.stockQuantity);
    setUploadedImages(prod.galleryImages || [prod.imageUrl]);
    setTags(prod.tags || []);
    setIsFormOpen(true);
  };

  // --- CRUD: CREATE / UPDATE SUBMIT ACTION ---
  const handlePublishProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || uploadedImages.length === 0) {
      alert('⚠️ Product name and at least 1 image are required.');
      return;
    }

    const payload = {
      name,
      description: description || 'Dermatologist tested parapharmacy formulation.',
      price: Number(salePrice),
      stockQuantity: Number(stockQuantity),
      imageUrl: uploadedImages[0], // Primary image
      galleryImages: uploadedImages, // Full gallery
      category,
      discountPercentage: 0,
      lowStockThreshold: 5,
      tags
    };

    const url = editingProductId 
      ? `http://localhost:5000/api/products/${editingProductId}` // UPDATE
      : 'http://localhost:5000/api/products'; // CREATE

    const method = editingProductId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingProductId ? '🎉 Product updated successfully!' : '🎉 New Product published successfully!');
        handleCloseForm();
        refreshInventory();
      } else {
        const data = await response.json();
        alert(data.message || 'Error saving product.');
      }
    } catch (err) {
      alert('Cannot connect to the server.');
    }
  };

  // Close form and reset fields
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProductId(null);
    setName('');
    setCategory('Skincare');
    setDescription('');
    setCostPrice(500);
    setSalePrice(1200);
    setSku('DS-SKIN-001');
    setStockQuantity(150);
    setUploadedImages([]);
    setTags([]);
  };

  // --- Image Upload helper ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadedImages.length >= 4) {
      alert('⚠️ Maximum of 4 images allowed per product.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setUploadedImages([...uploadedImages, data.imageUrl]);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert('Cannot connect to the file upload server.');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (urlToRemove) => {
    setUploadedImages(uploadedImages.filter(url => url !== urlToRemove));
  };

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const margin = salePrice - costPrice;
  const marginPercentage = salePrice > 0 ? Math.round((margin / salePrice) * 100) : 0;

  // Filter products locally by search bar query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic low stock calculations
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold);

  const isSkinCategory = ['Skincare', 'Bodycare', 'Baby & Mother', 'Hygiene'].includes(category);
  const isHairCategory = category === 'Haircare';

  if (loading) {
    return (
      <main className="pt-20 text-center font-body-lg text-primary bg-background min-h-[50vh] flex items-center justify-center">
        Synchronizing stock registry ledger...
      </main>
    );
  }

  return (
    <div className="flex-grow p-8 max-w-[1600px] w-full mx-auto pb-24 relative">
      
      {!isFormOpen ? (
        /* ================= VIEW 1: PRODUCT STOCK REGISTRY TABLE ================= */
        <div className="space-y-8 animate-fade-in">
          
          {/* Low Stock Alerts Banner */}
          {lowStockItems.length > 0 && (
            <section className="mb-section-margin">
              <div className="bg-error-container/20 border border-error/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <div className="bg-error/10 p-2 rounded-full mt-1">
                  <span className="material-symbols-outlined text-error text-xl">warning</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-error mb-2">Low Stock Alerts</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4">
                    You have {lowStockItems.length} item(s) critically low on stock. Immediate restock recommended to prevent sales loss.
                  </p>
                  <button 
                    onClick={() => setSearchQuery('Low Stock')} 
                    className="text-label-md font-label-md text-error hover:text-error/80 font-medium underline transition-colors"
                  >
                    Review Low Stock Items
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Action Search and Creator Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-stack-gap gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md font-body-md focus:border-[#0096A9] focus:ring-4 focus:ring-[#0096A9]/10 transition-all outline-none shadow-sm" 
                  placeholder="Search inventory..." 
                  type="text" 
                />
              </div>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors shadow-sm">
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Linked Export to Excel Trigger */}
              <button 
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-full text-[#374151] text-label-md font-label-md font-semibold hover:bg-surface-container-low transition-colors shadow-sm"
              >
                Export
              </button>
              <button onClick={() => router.push('/admin/bundles')} className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-full text-[#374151] text-label-md font-label-md font-semibold hover:bg-surface-container-low transition-colors shadow-sm whitespace-nowrap">
                Create a Bundle
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5D2A82] text-white rounded-full text-label-md font-label-md font-semibold hover:bg-[#4a2168] hover:shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Product
              </button>
            </div>
          </div>

          {/* Inventory Table Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F2FA] border-b border-outline-variant">
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Stock Level</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[#5D2A82] text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-body-md font-body-md">
                  {filteredProducts.map((prod) => {
                    const isLow = prod.stockQuantity <= prod.lowStockThreshold;
                    const stockPercentage = Math.min(100, Math.round((prod.stockQuantity / 150) * 100));
                    return (
                      <tr key={prod._id} className="border-b border-outline-variant hover:bg-surface-bright transition-colors group">
                        <td className="px-6 py-4 font-medium text-on-surface flex items-center gap-3">
                          <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 object-cover rounded border" />
                          <span className="font-medium text-gray-900">{prod.name}</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{prod.category}</td>
                        <td className="px-6 py-4 text-on-surface-variant">Dunia Labs</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden min-w-[80px]">
                              <div className={`h-full rounded-full ${isLow ? 'bg-error' : 'bg-[#0096A9]'}`} style={{ width: `${stockPercentage}%` }}></div>
                            </div>
                            <span className={`text-label-sm font-label-sm w-8 ${isLow ? 'text-error font-medium' : 'text-on-surface-variant'}`}>{stockPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface font-medium whitespace-nowrap">{prod.price.toLocaleString()} DZD</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-max ${
                            isLow ? 'bg-error/10 text-error' : 'bg-[#E8F6F8] text-[#0096A9]'
                          }`}>
                            {isLow ? 'Low Stock' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleOpenEditForm(prod)} className="text-on-surface-variant/40 hover:text-[#5D2A82] transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleDeleteProduct(prod._id)} className="text-on-surface-variant/40 hover:text-error transition-colors">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VIEW 2: DYNAMIC BENTO FORM ================= */
        <div className="max-w-[1600px] mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5D2A82] mb-2">
              {editingProductId ? 'Update Existing Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-500 text-sm max-w-3xl">
              Complete the details below to publish or update this product inside your system.
            </p>
          </div>

          <form onSubmit={handlePublishProductSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (General Info & Tags) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* General Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <span className="material-symbols-outlined text-[#5D2A82]">info</span>
                  <h2 className="text-lg font-bold text-[#5D2A82]">General Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Product Name *</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none" 
                      placeholder="e.g. Ceramide Hydrating Cleanser" 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Brand</label>
                      <div className="relative">
                        <select className="w-full h-12 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none appearance-none">
                          <option>Dunia Labs</option>
                          <option>CeraVe</option>
                          <option>La Roche-Posay</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                      <div className="relative">
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-12 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none appearance-none"
                        >
                          <option value="Skincare">Skincare</option>
                          <option value="Haircare">Haircare</option>
                          <option value="Bodycare">Bodycare</option>
                          <option value="Baby & Mother">Baby &amp; Mother</option>
                          <option value="Hygiene">Hygiene</option>
                          <option value="Supplements & Wellness">Supplements &amp; Wellness</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-gray-50">
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                      </div>
                      <textarea 
                        className="w-full p-4 text-sm border-none focus:ring-0 resize-none outline-none" 
                        placeholder="Describe the product benefits, ingredients, and usage..." 
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes & Tags Card */}
              <div className="bg-white rounded-2xl border border-gray-200 soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <span className="material-symbols-outlined text-[#5D2A82]">sell</span>
                  <h2 className="text-lg font-bold text-[#5D2A82]">Attributes &amp; Tags</h2>
                </div>
                
                <div className="space-y-6">
                  {isSkinCategory && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Skin Suitability</label>
                        <div className="flex flex-wrap gap-2.5">
                          {SKIN_SUITABILITY_TAGS.map(tag => {
                            const isChecked = tags.includes(tag);
                            return (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                                  isChecked 
                                    ? 'border-[#0096A9] bg-[#E8F6F8] text-[#0096A9]' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Skin Concern Treatment</label>
                        <div className="flex flex-wrap gap-2.5">
                          {SKIN_CONCERN_TAGS.map(tag => {
                            const isChecked = tags.includes(tag);
                            return (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                                  isChecked 
                                    ? 'border-[#0096A9] bg-[#E8F6F8] text-[#0096A9]' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Skincare Routine Step</label>
                        <div className="flex flex-wrap gap-2.5">
                          {SKIN_ROUTINE_TAGS.map(tag => {
                            const isChecked = tags.includes(tag);
                            return (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                                  isChecked 
                                    ? 'border-[#0096A9] bg-[#E8F6F8] text-[#0096A9]' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {isHairCategory && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Hair Suitability &amp; Treatment</label>
                        <div className="flex flex-wrap gap-2.5">
                          {HAIR_SUITABILITY_TAGS.map(tag => {
                            const isChecked = tags.includes(tag);
                            return (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                                  isChecked 
                                    ? 'border-[#0096A9] bg-[#E8F6F8] text-[#0096A9]' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Haircare Routine Step</label>
                        <div className="flex flex-wrap gap-2.5">
                          {HAIR_ROUTINE_TAGS.map(tag => {
                            const isChecked = tags.includes(tag);
                            return (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                                  isChecked 
                                    ? 'border-[#0096A9] bg-[#E8F6F8] text-[#0096A9]' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Allergens Contained</label>
                    <div className="flex flex-wrap gap-2.5">
                      {GLOBAL_ALLERGEN_TAGS.map(tag => {
                        const isChecked = tags.includes(tag);
                        return (
                          <button 
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                              isChecked 
                                ? 'border-red-500 bg-red-50 text-red-600 font-semibold' 
                                : 'border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:text-red-500'
                            }`}
                          >
                            {tag.replace('contains-', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Media & Pricing) */}
            <div className="space-y-8">
              
              {/* Media Card */}
              <div className="bg-white rounded-2xl border border-gray-200 soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <span className="material-symbols-outlined text-[#5D2A82]">image</span>
                  <h2 className="text-lg font-bold text-[#5D2A82]">Product Media</h2>
                </div>
                
                {uploadedImages.length < 4 ? (
                  <label className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0096A9] hover:bg-[#E8F6F8] transition-colors group mb-6">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    <div className="w-14 h-14 rounded-full bg-[#E8F6F8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[#0096A9] text-3xl">cloud_upload</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {uploading ? 'Uploading to cloud...' : `Upload image (${uploadedImages.length}/4)`}
                    </h3>
                    <p className="text-xs text-gray-400">PNG, JPG or WebP (max. 5MB). PNG 1:1 recommended.</p>
                  </label>
                ) : (
                  <div className="p-4 bg-purple-50 text-primary border border-primary/20 rounded-xl text-center text-xs font-semibold mb-6">
                    🎉 Maximum of 4 clinical product images successfully uploaded!
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden relative group">
                      <img className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} src={url} />
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                        <button 
                          type="button" 
                          onClick={() => removeUploadedImage(url)}
                          className="text-white hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-[#0096A9] text-white text-[8px] font-bold text-center py-0.5 uppercase tracking-wide">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-white rounded-2xl border border-gray-200 soft-shadow p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <span className="material-symbols-outlined text-[#5D2A82]">payments</span>
                  <h2 className="text-lg font-bold text-[#5D2A82]">Pricing &amp; Inventory</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Cost Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DZD</span>
                        <input 
                          className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                          type="number" 
                          value={costPrice}
                          onChange={(e) => setCostPrice(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Sale Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DZD</span>
                        <input 
                          className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                          type="number" 
                          value={salePrice}
                          onChange={(e) => setSalePrice(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profit Margin */}
                  <div className="bg-[#E8F6F8] border border-[#0096A9]/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Margin</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#0096A9]">DZD {margin.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-[#0096A9]">({marginPercentage}%)</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#0096A9] text-3xl">trending_up</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">SKU</label>
                      <input 
                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                        type="text" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">In Stock</label>
                      <input 
                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                        type="number" 
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </form>

          {/* Sticky Footer Actions */}
          <div className="fixed bottom-0 right-0 left-0 md:left-[280px] bg-white border-t border-gray-200 p-4 px-8 flex items-center justify-between z-10 soft-shadow">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#0096A9]"></span>
              System Online
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={handleCloseForm}
                className="px-8 py-3.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublishProductSubmit}
                className="px-8 py-3.5 rounded-full bg-[#0096A9] text-white font-semibold hover:bg-[#007A8A] soft-shadow transition-colors"
              >
                {editingProductId ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}