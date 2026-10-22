import { useState, useEffect } from 'react';
import { Product, ViewScreen } from './types/product';
import { auth, onAuthStateChanged, signOut, testConnection, FirebaseUser } from './services/firebase';
import { FirestoreService } from './services/firestoreService';
import { DashboardView } from './components/DashboardView';
import { ProductListView } from './components/ProductListView';
import { ProductDetailsView } from './components/ProductDetailsView';
import { AddProductView } from './components/AddProductView';
import { InvoiceView } from './components/InvoiceView';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ShieldCheck, CheckCircle2, Cloud, Loader2 } from 'lucide-react';

export function App() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Test connection to Firestore on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUserEmail(user.email || 'user@warrantyvault.com');
        setCurrentUserId(user.uid);
        FirestoreService.ensureUserProfile(user.uid, user.email || 'user@warrantyvault.com');
      } else {
        setCurrentUserEmail(null);
        setCurrentUserId(null);
        localStorage.removeItem('warrantyvault_uid');
        localStorage.removeItem('warrantyvault_email');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore subscription for user's products
  useEffect(() => {
    if (!currentUserId) {
      setProducts([]);
      return;
    }

    setIsSyncing(true);
    let seeded = false;

    const unsubscribe = FirestoreService.subscribeToProducts(currentUserId, (items) => {
      setProducts(items);
      setIsSyncing(false);

      // If user has zero products in Firestore, seed once so they have sample data
      if (items.length === 0 && !seeded) {
        seeded = true;
        FirestoreService.seedInitialProductsIfEmpty(currentUserId).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Auth Handlers
  const handleLoginSuccess = (email: string, uid: string) => {
    localStorage.setItem('warrantyvault_uid', uid);
    localStorage.setItem('warrantyvault_email', email);
    setCurrentUserEmail(email);
    setCurrentUserId(uid);
    setCurrentScreen('dashboard');
    showToast('Signed in successfully');
  };

  const handleRegisterSuccess = (email: string, uid: string) => {
    localStorage.setItem('warrantyvault_uid', uid);
    localStorage.setItem('warrantyvault_email', email);
    setCurrentUserEmail(email);
    setCurrentUserId(uid);
    setCurrentScreen('dashboard');
    showToast('Account created successfully');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore if not signed into Firebase Auth
    }
    localStorage.removeItem('warrantyvault_uid');
    localStorage.removeItem('warrantyvault_email');
    setCurrentUserEmail(null);
    setCurrentUserId(null);
    setAuthMode('login');
    setSelectedProduct(null);
    setProducts([]);
  };

  // Product Actions in Firestore
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('details');
  };

  const handleViewInvoice = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('invoice');
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'userId'>) => {
    if (!currentUserId) {
      showToast('Please sign in to save products');
      return;
    }
    try {
      setIsSyncing(true);
      const newId = await FirestoreService.addProduct(currentUserId, productData);
      showToast('Product saved to Firestore');

      const savedProduct: Product = {
        ...productData,
        id: newId,
        userId: currentUserId
      };
      setSelectedProduct(savedProduct);
      setCurrentScreen('details');
    } catch (err: unknown) {
      console.error('Save product error:', err);
      let message = 'Error saving product';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) message = parsed.error;
        } catch {
          message = err.message;
        }
      }
      showToast(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!currentUserId) return;
    try {
      setIsSyncing(true);
      await FirestoreService.deleteProduct(currentUserId, id);
      setSelectedProduct(null);
      setCurrentScreen('products');
      showToast('Product deleted from Firestore');
    } catch (err: unknown) {
      console.error('Delete product error:', err);
      let message = 'Error deleting product';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) message = parsed.error;
        } catch {
          message = err.message;
        }
      }
      showToast(message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#315EFB] animate-spin" />
          <p className="text-xs text-[#6C707A] font-semibold">Connecting to Firestore...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render Login or Register screen
  if (!currentUserId) {
    if (authMode === 'register') {
      return (
        <RegisterView
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateLogin={() => setAuthMode('login')}
        />
      );
    }
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setAuthMode('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] pb-24 text-[#1B1D22]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315EFB] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-[#1B1D22] text-lg tracking-tight group-hover:text-[#315EFB] transition-colors">
                WarrantyVault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Cloud Sync indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#315EFB] rounded-full text-[11px] font-semibold border border-blue-100">
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Firestore Sync</span>
            </div>

            <span className="text-xs text-[#6C707A] hidden sm:inline-block max-w-[140px] truncate">
              {currentUserEmail}
            </span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1B1D22] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="w-full">
        {currentScreen === 'dashboard' && (
          <DashboardView
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigateAdd={() => setCurrentScreen('add')}
            onNavigateProducts={() => setCurrentScreen('products')}
          />
        )}

        {currentScreen === 'products' && (
          <ProductListView
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigateAdd={() => setCurrentScreen('add')}
          />
        )}

        {currentScreen === 'details' && selectedProduct && (
          <ProductDetailsView
            product={selectedProduct}
            onBack={() => setCurrentScreen('products')}
            onViewInvoice={handleViewInvoice}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentScreen === 'add' && (
          <AddProductView
            onBack={() => setCurrentScreen('dashboard')}
            onSaveProduct={handleSaveProduct}
          />
        )}

        {currentScreen === 'invoice' && selectedProduct && (
          <InvoiceView
            invoiceUrl={selectedProduct.invoicePath || null}
            invoiceName={selectedProduct.invoiceName || null}
            productName={selectedProduct.productName}
            onBack={() => setCurrentScreen('details')}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={screen => setCurrentScreen(screen)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
