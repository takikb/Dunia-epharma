// frontend/app/admin/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, token } = useAuth();

  // --- Live Analytical States ---
  const [stats, setStats] = useState({ totalRevenue: 8000, totalCheckouts: 4, totalCustomers: 8924, lowStockCount: 14 });
  const [bestSellers, setBestSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live metrics from admin controllers on mount
  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        // A. Fetch Overview metrics (cards)
        const statsRes = await fetch('http://localhost:5000/api/admin/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // B. Fetch Best Selling Products
        const bSellersRes = await fetch('http://localhost:5000/api/admin/best-sellers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bSellersRes.ok) {
          const bData = await bSellersRes.json();
          setBestSellers(bData.slice(0, 4));
        }

        // C. Fetch Recent Orders
        const ordersRes = await fetch('http://localhost:5000/api/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          setRecentOrders(oData.slice(0, 4));
        }

        // D. Fetch Sales Performance Timeline
        const timelineRes = await fetch('http://localhost:5000/api/admin/sales-timeline', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setChartData(timelineData.chartData);
        }
      } catch (err) {
        console.log('⚠️ Backend offline. Displaying standard analytical mockup data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // 2. DYNAMIC SVG PLOTTING ALGORITHM
  const generateSvgPath = () => {
    // Fallback static points if no backend chart data is loaded yet
    if (!chartData || chartData.length < 2) {
      return {
        linePath: "M0,150 L50,130 L100,140 L150,90 L200,100 L250,50 L300,70 L350,30 L400,60 L450,20 L500,40",
        areaPath: "M0,150 L50,130 L100,140 L150,90 L200,100 L250,50 L300,70 L350,30 L400,60 L450,20 L500,40 L500,200 L0,200 Z",
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      };
    }

    const width = 500;
    const height = 200;
    const baseLine = 160; // Bottom grid line position
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000); // Prevent divide by 0

    // Plot exact coordinates dynamically
    const points = chartData.map((d, index) => {
      const x = (index / (chartData.length - 1)) * width;
      // Scale revenue value dynamically to fit the 120px chart height ceiling
      const y = baseLine - (d.revenue / maxRevenue) * 120;
      return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
    
    // Parse readable labels from dates (e.g. "09 Jul" or "Mon")
    const labels = chartData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    });

    return { linePath, areaPath, labels };
  };

  const svg = generateSvgPath();

  return (
    <main className="flex-grow p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Hero Banner */}
        <section className="bg-[#F7F2FA] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Welcome back, {user ? user.name : 'Administrator'}</h1>
            <p className="text-gray-600 text-base max-w-lg">
              Here&apos;s what&apos;s happening with your store today. Your clinical inventory is currently operating at optimal levels.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 z-10">
            <Link href="/" className="px-6 py-2.5 border border-gray-300 bg-white rounded-full text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors text-center">
              View Storefront
            </Link>
            <Link href="/admin/inventory" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium shadow-sm hover:opacity-90 hover:scale-[0.98] transition-all text-center">
              Manage Inventory
            </Link>
          </div>
        </section>

        {/* Overview Stats Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Orders placed */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 ambient-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Today&apos;s Orders</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
              </div>
            </div>
            <div className="mt-auto">
              <span className="text-3xl font-light text-gray-900">{stats.totalCheckouts}</span>
              <div className="flex items-center text-secondary text-xs mt-1 font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                <span>+12% from yesterday</span>
              </div>
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 ambient-shadow flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Today&apos;s Revenue</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">payments</span>
              </div>
            </div>
            <div className="mt-auto relative z-10">
              <span className="text-3xl font-bold text-primary font-sans-nums">
                {stats.totalRevenue.toLocaleString()} <span className="text-xl font-light">DZD</span>
              </span>
            </div>
          </div>

          {/* Card 3: Registered Customers */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 ambient-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Total Customers</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">group</span>
              </div>
            </div>
            <div className="mt-auto">
              <span className="text-3xl font-light text-gray-900 font-sans-nums">{stats.totalCustomers}</span>
            </div>
          </div>

          {/* Card 4: Low Stock Alert Warning widget */}
          <div className={`rounded-xl p-5 border ambient-shadow flex flex-col ${
            stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                Low Stock Alert
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                stats.lowStockCount > 0 ? 'bg-white text-red-500' : 'bg-purple-50 text-primary'
              }`}>
                <span className="material-symbols-outlined text-sm">warning</span>
              </div>
            </div>
            <div className="mt-auto">
              <span className={`text-3xl font-bold font-sans-nums ${
                stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {stats.lowStockCount} <span className="text-lg font-light">Items</span>
              </span>
              <p className={`text-xs mt-1 ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {stats.lowStockCount > 0 ? 'Requires immediate attention' : 'Inventory levels healthy'}
              </p>
            </div>
          </div>
        </section>

        {/* Analytics line graph area & best sellers side panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dynamic SVG Sales Line Graph */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 ambient-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <select className="bg-transparent border-none text-sm text-gray-500 focus:ring-0 cursor-pointer">
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0096A9" stopOpacity="0.15"></stop>
                    <stop offset="100%" stopColor="#0096A9" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="500" y1="160" y2="160"></line>
                <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="500" y1="120" y2="120"></line>
                <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="500" y1="80" y2="80"></line>
                <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="500" y1="40" y2="40"></line>
                
                {/* Dynamically Plotted SVG Paths based on live database transactions */}
                <path className="chart-area" d={svg.areaPath}></path>
                <path className="chart-path" d={svg.linePath}></path>
                
                {/* Dynamically Plotted Dots for live data points */}
                {chartData && chartData.slice(-3).map((d, index) => {
                  const width = 500;
                  const baseLine = 160;
                  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);
                  const x = ((chartData.length - 3 + index) / (chartData.length - 1)) * width;
                  const y = baseLine - (d.revenue / maxRevenue) * 120;
                  return (
                    <circle key={index} cx={x} cy={y} fill="#ffffff" r="4" stroke="#0096A9" strokeWidth="2"></circle>
                  );
                })}
              </svg>
              <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 px-2 transform translate-y-6">
                {svg.labels.map((lbl, idx) => (
                  <span key={idx}>{lbl}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Products Progress bar list */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 ambient-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Products</h2>
            <div className="space-y-5">
              {bestSellers.length === 0 ? (
                /* Fallback standard best sellers if empty */
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-900 font-medium">Hyaluronic Acid Serum</span>
                      <span className="text-gray-500 text-xs">42 sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-secondary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-900 font-medium">Niacinamide 10%</span>
                      <span className="text-gray-500 text-xs">38 sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-secondary h-1.5 rounded-full opacity-80" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-900 font-medium">Ceramide Barrier Cream</span>
                      <span className="text-gray-500 text-xs">24 sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-secondary h-1.5 rounded-full opacity-60" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </>
              ) : (
                bestSellers.map((item, idx) => {
                  const maxSales = Math.max(...bestSellers.map(b => b.totalQuantitySold), 10);
                  const widthPercentage = (item.totalQuantitySold / maxSales) * 100;
                  return (
                    <div key={item._id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-900 font-medium line-clamp-1">{item.name}</span>
                        <span className="text-gray-500 text-xs">{item.totalQuantitySold} sold</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-secondary h-1.5 rounded-full" 
                          style={{ width: `${widthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Link href="/admin/inventory" className="w-full mt-6 py-2 text-primary text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block">
              View All Products
            </Link>
          </div>
        </section>

        {/* Recent Orders Database Table */}
        <section className="bg-white rounded-xl border border-gray-200 ambient-shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] font-semibold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  /* Fallback standard recent orders mock list if database has 0 checkouts */
                  <>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">#ORD-7829</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-100 mr-2 flex items-center justify-center text-[10px] font-bold text-gray-700">A</div>
                          <span className="text-gray-900">Amina K.</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-sans-nums">Today, 10:42 AM</td>
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">4,200 DZD</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E0F7FA] text-secondary">
                          Delivered
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">#ORD-7828</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-100 mr-2 flex items-center justify-center text-[10px] font-bold text-gray-700">M</div>
                          <span className="text-gray-900">Mehdi T.</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-sans-nums">Today, 09:15 AM</td>
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">1,850 DZD</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-primary">
                          Processing
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </td>
                    </tr>
                  </>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">
                        #ORD-{order._id.slice(-4).toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex items-center justify-center text-[10px] font-bold">
                            {order.user?.name ? order.user.name[0].toUpperCase() : 'C'}
                          </div>
                          <span className="text-gray-900">{order.user?.name || 'Customer'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-sans-nums">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 font-sans-nums">
                        {order.totalAmount.toLocaleString()} DZD
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' 
                            ? 'bg-[#E0F7FA] text-secondary' 
                            : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-purple-50 text-primary'
                        }`}>
                          {order.status === 'PENDING' ? 'Processing' : order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href="/admin/orders" className="text-gray-400 hover:text-primary">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}