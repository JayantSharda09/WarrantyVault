import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';

// Sample mock SVG invoice image data URL for initial starter demonstration
const SAMPLE_INVOICE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
  <rect x="0" y="0" width="600" height="90" fill="%23263a5b"/>
  <text x="40" y="55" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="%23ffffff">TAX INVOICE / RECEIPT</text>
  <text x="460" y="55" font-family="Arial, sans-serif" font-size="14" fill="%23e2e8f0">OFFICIAL COPY</text>
  <text x="40" y="130" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="%231e293b">Croma Retail Electronics</text>
  <text x="40" y="152" font-family="Arial, sans-serif" font-size="12" fill="%2364748b">GSTIN: 27AABCS1429B1Z | Store #402, Mumbai</text>
  <line x1="40" y1="175" x2="560" y2="175" stroke="%23cbd5e1" stroke-width="1"/>
  <text x="40" y="210" font-family="Arial, sans-serif" font-size="13" fill="%2364748b">Invoice No: INV-2024-88419</text>
  <text x="360" y="210" font-family="Arial, sans-serif" font-size="13" fill="%2364748b">Payment Mode: UPI / Card</text>
  <rect x="40" y="235" width="520" height="35" fill="%23f1f5f9"/>
  <text x="50" y="258" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23334155">ITEM DESCRIPTION</text>
  <text x="340" y="258" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23334155">QTY</text>
  <text x="440" y="258" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23334155">AMOUNT</text>
  <text x="50" y="300" font-family="Arial, sans-serif" font-size="13" fill="%230f172a">Verified Electronic Appliance</text>
  <text x="50" y="320" font-family="Arial, sans-serif" font-size="11" fill="%2364748b">Includes 12/24M Official Manufacturer Warranty</text>
  <text x="350" y="300" font-family="Arial, sans-serif" font-size="13" fill="%230f172a">1</text>
  <text x="440" y="300" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%230f172a">Paid in Full</text>
  <line x1="40" y1="360" x2="560" y2="360" stroke="%23cbd5e1" stroke-width="1"/>
  <circle cx="480" cy="460" r="45" fill="none" stroke="%2322c55e" stroke-width="3" stroke-dasharray="4 2"/>
  <text x="448" y="465" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%2322c55e">VERIFIED</text>
  <text x="40" y="740" font-family="Arial, sans-serif" font-size="11" fill="%2394a3b8">Retain this invoice for warranty claims. WarrantyVault Cloud Vault.</text>
</svg>`;

export const FirestoreService = {
  /**
   * Ensure user document exists in /users/{userId}
   */
  async ensureUserProfile(userId: string, email: string): Promise<void> {
    const userDocPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        userId,
        email: email || 'user@warrantyvault.com'
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userDocPath);
    }
  },

  /**
   * Listen to real-time products collection for a user in Firestore
   */
  subscribeToProducts(
    userId: string,
    onProductsChange: (products: Product[]) => void
  ): Unsubscribe {
    const productsPath = `users/${userId}/products`;
    const colRef = collection(db, 'users', userId, 'products');
    const q = query(colRef, orderBy('purchaseDate', 'desc'));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || userId,
            productName: data.productName || '',
            brand: data.brand || '',
            price: Number(data.price) || 0,
            purchaseDate: Number(data.purchaseDate) || Date.now(),
            warrantyMonths: Number(data.warrantyMonths) || 12,
            expiryDate: Number(data.expiryDate) || Date.now(),
            invoicePath: data.invoicePath || null,
            invoiceName: data.invoiceName || null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        onProductsChange(items);
      },
      (error: FirestoreError) => {
        handleFirestoreError(error, OperationType.LIST, productsPath);
      }
    );
  },

  /**
   * Insert product into Firestore under /users/{userId}/products/{productId}
   */
  async addProduct(
    userId: string,
    product: Omit<Product, 'id' | 'userId'>
  ): Promise<string> {
    const productsColPath = `users/${userId}/products`;
    try {
      const newDocRef = doc(collection(db, 'users', userId, 'products'));
      const payload = {
        userId,
        productName: product.productName.trim().slice(0, 120),
        brand: product.brand.trim().slice(0, 100),
        price: Number(product.price),
        purchaseDate: Number(product.purchaseDate),
        warrantyMonths: Number(product.warrantyMonths),
        expiryDate: Number(product.expiryDate),
        invoicePath: product.invoicePath || null,
        invoiceName: product.invoiceName ? product.invoiceName.slice(0, 120) : null
      };

      await setDoc(newDocRef, payload);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, productsColPath);
    }
  },

  /**
   * Delete product document from Firestore
   */
  async deleteProduct(userId: string, productId: string): Promise<void> {
    const productPath = `users/${userId}/products/${productId}`;
    try {
      const docRef = doc(db, 'users', userId, 'products', productId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, productPath);
    }
  },

  /**
   * Seed initial sample data to Firestore for new users so they can test immediately
   */
  async seedInitialProductsIfEmpty(userId: string): Promise<void> {
    const initialSampleItems: Omit<Product, 'id' | 'userId'>[] = [
      {
        productName: 'MacBook Air M3 15"',
        brand: 'Apple',
        price: 134900.0,
        purchaseDate: Date.now() - 1000 * 60 * 60 * 24 * 60,
        warrantyMonths: 12,
        expiryDate: DateUtils.addMonths(Date.now() - 1000 * 60 * 60 * 24 * 60, 12),
        invoicePath: SAMPLE_INVOICE_SVG,
        invoiceName: 'apple_macbook_bill.png'
      },
      {
        productName: 'Sony WH-1000XM5 Headphones',
        brand: 'Sony',
        price: 29990.0,
        purchaseDate: Date.now() - 1000 * 60 * 60 * 24 * 350, // expires in ~15 days
        warrantyMonths: 12,
        expiryDate: DateUtils.addMonths(Date.now() - 1000 * 60 * 60 * 24 * 350, 12),
        invoicePath: SAMPLE_INVOICE_SVG,
        invoiceName: 'sony_croma_receipt.png'
      },
      {
        productName: 'Samsung 55" 4K Smart TV',
        brand: 'Samsung',
        price: 54990.0,
        purchaseDate: Date.now() - 1000 * 60 * 60 * 24 * 760, // expired
        warrantyMonths: 24,
        expiryDate: DateUtils.addMonths(Date.now() - 1000 * 60 * 60 * 24 * 760, 24),
        invoicePath: null,
        invoiceName: null
      }
    ];

    for (const item of initialSampleItems) {
      await this.addProduct(userId, item);
    }
  }
};
