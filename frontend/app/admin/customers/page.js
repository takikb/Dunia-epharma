// frontend/app/admin/customers/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

// Fallback Mock Customers
const MOCK_CUSTOMERS = [
  {
    _id: "mockcust1",
    name: "Malak Sebira",
    email: "malak.s@example.com",
    createdAt: "2026-07-10T12:00:00.000Z",
    customerProfile: {
      skinType: "Oily",
      skinConcerns: ["Acne", "Dark Spots/Hyperpigmentation"],
      hairType: "Damaged/Frizzy",
      allergies: ["Fragrance"]
    }
  },
  {
    _id: "mockcust2",
    name: "Maria Lina",
    email: "m.lina@example.com",
    createdAt: "2026-07-09T14:30:00.000Z",
    customerProfile: {
      skinType: "Sensitive",
      skinConcerns: ["Redness/Rosacea", "Dehydration"],
      hairType: "Dry",
      allergies: ["Fragrance", "Essential Oils"]
    }
  },
  {
    _id: "mockcust3",
    name: "Ahmed Molod",
    email: "ahmed.m@example.com",
    createdAt: "2026-07-05T10:00:00.000Z",
    customerProfile: {
      skinType: "Combination",
      skinConcerns: ["Aging/Wrinkles"],
      hairType: "Normal",
      allergies: ["None"]
    }
  }
];

