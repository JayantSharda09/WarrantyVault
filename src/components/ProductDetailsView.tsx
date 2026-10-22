import React from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { ArrowLeft, Receipt, Trash2, Calendar, ShieldCheck, Tag, IndianRupee } from 'lucide-react';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onViewInvoice: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  product,
  onBack,
  onViewInvoice,
  onDeleteProduct,
}) => {
  const days = DateUtils.daysRemaining(product.expiryDate);

  const status = days < 0 ? 'EXPIRED' : days === 0 ? 'EXPIRES TODAY' : 'ACTIVE';
  const remainingText = days < 0 ? `Expired ${-days} days ago` : `${days} days`;

  const statusColor =
    days < 0
      ? 'text-[#C62828] bg-red-50 border-red-200'
      : days === 0
      ? 'text-[#B77900] bg-amber-50 border-amber-200'
      : 'text-[#238B45] bg-emerald-50 border-emerald-200';

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${product.productName}?`)) {
      onDeleteProduct(product.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B1D22] hover:text-[#315EFB] transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50 transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Product Details Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
        {/* Name matching tvDetailsName */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1B1D22] tracking-tight leading-snug">
            {product.productName}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor} shrink-0`}>
            {status}
          </span>
        </div>

        {/* Structured Info matching tvDetailsInfo */}
        <div className="mt-6 divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-[#6C707A] flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Brand
            </span>
            <span className="font-bold text-[#1B1D22]">{product.brand}</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-[#6C707A] flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-400" /> Price
            </span>
            <span className="font-bold text-[#1B1D22]">{DateUtils.formatPrice(product.price)}</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-[#6C707A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Purchase Date
            </span>
            <span className="font-semibold text-[#1B1D22]">{DateUtils.format(product.purchaseDate)}</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-[#6C707A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Warranty Duration
            </span>
            <span className="font-semibold text-[#1B1D22]">{product.warrantyMonths} months</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-[#6C707A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Expiry Date
            </span>
            <span className="font-semibold text-[#1B1D22]">{DateUtils.format(product.expiryDate)}</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm bg-slate-50/50 -mx-6 px-6">
            <span className="text-[#6C707A] font-medium">Remaining</span>
            <span className="font-bold text-[#1B1D22]">{remainingText}</span>
          </div>
        </div>

        {/* View Invoice button matching btnViewInvoice */}
        <div className="mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={() => onViewInvoice(product)}
            disabled={!product.invoicePath}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              product.invoicePath
                ? 'bg-[#315EFB] hover:bg-[#1F3FAF] text-white shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {product.invoicePath ? 'View Invoice' : 'No Invoice Attached'}
          </button>
          {!product.invoicePath && (
            <p className="text-xs text-center text-[#6C707A] mt-2">
              No invoice was uploaded when this product was saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
