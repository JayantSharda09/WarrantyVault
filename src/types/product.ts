export interface Product {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  price: number;
  purchaseDate: number; // timestamp in millis
  warrantyMonths: number;
  expiryDate: number; // timestamp in millis
  invoicePath?: string | null; // data URL or storage URI
  invoiceName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export type ViewScreen = 'dashboard' | 'products' | 'add' | 'details' | 'invoice';
