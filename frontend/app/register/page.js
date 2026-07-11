// frontend/app/register/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Register() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Onboarding Step State (1: Account Details, 2: Personal Profile Quiz)
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Step 1 State: Account Details ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Step 2 State: Quiz Answers ---
  const [ageRange, setAgeRange] = useState('25 - 34');
  const [sex, setSex] = useState('female');
  const [skinType, setSkinType] = useState('Oily');
  const [skinConcerns, setSkinConcerns] = useState(['Acne', 'Dark Spots/Hyperpigmentation']);
  const [hairType, setHairType] = useState('Damaged/Frizzy');
  const [allergies, setAllergies] = useState(['Silicones']);

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

  // Handle Checked Concerns (Toggle values in array)
  const handleConcernChange = (concern) => {
    if (skinConcerns.includes(concern)) {
      setSkinConcerns(skinConcerns.filter(item => item !== concern));
    } else {
      setSkinConcerns([...skinConcerns, concern]);
    }
  };

  // Handle Checked Allergies (Toggle values in array)
  const handleAllergyChange = (allergy) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter(item => item !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  // Validate Step 1 and proceed
  const handleContinueToQuiz = () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all account fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  // Submit entire profile to Backend
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: fullName,
      email,
      password,
      customerProfile: {
        ageRange,
        sex,
        skinType,
        skinConcerns,
        hairType,
        allergies
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased min-h-screen">
      <Navbar />
      {step === 1 ? (
        /* ================= STEP 1: CREATE ACCOUNT ================= */
        <div className="flex flex-col md:flex-row w-full h-screen">
          
          {/* Left Column: Hero Image (Hidden on Mobile) */}
          <div className="hidden md:flex md:w-1/2 relative bg-surface-variant h-full overflow-hidden">
            <img 
              alt="DUNIA Skincare" 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDENtLl5flr5X5f-_QPq_fFPcti-yQ5Br82F7HJ7uDzooIBUkkQrePrxz4Tc4gd65FEo-icCX6ENnhOau0JfQL026yDbp9FBjA4TE-_pImIwi272HHIcd5D7nO4hXkJlxdm-84MXdAHfP58xVrGqHr2TUoyokJ5gdTUcwRPwlHrwuFk9KU6dSLmdLslzT29-c_giEmt1lEhoUg9qsm4UBzeoR-lk8wgVYh83hulE1VHHiKER10x4pdWemXxKEVvchyDuXN96o8bwlIO" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col justify-end p-12 lg:p-20 h-full text-white">
              <div className="mb-6">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBhnASzr2eCUH8zghfO-FT_7KKxcpYvEt-J0097D0cRNTapR7y0TSuY333keNPh9CIeje4rsml28D1ID236KEw9ynNZ3sQxMLpEAFRE4D3pFkxvqD8Q3NxnJ7LZeF0J2K5s6vEVg8vu1KlKzAenwGLcij6VvFtauMru6R7GLlnvVTy5T6DlE7WAEOWVXDje-3CLN1eg-A0q9l_bff0DpweEphdtuvyWToXqimlX68uKROA3ndzUwVAWIQ0AkaXLl5yvG8B-EQpOBpO" 
                  alt="DUNIA Logo" 
                  className="h-12 md:h-16 w-auto object-contain" 
                />
              </div>
              <p className="font-body-lg text-white/90 max-w-md">Step 1: Join the future of personalized skincare, haircare, and wellness.</p>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 h-full overflow-y-auto bg-surface-container-lowest">
            <div className="w-full max-w-md space-y-10">
              <div className="space-y-4">
                <span className="font-label-sm text-primary-container uppercase tracking-widest">Step 1 of 2</span>
                <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface">Create your account</h2>
                <p className="font-body-md text-on-surface-variant">Save your profile and track your personalized routines.</p>
              </div>

              {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              <form className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="sr-only" htmlFor="fullName">Full Name</label>
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 font-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 focus:bg-surface-container-lowest transition-all" 
                      id="fullName" 
                      placeholder="Full Name" 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="email">Email Address</label>
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 font-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 focus:bg-surface-container-lowest transition-all" 
                      id="email" 
                      placeholder="Email Address" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="password">Password</label>
                    <input 
                      className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 font-body-md text-on-surface placeholder-on-surface-variant/60 focus:ring-2 focus:ring-primary-container/50 focus:bg-surface-container-lowest transition-all" 
                      id="password" 
                      placeholder="Password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleContinueToQuiz}
                  className="w-full bg-primary-container hover:bg-primary text-white rounded-full py-4 px-6 font-body-md flex items-center justify-center gap-2 shadow-sm shadow-primary-container/20 hover:shadow-md hover:shadow-primary-container/30 transition-all duration-300 group" 
                  type="button"
                >
                  Continue to Personal Profile
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </form>

              <p className="text-center font-body-md text-on-surface-variant">
                Already have an account?{' '} 
                <Link className="text-primary-container hover:text-primary underline underline-offset-4 font-medium transition-colors" href="/login" style={{ color: 'rgb(0, 150, 169)' }}>
                  Log in
                </Link>
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* ================= STEP 2: SKIN & HAIR PROFILE ================= */
        <div className="min-h-screen flex flex-col items-center justify-center p-container-padding-mobile md:p-container-padding-desktop bg-[#F7F2FA]">
          <div className="fixed top-0 left-0 w-full h-2 bg-surface-container-high z-50">
            <div className="h-full bg-primary-container w-full transition-all duration-500 ease-in-out"></div>
          </div>

          <main className="w-full max-w-3xl bg-surface-container-lowest rounded-[2.5rem] ambient-shadow p-8 md:p-12 relative overflow-hidden mt-8 mb-16">
            <header className="mb-10 text-center">
              <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-4">Step 2 of 2: Your Personal Care Profile</p>
              <h1 className="text-3xl font-light text-on-surface">Tell us about your canvas.</h1>
              {error && (
                <div className="p-4 mt-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}
            </header>

            <form onSubmit={handleFinalRegister} className="space-y-12">
              
              {/* Demographics (Natively Bound to Inputs) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Age Range</label>
                  <div className="relative">
                    <select 
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="block w-full appearance-none bg-surface-container border border-outline-variant text-on-surface py-3 px-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md transition-all"
                    >
                      <option>18 - 24</option>
                      <option>25 - 34</option>
                      <option>35 - 44</option>
                      <option>45 - 54</option>
                      <option>55+</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Biological Sex</label>
                  <div className="flex p-1 bg-surface-container rounded-full w-full">
                    {/* Fixed Male Selector */}
                    <label className="flex-1 text-center cursor-pointer pill-radio">
                      <input 
                        className="hidden" 
                        name="sex" 
                        type="radio" 
                        value="male"
                        checked={sex === 'male'}
                        onChange={() => setSex('male')}
                      />
                      <div className="py-2 px-4 rounded-full font-body-md text-body-md text-on-surface-variant border border-transparent transition-all hover:bg-surface-variant">Male</div>
                    </label>
                    {/* Fixed Female Selector */}
                    <label className="flex-1 text-center cursor-pointer pill-radio">
                      <input 
                        className="hidden" 
                        name="sex" 
                        type="radio" 
                        value="female"
                        checked={sex === 'female'}
                        onChange={() => setSex('female')}
                      />
                      <div className="py-2 px-4 rounded-full font-body-md text-body-md text-on-surface-variant border border-transparent transition-all hover:bg-surface-variant">Female</div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Skincare Profile */}
              <section className="space-y-6">
                <div className="border-b border-primary-fixed pb-2 mb-6">
                  <h2 className="font-headline-md text-headline-md text-primary">1. Your Skin Profile</h2>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-4">Primary Skin Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: 'Normal', value: 'Normal' },
                      { label: 'Oily', value: 'Oily' },
                      { label: 'Dry', value: 'Dry' },
                      { label: 'Combination', value: 'Combination' },
                      { label: 'Sensitive', value: 'Sensitive' }
                    ].map((type) => (
                      <label key={type.value} className="cursor-pointer pill-radio">
                        <input 
                          className="hidden" 
                          name="skintype" 
                          type="radio" 
                          value={type.value}
                          checked={skinType === type.value}
                          onChange={() => setSkinType(type.value)}
                        />
                        <div className="py-3 px-2 text-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-all hover:border-primary">
                          {type.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-4">Primary Concerns (Select all that apply)</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: 'Acne', value: 'Acne' },
                      { label: 'Aging/Wrinkles', value: 'Aging/Wrinkles' },
                      { label: 'Dark Spots/Hyperpigmentation', value: 'Dark Spots/Hyperpigmentation' },
                      { label: 'Redness/Rosacea', value: 'Redness/Rosacea' },
                      { label: 'Dehydration', value: 'Dehydration' },
                      { label: 'Dullness', value: 'Dullness' }
                    ].map((concern) => {
                      const isChecked = skinConcerns.includes(concern.value);
                      return (
                        <label key={concern.value} className="cursor-pointer pill-checkbox">
                          <input 
                            className="hidden" 
                            type="checkbox" 
                            value={concern.value}
                            checked={isChecked}
                            onChange={() => handleConcernChange(concern.value)}
                          />
                          <div className="py-2 px-5 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-all hover:border-primary">
                            {concern.label}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Haircare Profile */}
              <section className="space-y-6">
                <div className="border-b border-primary-fixed pb-2 mb-6">
                  <h2 className="font-headline-md text-headline-md text-primary">2. Your Hair Profile</h2>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-4">Primary Hair Type/Concern</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: 'Normal', value: 'Normal' },
                      { label: 'Oily', value: 'Oily' },
                      { label: 'Dry', value: 'Dry' },
                      { label: 'Damaged/Frizzy', value: 'Damaged/Frizzy' },
                      { label: 'Thinning/Hair Loss', value: 'Thinning/Hair Loss' },
                      { label: 'Dandruff-Prone', value: 'Dandruff-Prone' }
                    ].map((type) => (
                      <label key={type.value} className="cursor-pointer pill-radio">
                        <input 
                          className="hidden" 
                          name="hairtype" 
                          type="radio" 
                          value={type.value}
                          checked={hairType === type.value}
                          onChange={() => setHairType(type.value)}
                        />
                        <div className="py-3 px-4 text-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-all hover:border-primary">
                          {type.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Allergies */}
              <section className="space-y-6">
                <div className="border-b border-primary-fixed pb-2 mb-6">
                  <h2 className="font-headline-md text-headline-md text-primary">3. Allergies &amp; Sensitivities <span className="text-outline text-sm font-normal">(Optional)</span></h2>
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Select any ingredients you prefer to avoid:</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: 'Fragrance', value: 'Fragrance' },
                      { label: 'Parabens', value: 'Parabens' },
                      { label: 'Sulfates', value: 'Sulfates' },
                      { label: 'Silicones', value: 'Silicones' },
                      { label: 'Essential Oils', value: 'Essential Oils' }
                    ].map((allergy) => {
                      const isChecked = allergies.includes(allergy.value);
                      return (
                        <label key={allergy.value} className={isChecked ? "cursor-pointer" : "cursor-pointer pill-checkbox"}>
                          <input 
                            className="hidden" 
                            type="checkbox" 
                            value={allergy.value}
                            checked={isChecked}
                            onChange={() => handleAllergyChange(allergy.value)}
                          />
                          {isChecked ? (
                            <div className="py-2 px-5 rounded-full border border-red-500 bg-red-50 text-red-600 font-body-md text-body-md transition-all font-semibold">
                              {allergy.label}
                            </div>
                          ) : (
                            <div className="py-2 px-5 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-all hover:border-error hover:text-error">
                              {allergy.label}
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="pt-8 mt-12 border-t border-surface-variant flex items-center justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors flex items-center gap-2" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back
                </button>
                <button 
                  disabled={loading}
                  className="bg-[#0096A9] text-white py-3 px-8 rounded-full font-label-sm text-label-sm tracking-widest uppercase hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#0096A9]/20 flex items-center gap-2" 
                  type="submit"
                >
                  {loading ? 'Processing...' : 'Create my personal account'}
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                </button>
              </div>

            </form>
          </main>
        </div>
      )}
        <Footer />
    </div>
  );
}