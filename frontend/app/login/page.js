// frontend/app/login/page.js
'use client';

import React, { useState, useEffect } from 'react'; // Fixed: Imported useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Login() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Guard: Redirect if already authenticated
  useEffect(() => {
    const checkRedirect = () => {
      if (user) {
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    };
    setTimeout(checkRedirect, 0);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Main Container: Offset by pt-20 for the fixed Header */}
      <main className="pt-20 w-full min-h-screen">
        <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased flex flex-col md:flex-row w-full h-[calc(100vh-5rem)]">
          {/* Main Container: Split Screen Layout */}
          <div className="flex w-full h-full">
            
            {/* Left Column: Image Background (Desktop Only) */}
            <div className="hidden md:flex md:w-1/2 relative bg-surface-container-high h-full overflow-hidden">
              {/* Background Image */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center" 
                style={{ 
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDENtLl5flr5X5f-_QPq_fFPcti-yQ5Br82F7HJ7uDzooIBUkkQrePrxz4Tc4gd65FEo-icCX6ENnhOau0JfQL026yDbp9FBjA4TE-_pImIwi272HHIcd5D7nO4hXkJlxdm-84MXdAHfP58xVrGqHr2TUoyokJ5gdTUcwRPwlHrwuFk9KU6dSLmdLslzT29-c_giEmt1lEhoUg9qsm4UBzeoR-lk8wgVYh83hulE1VHHiKER10x4pdWemXxKEVvchyDuXN96o8bwlIO")' 
                }}
              ></div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Content (Bottom Left) */}
              <div className="absolute bottom-0 left-0 p-container-padding-desktop z-10 w-full max-w-lg">
                <div className="mb-4">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL3lkWMHMdz_58hcpSUB_4vu8GxhP1rO5YCq7Yv9byaceuIvrKUNFv3uggQgDo4eTD1vBoDBRsTGFTmwiLo2OV7OBcmdCWl-Fu6bwwX3mQFke7ymBDmkKnChEenHl0pklObpF-_U2SerbFpA2vy4gzR75oncoCES6ehBwlmSw_cL2etsZs_RaAyfrjA-zxITlkMiL-P0AwM2nsbYYOG8-M6fYaytbfY11EK8KyKEX6RXJW0DKWyr-uNMb92Dt24B-9_9T6sIkeWZ-H" 
                    alt="DUNIA" 
                    className="h-12 w-auto object-contain" 
                  />
                </div>
                <p className="text-white/90 font-body-lg text-body-lg">
                  Welcome back to personalized care.
                </p>
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-container-padding-mobile lg:p-container-padding-desktop bg-surface-container-lowest h-full overflow-y-auto">
              <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-[60vh]">
                
                {/* Header Section */}
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-[#1F2937] font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg tracking-tight mb-3">
                    Welcome back.
                  </h2>
                  <p className="text-on-surface-variant font-body-md text-body-md">
                    Log in to access your prescribed routines and track your orders.
                  </p>
                </div>

                {error && (
                  <div className="p-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    ⚠️ {error}
                  </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="sr-only" htmlFor="email">Email Address</label>
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 font-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 focus:bg-surface-container-lowest transition-all" 
                      id="email" 
                      name="email" 
                      placeholder="Email Address" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  {/* Password Input */}
                  <div>
                    <label className="sr-only" htmlFor="password">Password</label>
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 font-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 focus:bg-surface-container-lowest transition-all" 
                      id="password" 
                      name="password" 
                      placeholder="Password" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    {/* Forgot Password Link */}
                    <div className="mt-2 text-right">
                      <Link className="text-[#0096A9] hover:text-[#006977] font-label-sm text-label-sm transition-colors" href="#">
                        Forgot your password?
                      </Link>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    disabled={loading}
                    className="w-full bg-primary-container text-white rounded-full py-4 px-6 font-body-md text-body-md font-semibold hover:bg-primary-container/90 focus:outline-none focus:ring-4 focus:ring-primary-container/30 transition-all shadow-[0_4px_14px_0_rgba(93,42,130,0.2)] hover:shadow-[0_6px_20px_rgba(93,42,130,0.3)] hover:-translate-y-[1px] flex justify-center items-center gap-2 mt-4" 
                    type="submit"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                    <span aria-hidden="true" className="material-symbols-outlined text-[1.2em]" style={{ fontVariationSettings: '"FILL" 1' }}>arrow_forward</span>
                  </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center md:text-left">
                  <p className="text-on-surface-variant font-body-md text-body-md">
                    Don&apos;t have an account?{' '}
                    <Link className="text-primary-container font-semibold hover:text-primary transition-colors underline decoration-2 underline-offset-4" href="/register">
                      Sign up
                    </Link>
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}