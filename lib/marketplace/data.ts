import { listingMatchesCategory } from './categories';
import type {
  MarketplaceCategory,
  MarketplaceFilters,
  MarketplaceListing,
} from './types';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: 'all', label: 'All', slug: 'all' },
  { id: 'mobiles', label: 'Mobiles', slug: 'mobiles' },
  { id: 'vehicles', label: 'Vehicles', slug: 'vehicles' },
  { id: 'electronics', label: 'Electronics', slug: 'electronics' },
  { id: 'furniture', label: 'Furniture', slug: 'furniture' },
  { id: 'fashion', label: 'Fashion', slug: 'fashion' },
  { id: 'property', label: 'Property', slug: 'property' },
];

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  categoryId: 'all',
  query: '',
  condition: 'all',
  featuredOnly: false,
  negotiableOnly: false,
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

const sellerAva = (seed: string) =>
  `https://images.unsplash.com/${seed}?w=96&h=96&fit=crop&auto=format&q=80`;

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'iphone-14-pro-max',
    title: 'iPhone 14 Pro Max - 256GB Deep Purple, PTA approved',
    price: 285000,
    currency: 'USD',
    negotiable: true,
    condition: 'Like New',
    status: 'active',
    featured: true,
    categoryId: 'mobiles',
    categoryName: 'Mobiles',
    location: 'Gulberg III, Lahore',
    postedAt: '2026-09-08T10:00:00.000Z',
    postedLabel: '2h ago',
    imageCount: 2,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Factory-unlocked iPhone 14 Pro Max in Deep Purple. Battery health 94%, original box, charger, and unused AppleCare case included. PTA approved with clean IMEI.',
    seller: {
      id: 's-ayaan',
      name: 'Ayaan Malik',
      avatar: sellerAva('photo-1507003211169-0a1dd7228f2d'),
      memberSince: 'Mar 2023',
    },
    isFavorite: false,
  },
  {
    id: 'macbook-air-m2',
    title: 'MacBook Air M2 - 256GB Midnight, barely used',
    price: 245000,
    currency: 'USD',
    negotiable: true,
    condition: 'Like New',
    status: 'active',
    featured: false,
    categoryId: 'electronics',
    categoryName: 'Electronics',
    location: 'DHA Phase 5, Lahore',
    postedAt: '2026-09-08T07:00:00.000Z',
    postedLabel: '5h ago',
    imageCount: 4,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      '2022 MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Midnight finish with almost no wear. Comes with original MagSafe charger and sleeve.',
    seller: {
      id: 's-hira',
      name: 'Hira Qureshi',
      avatar: sellerAva('photo-1438761681033-6461ffad8d80'),
      memberSince: 'Jan 2024',
    },
    isFavorite: true,
  },
  {
    id: 'electric-motorcycle',
    title: 'Electric Motorcycle - 70km range, brand new',
    price: 185000,
    currency: 'USD',
    negotiable: false,
    condition: 'Brand New',
    status: 'active',
    featured: true,
    categoryId: 'vehicles',
    categoryName: 'Vehicles',
    location: 'Model Town, Lahore',
    postedAt: '2026-09-07T12:00:00.000Z',
    postedLabel: '1d ago',
    imageCount: 3,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Brand-new electric motorcycle, still under packing film. 70km claimed range, digital cluster, disc brakes. Ideal for daily city commute.',
    seller: {
      id: 's-bilal',
      name: 'Bilal Ahmed',
      avatar: sellerAva('photo-1500648767791-00dcc994a43e'),
      memberSince: 'Aug 2022',
    },
    isFavorite: false,
  },
  {
    id: 'sony-wh1000xm5',
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    price: 18500,
    currency: 'USD',
    negotiable: true,
    condition: 'Like New',
    status: 'active',
    featured: false,
    categoryId: 'electronics',
    categoryName: 'Electronics',
    location: 'Johar Town, Lahore',
    postedAt: '2026-09-08T09:00:00.000Z',
    postedLabel: '3h ago',
    imageCount: 2,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Sony XM5 over-ears in black. Used for a few weeks only. Carry case, cables, and original packing included.',
    seller: {
      id: 's-sara',
      name: 'Sara Khan',
      avatar: sellerAva('photo-1544005313-94ddf0286df2'),
      memberSince: 'Nov 2023',
    },
    isFavorite: false,
  },
  {
    id: 'honda-civic-2021',
    title: 'Honda Civic 2021 Oriel - genuine mileage',
    price: 5850000,
    currency: 'USD',
    negotiable: true,
    condition: 'Good',
    status: 'active',
    featured: true,
    categoryId: 'vehicles',
    categoryName: 'Vehicles',
    location: 'Bahria Town, Lahore',
    postedAt: '2026-09-06T15:00:00.000Z',
    postedLabel: '2d ago',
    imageCount: 8,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1606661953052-ed4b1a2d2d2b?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Civic Oriel 2021, one owner, complete service history at Honda. Alloy wheels, leather, and new tyres. Inspection welcome.',
    seller: {
      id: 's-usman',
      name: 'Usman Raza',
      avatar: sellerAva('photo-1472099645785-5658abf4ff4e'),
      memberSince: 'Feb 2021',
    },
    isFavorite: false,
  },
  {
    id: 'ipad-pro-12',
    title: 'iPad Pro 12.9" M2 with Magic Keyboard',
    price: 195000,
    currency: 'USD',
    negotiable: true,
    condition: 'Like New',
    status: 'active',
    featured: false,
    categoryId: 'electronics',
    categoryName: 'Electronics',
    location: 'Faisal Town, Lahore',
    postedAt: '2026-09-07T18:00:00.000Z',
    postedLabel: '18h ago',
    imageCount: 3,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Space Grey iPad Pro 12.9 with M2, 128GB Wi-Fi. Magic Keyboard and Apple Pencil 2 included. Screen protector applied from day one.',
    seller: {
      id: 's-nimra',
      name: 'Nimra Shah',
      avatar: sellerAva('photo-1534528741775-53994a69daeb'),
      memberSince: 'May 2024',
    },
    isFavorite: false,
  },
  {
    id: 'dining-table-oak',
    title: 'Solid oak dining table - seats 6',
    price: 42000,
    currency: 'USD',
    negotiable: true,
    condition: 'Good',
    status: 'active',
    featured: false,
    categoryId: 'furniture',
    categoryName: 'Furniture',
    location: 'Cantt, Lahore',
    postedAt: '2026-09-05T11:00:00.000Z',
    postedLabel: '3d ago',
    imageCount: 4,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de3d13f4?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Hand-finished oak dining table with six matching chairs. Minor wear on one chair leg. Pickup only from Cantt.',
    seller: {
      id: 's-farah',
      name: 'Farah Iqbal',
      avatar: sellerAva('photo-1487412720507-e7ab37603c6f'),
      memberSince: 'Jul 2022',
    },
    isFavorite: false,
  },
  {
    id: 'samsung-qled-55',
    title: 'Samsung 55" QLED 4K Smart TV',
    price: 98000,
    currency: 'USD',
    negotiable: true,
    condition: 'Like New',
    status: 'active',
    featured: true,
    categoryId: 'electronics',
    categoryName: 'Electronics',
    location: 'Wapda Town, Lahore',
    postedAt: '2026-09-08T08:30:00.000Z',
    postedLabel: '4h ago',
    imageCount: 3,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Samsung Q60C 55-inch QLED, bought last year. Wall mount included. No dead pixels, original remote and stand in box.',
    seller: {
      id: 's-hamza',
      name: 'Hamza Tariq',
      avatar: sellerAva('photo-1506794778202-cad84cf45f1d'),
      memberSince: 'Oct 2023',
    },
    isFavorite: false,
  },
  {
    id: 'leather-jacket',
    title: 'Men’s genuine leather biker jacket - size L',
    price: 12500,
    currency: 'USD',
    negotiable: true,
    condition: 'Good',
    status: 'active',
    featured: false,
    categoryId: 'fashion',
    categoryName: 'Fashion',
    location: 'Anarkali, Lahore',
    postedAt: '2026-09-07T09:00:00.000Z',
    postedLabel: '1d ago',
    imageCount: 2,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Classic black biker jacket, genuine leather, size L. Light crease on the left elbow. Fits a 40-inch chest.',
    seller: {
      id: 's-zain',
      name: 'Zain Ali',
      avatar: sellerAva('photo-1504257432389-52343af06ae3'),
      memberSince: 'Apr 2025',
    },
    isFavorite: false,
  },
  {
    id: 'studio-apartment',
    title: 'Furnished studio for rent - DHA Phase 6',
    price: 75000,
    currency: 'USD',
    negotiable: false,
    condition: 'Brand New',
    status: 'active',
    featured: true,
    categoryId: 'property',
    categoryName: 'Property',
    location: 'DHA Phase 6, Lahore',
    postedAt: '2026-09-04T12:00:00.000Z',
    postedLabel: '4d ago',
    imageCount: 6,
    viewCount: 0,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=700&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=700&fit=crop&auto=format&q=80',
    ],
    description:
      'Brand-new furnished studio, 650 sq ft, with kitchenette, dedicated parking, and 24/7 security. Monthly rent, 2 months advance.',
    seller: {
      id: 's-mehwish',
      name: 'Mehwish Noor',
      avatar: sellerAva('photo-1494790108377-be9c29b29330'),
      memberSince: 'Jun 2021',
    },
    isFavorite: false,
  },
];

