'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace/data';
import { MARKETPLACE_CONDITIONS } from '@/lib/marketplace/types';
import type { MarketplaceCategoryId, MarketplaceCondition } from '@/lib/marketplace/types';
import { useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

const POSTABLE_CATEGORIES = MARKETPLACE_CATEGORIES.filter((category) => category.id !== 'all');

type PostForm = {
  title: string;
  categoryId: Exclude<MarketplaceCategoryId, 'all'>;
  condition: MarketplaceCondition;
  price: string;
  negotiable: boolean;
  location: string;
  description: string;
};

const EMPTY_FORM: PostForm = {
  title: '',
  categoryId: 'electronics',
  condition: 'Like New',
  price: '',
  negotiable: true,
  location: '',
  description: '',
};

export default function MarketplacePostPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!token) setAuthOpen(true);
  }, [token]);

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (!form.title.trim() || !form.price.trim() || !form.location.trim()) {
      showToast('Add a title, price, and location before posting.', 'warning', 'Missing details');
      return;
    }
    showToast('This form is ready for the listing API. Nothing was posted yet.', 'info', 'Almost there');
  };

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => {
            setAuthOpen(false);
            if (!token) router.push('/marketplace');
          }}
          message="Log in to post an ad on Marketplace."
        />
      )}
      <main className="marketplace-page">
        <div className="marketplace-post">
          <button type="button" className="marketplace-detail-back" onClick={() => router.push('/marketplace')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Marketplace
          </button>

          <h1>Post an ad</h1>
          <p>Free listing — reach buyers near you. Photos and publishing will connect with the API next.</p>

          <form className="marketplace-post-form" onSubmit={handleSubmit}>
            <label className="marketplace-field">
              <span>Title</span>
              <input
                value={form.title}
                onChange={(event) => set('title', event.target.value)}
                placeholder="e.g. iPhone 14 Pro Max - 256GB"
              />
            </label>

            <div className="marketplace-price-fields">
              <label className="marketplace-field">
                <span>Category</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => set('categoryId', event.target.value as PostForm['categoryId'])}
                >
                  {POSTABLE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="marketplace-field">
                <span>Condition</span>
                <select
                  value={form.condition}
                  onChange={(event) => set('condition', event.target.value as MarketplaceCondition)}
                >
                  {MARKETPLACE_CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="marketplace-price-fields">
              <label className="marketplace-field">
                <span>Price (Rs)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(event) => set('price', event.target.value)}
                  placeholder="285000"
                />
              </label>
              <label className="marketplace-field">
                <span>Location</span>
                <input
                  value={form.location}
                  onChange={(event) => set('location', event.target.value)}
                  placeholder="Gulberg III, Lahore"
                />
              </label>
            </div>

            <label className="marketplace-check">
              <input
                type="checkbox"
                checked={form.negotiable}
                onChange={(event) => set('negotiable', event.target.checked)}
              />
              Price is negotiable
            </label>

            <label className="marketplace-field">
              <span>Description</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => set('description', event.target.value)}
                placeholder="Share condition, what’s included, and why you’re selling."
              />
            </label>

            <div className="marketplace-photo-drop" aria-hidden="true">
              <p>Add photos</p>
              <span>Image upload will plug into the listing API.</span>
            </div>

            <button
              type="submit"
              className="marketplace-post-btn"
              style={{ justifyContent: 'center', width: '100%', background: GRAD, padding: '14px 20px' }}
            >
              Publish ad
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
