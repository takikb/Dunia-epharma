// frontend/app/admin/orders/page.js
'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

// Fallback Mock Orders (Preserved from your Stitch design for resiliency)
const MOCK_ORDERS = [
  {
    _id: "mockord8829",
    createdAt: "2026-07-11T01:45:00.000Z",
    status: "PENDING",
    totalAmount: 7700,
    shippingAddress: "Nouvelle Ville, Constantine",
    phoneNumber: "+213 785964520",
    deliveryCompany: "Yalidine",
    deliveryType: "STOP_DESK",
    user: {
      name: "Maria Lina",
      email: "maria@example.com"
    },
    items: [
      {
        product: {
          name: "Hyaluronic Acid Serum",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLu8C6lnpfMTVhZ5R3Oy9JpJ4W-pJfM7GCkw7gYG58GUksrtQ94XodCBQ-odsnC3qkMIOqFIxzXsi9ZsKiYVJ1_LIVbWlT18Q92KP89qrdySjShxK5WUjUzWXB4vjGG2RIDhhK-_I7C812MoT-PpfWVPBSuRoV0sn2YgLqHEQeWtDDOMDalmaBg7uuOKdUpfyQFBp1tAdZOQ2KPlcD3VbdMp6KOupZ5qZuTfaOkYmFkVTcN_3Ub6URevmk8V"
        },
        quantity: 2,
        priceAtPurchase: 2500
      },
      {
        product: {
          name: "Purifying Gel Cleanser",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvTA17G1JI4oNPdM16ziyIs9pHtCoNFkZ-cJOVAkTcHQk7DcuOPuE2JFvv2nHp4VB6howZyWupqT9XfwpxDEVIDWl52YvCMZzX72_OFw9w6pxdEiHDOW-JNxIYu2TGwwSRc-qK2St0rB8d2hRJE5cgyc4rqq-dukX0s9pA_dJcxIiUTWEv33tnCOF3Ac1WOt2JiYE9xpm_uxA_bjh3MdkTEJ7Q3hTsekoUoPUxPurpaCt2ymUBbsOug-cY"
        },
        quantity: 1,
        priceAtPurchase: 2700
      }
    ]
  },
  {
    _id: "mockord8828",
    createdAt: "2026-07-11T00:15:00.000Z",
    status: "PENDING",
    totalAmount: 2500,
    shippingAddress: "Didouche Mourad, Algiers",
    phoneNumber: "+213 550112233",
    deliveryCompany: "Yalidine",
    deliveryType: "HOME_DELIVERY",
    user: {
      name: "Malek Abir",
      email: "malek@example.com"
    },
    items: [
      {
        product: {
          name: "Hyaluronic Acid Serum",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLu8C6lnpfMTVhZ5R3Oy9JpJ4W-pJfM7GCkw7gYG58GUksrtQ94XodCBQ-odsnC3qkMIOqFIxzXsi9ZsKiYVJ1_LIVbWlT18Q92KP89qrdySjShxK5WUjUzWXB4vjGG2RIDhhK-_I7C812MoT-PpfWVPBSuRoV0sn2YgLqHEQeWtDDOMDalmaBg7uuOKdUpfyQFBp1tAdZOQ2KPlcD3VbdMp6KOupZ5qZuTfaOkYmFkVTcN_3Ub6URevmk8V"
        },
        quantity: 1,
        priceAtPurchase: 2500
      }
    ]
  },
  {
    _id: "mockord8827",
    createdAt: "2026-07-10T21:00:00.000Z",
    status: "PENDING", // Updated from SHIPPED to PENDING
    totalAmount: 12000,
    shippingAddress: "Nouvelle Ville, Constantine",
    phoneNumber: "+213 770998877",
    deliveryCompany: "Yalidine",
    deliveryType: "STOP_DESK",
    user: {
      name: "Abir Osaid",
      email: "osaid@example.com"
    },
    items: [
      {
        product: {
          name: "Mineral SPF 50 Defense",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwNLsmrIaytihkpSNDy1PeL5NQGBkmqUuOAban9OY4OetjV7mcjimZDyJJJabtI_Xcmj6JzTTSlkD7DGAnsM1_6JBrOLnbT25s9YPYoys2_G4KR0DsCDNgInbMNYeqrrvvHPNv1w-1IsQshL5949PhMKYf5sa8QTlpTJyN-3tdWjyiki-SGDqSf3RDaSVzpooxvAZHW8gfsGQtyq5ITGNnKrC9WmyZxz4R-13I8SxJQj6IXX2tp2CRGNcN0K_SkeAto-yItFl1qVUQ"
        },
        quantity: 3,
        priceAtPurchase: 4000
      }
    ]
  }
];