export function formatMarketplacePrice(price: number, currency: MarketplaceListing['currency'] = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getMarketplaceListing(id: string): MarketplaceListing | undefined {
  return MOCK_MARKETPLACE_LISTINGS.find((listing) => listing.id === id);
}

export function filterMarketplaceListings(
  listings: MarketplaceListing[],
  filters: MarketplaceFilters,
  categories: MarketplaceCategory[] = MARKETPLACE_CATEGORIES,
): MarketplaceListing[] {
  const query = filters.query.trim().toLowerCase();
  const minPrice = filters.minPrice.trim() === '' ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice.trim() === '' ? null : Number(filters.maxPrice);
  const min = minPrice != null && Number.isFinite(minPrice) ? minPrice : null;
  const max = maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : null;

  const filtered = listings.filter((listing) => {
    if (!listingMatchesCategory(listing.categoryId, filters.categoryId, categories)) return false;
    if (filters.condition !== 'all' && listing.condition !== filters.condition) return false;
    if (filters.featuredOnly && !listing.featured) return false;
    if (filters.negotiableOnly && !listing.negotiable) return false;
    if (min != null && listing.price < min) return false;
    if (max != null && listing.price > max) return false;
    if (query) {
      const haystack = `${listing.title} ${listing.location} ${listing.condition}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
  else sorted.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return sorted;
}
