// frontend/app/profile/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Fallback Mock Orders (Preserved from your Stitch design for resiliency)
const MOCK_ORDERS = [
  {
    _id: "mockorder1",
    createdAt: "2026-07-10T12:00:00.000Z",
    status: "SHIPPED",
    totalAmount: 8400,
    shippingAddress: "Rue des Martyrs, Setif",
    phoneNumber: "0550112233",
    items: [
      {
        product: {
          name: "Hydrating Facial Serum",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLt1MRDIgA_3fTt-yjhq2HB5oeolXTE_11oBPFQWtwUHqHB7zJN5jDdT7K6nu08leaqloaZud21RyA-OtK-rDBH1uOR-MHeJLxEETOQQM9lyuQ6UbWTxgmi1AU7wbsJ5egIn1QkxPUwZh6Ks6r_rGOXaxZmC4sDXYu8RyqgQgH9uru6Do9RQuRGGBc3kdGy1BBDBjpiTGT1nceYDggh_rKXkGcvdjUtYhji7EM3_16NiXr8lkBYs8Ws1rwaz"
        },
        quantity: 1,
        priceAtPurchase: 4500
      },
      {
        product: {
          name: "Dermatological Cleanser",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvTA17G1JI4oNPdM16ziyIs9pHtCoNFkZ-cJOVAkTcHQk7DcuOPuE2JFvv2nHp4VB6howZyWupqT9XfwpxDEVIDWl52YvCMZzX72_OFw9w6pxdEiHDOW-JNxIYu2TGwwSRc-qK2St0rB8d2hRJE5cgyc4rqq-dukX0s9pA_dJcxIiUTWEv33tnCOF3Ac1WOt2JiYE9xpm_uxA_bjh3MdkTEJ7Q3hTsekoUoPUxPurpaCt2ymUBbsOug-cY"
        },
        quantity: 1,
        priceAtPurchase: 3900
      }
    ]
  },
  {
    _id: "mockorder2",
    createdAt: "2026-06-15T12:00:00.000Z",
    status: "DELIVERED",
    totalAmount: 4200,
    shippingAddress: "Didouche Mourad, Algiers",
    phoneNumber: "0770998877",
    items: [
      {
        product: {
          name: "Moisturizing Cream",
          imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLvxkzl304-v-613D54MyDI-zq6z-qYCrqTsuqQEoxec-i7UsBxr4foIoqDXQpx_MSsl38mBtVTob9WFbw0iCqyxstcEJS_Ws9qjsfQMCfiQJ7nNIZFQNbhcLe8ee3MjXYFM5QgfmMaclgY-NY552QJNBMCZxm6tUjZyzdD3z2BIsGp3mH8H0CPCJ4-oGzWoo33k0UdVou9dxsrqouh5QGegBkdPMfawvrsQR9M-o0c1JLj_uDNhxkL0h2pz"
        },
        quantity: 1,
        priceAtPurchase: 4200
      }
    ]
  }
];