export default function AdminOrders() {
  const { token } = useAuth();

  // --- Analytical States ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // Restricted strictly to PENDING or DELIVERED
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pure Time state to bypass React 19 compiler warnings
  const [currentTime, setCurrentTime] = useState(0);

  // --- Dynamic Invoice Overlay ---
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // 1. Fetch all system orders on mount
  useEffect(() => {
    if (!token) return;

    const fetchAllOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const finalOrders = data.length > 0 ? data : MOCK_ORDERS;
          setOrders(finalOrders);
          setSelectedOrder(finalOrders[0] || null);
        } else {
          setOrders(MOCK_ORDERS);
          setSelectedOrder(MOCK_ORDERS[0] || null);
        }
      } catch (err) {
        console.log('⚠️ Backend offline. Displaying standard analytical orders.');
        setOrders(MOCK_ORDERS);
        setSelectedOrder(MOCK_ORDERS[0] || null);
      } finally {
        setLoading(false);
      }
    };

    // Load static client time asynchronously
    setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    fetchAllOrders();
  }, [token]);

  // 2. Filter orders in the sidebar list based on selected status tab
  const getFilteredOrders = () => {
    return orders.filter(o => o.status === activeTab);
  };

  const filteredOrders = getFilteredOrders();

  // 3. Update Order Status (Mark directly as Delivered/Paid)
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;

    const orderId = selectedOrder._id;

    if (orderId.startsWith('mock')) {
      const updatedList = orders.map(o => {
        if (o._id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      });
      setOrders(updatedList);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      alert(`🤖 Mock Status updated: Mapped to ${newStatus}`);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/admin/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedList = orders.map(o => {
          if (o._id === orderId) {
            return { ...o, status: newStatus };
          }
          return o;
        });
        setOrders(updatedList);
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        alert(`Order marked as ${newStatus} successfully!`);
      } else {
        alert(data.message || 'Error updating status.');
      }
    } catch (err) {
      alert('Cannot connect to the shipping server.');
    }
  };

  // 4. Generate & Display PDF Invoice
  const handleGenerateInvoice = async () => {
    if (!selectedOrder) return;

    const orderId = selectedOrder._id;

    if (orderId.startsWith('mock')) {
      setActiveInvoice({
        invoiceNumber: `INV-${orderId.slice(-6).toUpperCase()}`,
        issueDate: selectedOrder.createdAt,
        customerName: selectedOrder.user?.name || "Customer",
        customerEmail: selectedOrder.user?.email || "customer@example.com",
        shippingAddress: selectedOrder.shippingAddress,
        phoneNumber: selectedOrder.phoneNumber,
        deliveryCompany: selectedOrder.deliveryCompany,
        deliveryType: selectedOrder.deliveryType,
        items: selectedOrder.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.priceAtPurchase,
          totalPrice: item.priceAtPurchase * item.quantity
        })),
        totalAmount: selectedOrder.totalAmount
      });
      return;
    }

    setInvoiceLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setActiveInvoice(data);
      } else {
        alert(data.message || 'Invoices can only be compiled for DELIVERED/COMPLETED orders.');
      }
    } catch (err) {
      alert('Error fetching invoice details.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-20 text-center font-body-lg text-primary bg-background min-h-[50vh] flex items-center justify-center">
        Synchronizing logistics ledger...
      </main>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-5rem)]">
      
      {/* ================= LEFT COLUMN: ORDER LIST SIDEBAR (35%) ================= */}
      <section className="w-[35%] min-w-[350px] bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="relative w-full mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-dunia-teal transition-all" placeholder="Search orders, transactions, IDs..." type="text" />
          </div>
          
          {/* Status Tabs Selector (Simplified to PENDING and DELIVERED) */}
          <div className="flex gap-6 mt-6">
            {['PENDING', 'DELIVERED'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-semibold transition-colors ${
                  activeTab === tab 
                    ? 'text-dunia-teal border-b-2 border-dunia-teal' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'PENDING' ? 'PROCESSING' : 'COMPLETED'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Orders list */}
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No orders found in this category.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder && selectedOrder._id === order._id;
              
              const dateDiff = currentTime > 0 
                ? Math.round((currentTime - new Date(order.createdAt).getTime()) / (1000 * 60))
                : 0;
              const formattedTime = currentTime > 0 
                ? (dateDiff < 60 ? `${dateDiff}m ago` : `${Math.round(dateDiff / 60)}h ago`)
                : 'Just now';

              return (
                <div 
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-dunia-teal-light border-l-4 border-l-dunia-teal' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-base font-bold ${isSelected ? 'text-dunia-teal' : 'text-gray-700'}`}>
                      #ORD-{order._id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{formattedTime}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {order.user?.name || 'Customer'}
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items • {order.totalAmount.toLocaleString()} DZD
                  </p>
                  
                  {/* Status color-coded badge indicators (Simplified) */}
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      order.status === 'DELIVERED' 
                        ? 'bg-secondary' 
                        : order.status === 'CANCELLED' 
                        ? 'bg-red-500' 
                        : 'bg-[#5D2A82]'
                    }`}></span>
                    <span className={`text-[10px] font-bold tracking-wide uppercase ${
                      order.status === 'DELIVERED' 
                        ? 'text-secondary' 
                        : order.status === 'CANCELLED' 
                        ? 'text-red-600' 
                        : 'text-[#5D2A82]'
                    }`}>
                      {order.status === 'PENDING' ? 'REQUIRES APPROVAL' : order.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ================= RIGHT COLUMN: ORDER DETAILS PANEL (65%) ================= */}
      <section className="w-[65%] bg-gray-50 overflow-y-auto p-8 h-full">
        {selectedOrder ? (
          <div>
            
            {/* Details Header & CTAs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Order #ORD-{selectedOrder._id.slice(-4).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    selectedOrder.status === 'DELIVERED' 
                      ? 'bg-green-50 text-green-700' 
                      : selectedOrder.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedOrder.status === 'PENDING' ? 'AWAITING APPROVAL' : selectedOrder.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Status Update Actions (Transition directly from PENDING to DELIVERED) */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleGenerateInvoice}
                  disabled={invoiceLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                  {invoiceLoading ? 'Compiling...' : 'Generate PDF Invoice'}
                </button>

                {/* Direct Deliver CTA (Replaces "Mark as Shipped") */}
                {selectedOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="flex items-center gap-2 px-6 py-2 bg-[#0096A9] text-white rounded-xl hover:bg-[#007A8A] transition-colors text-sm font-semibold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              
              {/* Customer Shipping Details Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center gap-8 border border-gray-100">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {selectedOrder.user?.name ? selectedOrder.user.name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedOrder.user?.name || 'Customer'}</h3>
                    <p className="text-sm font-semibold text-dunia-teal mt-0.5">Verified Profile</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-200 hidden lg:block"></div>
                
                <div className="flex flex-col sm:flex-row gap-8 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400 mt-0.5">phone</span>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Phone</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedOrder.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400 mt-0.5">location_on</span>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Shipping Address</p>
                      <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                        {selectedOrder.shippingAddress}
                      </p>
                      <p className="text-secondary font-semibold uppercase text-[10px] tracking-wide mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">local_shipping</span> 
                        {selectedOrder.deliveryCompany} • {selectedOrder.deliveryType === 'HOME_DELIVERY' ? 'Home' : 'Stop-Desk'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Items List Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Ordered Items ({selectedOrder.items.length})
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold text-center">QTY</th>
                      <th className="pb-3 font-semibold text-right">Price</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                            <img alt={item.product?.name} className="w-full h-full object-cover" src={item.product?.imageUrl} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.product?.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Clinical Formulation</p>
                          </div>
                        </td>
                        <td className="py-4 text-center text-sm text-gray-900 font-medium">
                          {item.quantity.toString().padStart(2, '0')}
                        </td>
                        <td className="py-4 text-right text-sm text-gray-600">
                          {item.priceAtPurchase.toLocaleString()} DZD
                        </td>
                        <td className="py-4 text-right text-base font-bold text-gray-900">
                          {(item.priceAtPurchase * item.quantity).toLocaleString()} DZD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mt-2">
                <div className="w-full max-w-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {(selectedOrder.totalAmount - (selectedOrder.deliveryType === 'STOP_DESK' ? 300 : 500)).toLocaleString()} DZD
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {selectedOrder.deliveryType === 'STOP_DESK' ? '300' : '500'} DZD
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-[#5D2A82]">
                      {selectedOrder.totalAmount.toLocaleString()} DZD
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-20 font-body-lg text-gray-400">
            Select an order from the list to consult its details.
          </div>
        )}
      </section>

      {/* ================= PRINT-READY GLASSMORPHIC INVOICE OVERLAY MODAL ================= */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md transition-all">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full relative shadow-[0_20px_50px_rgba(69,13,106,0.15)] animate-slide-in-up flex flex-col max-h-[90vh]">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-surface-variant pb-6">
              <div>
                <span className="font-headline-md text-headline-md tracking-widest font-light text-primary uppercase block mb-1">DUNIA</span>
                <span className="text-[10px] text-outline uppercase tracking-widest">Parapharmacie d&apos;elegance</span>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-1 font-semibold">{activeInvoice.invoiceNumber}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Date: {new Date(activeInvoice.issueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill & Delivery Details split grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 border-b border-surface-variant pb-6 text-sm font-body-md">
              <div>
                <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2 font-semibold">Bill To:</h4>
                <p className="text-on-surface font-semibold">{activeInvoice.customerName}</p>
                <p className="text-on-surface-variant mt-1">{activeInvoice.customerEmail}</p>
                <p className="text-on-surface-variant">{activeInvoice.phoneNumber}</p>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2 font-semibold">Shipping Details:</h4>
                <p className="text-on-surface-variant">{activeInvoice.shippingAddress}</p>
                <p className="text-secondary font-semibold mt-2 uppercase tracking-wide text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_shipping</span> {activeInvoice.deliveryCompany} • {activeInvoice.deliveryType === 'HOME_DELIVERY' ? 'Home' : 'Stop-Desk'}
                </p>
              </div>
            </div>

            {/* Invoice items list */}
            <div className="flex-grow overflow-y-auto mb-8 pr-2">
              <table className="w-full text-left font-body-md text-body-md">
                <thead>
                  <tr className="border-b border-surface-variant font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pb-2">
                    <th className="pb-3">Item Description</th>
                    <th className="text-center pb-3">Qty</th>
                    <th className="text-right pb-3">Unit Price</th>
                    <th className="text-right pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-surface-variant/40">
                      <td className="py-4 text-on-surface font-medium">{item.name}</td>
                      <td className="py-4 text-center text-on-surface-variant">{item.quantity}</td>
                      <td className="py-4 text-right text-on-surface-variant">{item.unitPrice.toLocaleString()} DZD</td>
                      <td className="py-4 text-right text-primary font-semibold">{item.totalPrice.toLocaleString()} DZD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer total calculation & Actions */}
            <div className="border-t border-surface-variant pt-6 mt-auto">
              <div className="flex justify-between items-center mb-8">
                <span className="font-headline-md text-headline-md text-on-surface font-light">Amount Due:</span>
                <span className="font-headline-md text-headline-md font-semibold text-primary">{activeInvoice.totalAmount.toLocaleString()} DZD</span>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveInvoice(null)}
                  className="flex-1 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest py-4 rounded-full transition-colors active:scale-95"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.print()} // Natively triggers system print-to-PDF dashboard!
                  className="flex-1 bg-secondary hover:bg-on-secondary-fixed-variant text-white font-label-sm text-label-sm uppercase tracking-widest py-4 rounded-full shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print / Save PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}