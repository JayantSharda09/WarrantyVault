import React from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { ProductItem } from './ProductItem';
import { WarrantyNotificationBanner } from './WarrantyNotificationBanner';
import { ShieldCheck, Plus, PackageOpen } from 'lucide-react';

interface DashboardViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateAdd: () => void;
  onNavigateProducts: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  onSelectProduct,
  onNavigateAdd,
  onNavigateProducts,
}) => {
  const activeCount = products.filter(p => DateUtils.daysRemaining(p.expiryDate) >= 0).length;
  const expiringSoonCount = products.filter(p => {
    const days = DateUtils.daysRemaining(p.expiryDate);
    return days >= 0 && days <= 30;
  }).length;

  const recentProducts = products.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Header section matching fragment_dashboard.xml */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#1B1D22] tracking-tight">
          WarrantyVault
        </h1>
        <p className="text-[15px] text-[#6C707A] mt-1">
          Your bills. Your warranties.
        </p>
      </div>

      {/* Warranty Worker reminder banner */}
      <WarrantyNotificationBanner products={products} onSelectProduct={onSelectProduct} />

      {/* 3 Metric Cards matching tvTotal, tvActive, tvExpiring in fragment_dashboard.xml */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Total */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center h-[96px] hover:border-slate-300 transition-all">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#6C707A]">
            Total
          </span>
          <span className="text-2xl font-bold text-[#1B1D22] mt-1">
            {products.length}
          </span>
        </div>

        {/* Active */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center h-[96px] hover:border-emerald-200 transition-all">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#238B45]">
            Active
          </span>
          <span className="text-2xl font-bold text-[#238B45] mt-1">
            {activeCount}
          </span>
        </div>

        {/* Soon */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center h-[96px] hover:border-amber-200 transition-all">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#B77900]">
            Soon
          </span>
          <span className="text-2xl font-bold text-[#B77900] mt-1">
            {expiringSoonCount}
          </span>
        </div>
      </div>

      {/* Recent Products section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-[#1B1D22]">
          Recent Products
        </h2>
        {products.length > 3 && (
          <button
            onClick={onNavigateProducts}
            className="text-sm font-semibold text-[#315EFB] hover:text-[#1F3FAF] transition-colors"
          >
            View all ({products.length})
          </button>
        )}
      </div>

      {recentProducts.length > 0 ? (
        <div>
          {recentProducts.map(product => (
            <ProductItem
              key={product.id}
              product={product}
              onClick={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center my-4">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1B1D22]">No products added yet</h3>
          <p className="text-sm text-[#6C707A] mt-1 max-w-sm mx-auto">
            Keep track of electronics, appliances, and their warranty expiry dates easily.
          </p>
          <button
            onClick={onNavigateAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-[#315EFB] hover:bg-[#1F3FAF] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first product
          </button>
        </div>
      )}

      {/* Quick Info & Tips */}
      <div className="mt-8 bg-blue-50/60 rounded-xl p-4 border border-blue-100/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#315EFB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#263A5B] leading-relaxed">
          <p className="font-semibold text-sm mb-0.5">Automated Warranty Monitoring</p>
          WarrantyVault monitors your appliances daily and notifies you 7 days before coverage expires so you can schedule repairs or service before warranty expiration.
        </div>
      </div>
    </div>
  );
};
