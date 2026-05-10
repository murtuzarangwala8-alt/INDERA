export interface Product {
  id: string | number;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  material: string;
  origin: string;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  hidden?: boolean;
  isActive?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  search: string;
  sortBy: 'price-asc' | 'price-desc' | 'popularity' | 'newest';
}