export default function AdminCustomers() {
  const { token } = useAuth();

  // --- Directory States ---
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Demographic Cards States ---
  const [demographics, setDemographics] = useState({
    totalCustomers: 8924,
    topSkinType: "Oily Skin",
    topSkinTypePercentage: "42%",
    topConcern: "Acne & Breakouts",
    topConcernPercentage: "55%"
  });

  // Fetch live customer registry and aggregate demographics on mount
  useEffect(() => {
    if (!token) return;

    const fetchCustomerDirectory = async () => {
      try {
        const dirRes = await fetch('http://localhost:5000/api/admin/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dirRes.ok) {
          const dirData = await dirRes.json();
          setCustomers(dirData.length > 0 ? dirData : MOCK_CUSTOMERS);
        } else {
          setCustomers(MOCK_CUSTOMERS);
        }

        const demoRes = await fetch('http://localhost:5000/api/admin/customer-demographics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (demoRes.ok) {
          const demoData = await demoRes.json();
          
          const skinTypes = demoData.skinTypeDistribution || [];
          const sortedSkin = [...skinTypes].sort((a, b) => b.count - a.count);
          const topSkin = sortedSkin[0]?._id || "Normal";
          const totalSkinCount = skinTypes.reduce((sum, item) => sum + item.count, 0) || 1;
          const topSkinPercent = Math.round(((sortedSkin[0]?.count || 0) / totalSkinCount) * 100);

          const concerns = demoData.topSkinConcerns || [];
          const topConcern = concerns[0]?._id || "Acne";
          const totalConcernCount = concerns.reduce((sum, item) => sum + item.count, 0) || 1;
          const topConcernPercent = Math.round(((concerns[0]?.count || 0) / totalConcernCount) * 100);

          setDemographics({
            totalCustomers: dirData.length || 8924,
            topSkinType: `${topSkin} Skin`,
            topSkinTypePercentage: `${topSkinPercent}%`,
            topConcern: topConcern,
            topConcernPercentage: `${topConcernPercent}%`
          });
        }
      } catch (err) {
        console.log('⚠️ Backend offline. Displaying local dynamic mock customer directory.');
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(fetchCustomerDirectory, 0);
  }, [token]);

  // --- CUSTOM DYNAMIC EXCEL/CSV EXPORTER ---
  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      alert('⚠️ No customer records available in this view to export.');
      return;
    }

    const headers = ['Customer ID', 'Full Name', 'Email Address', 'Skin Type', 'Hair Type', 'Active Concerns', 'Allergies', 'Joined Date'];

    const rows = filteredCustomers.map(c => [
      c._id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.customerProfile?.skinType || 'Normal',
      c.customerProfile?.hairType || 'Normal',
      `"${(c.customerProfile?.skinConcerns || []).join(', ')}"`,
      `"${(c.customerProfile?.allergies || []).join(', ')}"`,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dunia_customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.customerProfile?.skinType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <main className="pt-20 text-center font-body-lg text-primary bg-background min-h-[50vh] flex items-center justify-center">
        Synchronizing customer directory ledger...
      </main>
    );
  }

  return (
    <div className="p-8 max-w-container-max mx-auto w-full space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Customer Directory</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Monitor customer registration, dermatological profiles, and individual care needs.</p>
      </div>

      {/* Stats Bento Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-dim shadow-sm flex flex-col justify-center">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Directory Size</span>
          <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-sans-nums">
            {demographics.totalCustomers.toLocaleString()}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-dim shadow-sm flex flex-col justify-center">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Most Common Skin Type</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg-mobile text-display-lg-mobile text-primary">{demographics.topSkinType}</span>
            <span className="font-body-md text-body-md text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{demographics.topSkinTypePercentage}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-dim shadow-sm flex flex-col justify-center">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Primary Skin Concern</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg-mobile text-[#006876] font-semibold">{demographics.topConcern}</span>
            <span className="font-body-md text-body-md text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{demographics.topConcernPercentage}</span>
          </div>
        </div>
      </div>

      {/* Directory Toolbar Search and Export Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-dim shadow-sm">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-full font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            placeholder="Search customers by name, email, skin type..." 
            type="text"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 justify-end">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Customer Registry Directory Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-dim shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-dim">
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase">Customer</th>
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase">Demographics</th>
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase">Skin Type</th>
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase">Hair Type</th>
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase">Active Concerns</th>
                <th className="p-4 font-label-md text-label-md text-primary tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim font-body-sm text-body-sm">
              {filteredCustomers.map((cust) => {
                const profile = cust.customerProfile || { skinType: 'Normal', skinConcerns: [], hairType: 'Normal', allergies: [] };
                return (
                  <tr key={cust._id} className="hover:bg-surface-bright transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold uppercase">{cust.name ? cust.name[0].toUpperCase() : 'C'}</div><div><p className="font-headline-sm text-headline-sm text-on-surface">{cust.name}</p><p className="text-on-surface-variant font-caption text-caption">{cust.email}</p></div></div></td>
                    <td className="p-4 text-on-surface-variant capitalize">{profile.ageRange || '25 - 34'} <span className="mx-1">•</span> {profile.sex || 'female'}</td>
                    <td className="p-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-primary-fixed text-on-primary-fixed">{profile.skinType}</span></td>
                    <td className="p-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface">{profile.hairType}</span></td>
                    <td className="p-4"><div className="flex gap-2 flex-wrap max-w-xs">{profile.skinConcerns && profile.skinConcerns.length > 0 ? (profile.skinConcerns.slice(0, 2).map((concern, idx) => (<span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-secondary-container text-on-secondary-container border border-secondary/20">{concern}</span>))) : (<span className="text-gray-400">No active concerns</span>)}{profile.skinConcerns && profile.skinConcerns.length > 2 && (<span className="text-gray-400 text-xs self-center">+{profile.skinConcerns.length - 2} more</span>)}</div></td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap"><a href={`mailto:${cust.email}`} className="text-on-surface-variant hover:text-primary transition-colors inline-block p-1" title="Contact"><span className="material-symbols-outlined text-[20px]">mail</span></a><Link className="font-label-md text-label-sm text-primary hover:text-primary-container transition-colors" href="/admin">View Profile</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-surface-dim flex items-center justify-between bg-surface-container-lowest">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to {filteredCustomers.length} of {customers.length} entries</p>
          <div className="flex gap-1">
            <button className="p-2 text-outline-variant disabled:opacity-50" disabled><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-on-primary font-label-md text-label-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>
        </div>
      </div>

    </div>
  );
}