export default function Profile() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'HISTORY', or 'RETURNS'

  // --- Dynamic Invoice Modal State ---
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // 1. Security Check: If not logged in, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  // 2. Fetch Customer orders from database
  useEffect(() => {
    if (!user || !token) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Fall back to mock list if database has zero orders
          setOrders(data.length > 0 ? data : MOCK_ORDERS);
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch (err) {
        console.log('⚠️ Backend offline. Displaying local dynamic mock orders.');
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  // 3. Filter orders locally based on selected tab
  const getFilteredOrders = () => {
    if (activeTab === 'ACTIVE') {
      return orders.filter(order => order.status === 'PENDING' || order.status === 'SHIPPED');
    } else if (activeTab === 'HISTORY') {
      return orders.filter(order => order.status === 'DELIVERED' || order.status === 'CANCELLED');
    }
    return []; // Return empty list for Returns tab mock state
  };

  const filteredOrders = getFilteredOrders();

  // 4. Secure Invoice Downloader (Fetches payload and opens print modal)
  const handleDownloadInvoice = async (orderId) => {
    if (orderId.startsWith('mock')) {
      // Mock invoice data for immediate presentation if using mock orders
      setActiveInvoice({
        invoiceNumber: "INV-9284AX",
        issueDate: "2026-07-10T14:30:00.000Z",
        customerName: user ? user.name : "Sarah Alger",
        customerEmail: user ? user.email : "sarah@example.com",
        shippingAddress: "Rue des Martyrs, Setif",
        phoneNumber: "0550112233",
        deliveryCompany: "Yalidine",
        deliveryType: "STOP_DESK",
        items: [
          { name: "Hydrating Facial Serum", quantity: 1, unitPrice: 4500, totalPrice: 4500 },
          { name: "Dermatological Cleanser", quantity: 1, unitPrice: 3900, totalPrice: 3900 }
        ],
        totalAmount: 8400
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
        alert(data.message || 'Error compiling invoice.');
      }
    } catch (err) {
      alert('Cannot connect to the invoice compilation server.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center font-body-lg text-primary bg-background">
        Verifying customer credentials...
      </main>
    );
  }

  return (
    <>
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-grow pt-32 pb-section-gap px-container-padding-mobile md:px-container-padding-desktop max-w-[1440px] mx-auto w-full">
        <div className="max-w-4xl mx-auto">
          
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-12 tracking-widest uppercase">
            My Orders
          </h1>

          {/* Interactive Navigation Tabs */}
          <div className="flex gap-2 mb-12 border-b border-surface-variant pb-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('ACTIVE')}
              className={`font-label-sm text-label-sm px-6 py-3 rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === 'ACTIVE' 
                  ? 'text-primary border-b-2 border-secondary bg-surface-container-low font-semibold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Active Orders ({orders.filter(o => o.status === 'PENDING' || o.status === 'SHIPPED').length})
            </button>
            
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={`font-label-sm text-label-sm px-6 py-3 rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === 'HISTORY' 
                  ? 'text-primary border-b-2 border-secondary bg-surface-container-low font-semibold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Order History ({orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED').length})
            </button>
            
            <button 
              onClick={() => setActiveTab('RETURNS')}
              className={`font-label-sm text-label-sm px-6 py-3 rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === 'RETURNS' 
                  ? 'text-primary border-b-2 border-secondary bg-surface-container-low font-semibold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Returns (0)
            </button>
          </div>

          {/* Dynamic Orders Mapping */}
          <div className="space-y-gutter">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-low rounded-xl border border-surface-variant/40">
                <p className="font-body-lg text-on-surface-variant">No orders found in this category.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div 
                  key={order._id} 
                  className={`bg-surface-container-lowest rounded-xl border border-surface-variant p-8 md:p-10 transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                    order.status === 'DELIVERED' ? 'opacity-90 hover:opacity-100' : 'ambient-shadow'
                  }`}
                >
                  {/* Card Header details */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-surface-variant pb-6">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                        Order #DUN-{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Dynamic Status Badges with local CSS indicator */}
                      <span className={`font-label-sm text-label-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${
                        order.status === 'DELIVERED' 
                          ? 'bg-surface-container text-on-surface-variant' 
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        {order.status !== 'DELIVERED' && (
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        )}
                        {order.status}
                      </span>
                      <p className="font-headline-md text-headline-md text-primary ml-4">
                        {order.totalAmount.toLocaleString()} DZD
                      </p>
                    </div>
                  </div>

                  {/* Sub-Items details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-center">
                        <div className="w-24 h-24 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden relative group">
                          <img 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            src={item.product?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaIQQLuNXHNBMWOtXu0snUoj4_CglUtqeMw9MahtLuzSjn9v5JcZ8WtCU736cCqnK4c4d-JB9oBcvNtrQD4X6IonHt2pMCh3HlNPqR1JSb7aJ-lEORhN-0XKPZ6Y07WF7ciAA5ZdhVWW1ceLydpvmECBeIcBuaV5qmbW7IJ5wA5pBQSPK8zYP1i8DI3_3eq8aNmhV9ohXLakrJGGqZEh_Q8ZHkitglvjQ296l7-nnWKxLo3Bh47MWGYGh2OI6nwoe22wJ8RzWHmJwU'} 
                          />
                        </div>
                        <div>
                          <h3 className="font-body-lg text-body-lg text-on-surface mb-1">
                            {item.product?.name || 'Skincare Formulation'}
                          </h3>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {order.status === 'DELIVERED' ? 'Delivered Product' : 'Active Shipping'}
                          </p>
                          <p className="font-label-sm text-label-sm text-primary mt-2">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Triggers */}
                  <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-surface-variant">
                    {order.status === 'DELIVERED' ? (
                      /* Invoice Download Trigger */
                      <button 
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="w-full sm:w-auto font-label-sm text-label-sm text-on-surface-variant bg-transparent border border-outline-variant hover:bg-surface-container px-6 py-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                        Download Invoice
                      </button>
                    ) : (
                      /* Standard Delivery details tracking fallback */
                      <>
                        <button className="w-full sm:w-auto font-label-sm text-label-sm text-secondary bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container px-8 py-4 rounded-full transition-all duration-300">
                          View Details
                        </button>
                        <button className="w-full sm:w-auto font-label-sm text-label-sm text-on-primary bg-secondary hover:bg-primary-container px-8 py-4 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          Track Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />

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
    </>
  );
}