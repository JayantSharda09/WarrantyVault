import React from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { Receipt, ChevronRight, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface ProductItemProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, onClick }) => {
  const days = DateUtils.daysRemaining(product.expiryDate);

  let warrantyText = '';
  let statusBadgeClass = '';
  let StatusIcon = ShieldCheck;

  if (days < 0) {
    warrantyText = 'Warranty expired';
    statusBadgeClass = 'text-[#C62828] bg-red-50 border-red-200';
    StatusIcon = AlertTriangle;
  } else if (days === 0) {
    warrantyText = 'Warranty expires today';
    statusBadgeClass = 'text-[#B77900] bg-amber-50 border-amber-200 animate-pulse';
    StatusIcon = Clock;
  } else if (days <= 30) {
    warrantyText = `Warranty: ${days} days remaining`;
    statusBadgeClass = 'text-[#B77900] bg-amber-50 border-amber-200';
    StatusIcon = Clock;
  } else {
    warrantyText = `Warranty expires: ${DateUtils.format(product.expiryDate)}`;
    statusBadgeClass = 'text-[#238B45] bg-emerald-50 border-emerald-200';
    StatusIcon = ShieldCheck;
  }

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-xl p-4 mb-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-[#315EFB]/30 transition-all cursor-pointer group flex items-center justify-between"
    >
      <div className="flex-1 pr-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-bold text-[#1B1D22] group-hover:text-[#315EFB] transition-colors leading-tight">
            {product.productName}
          </h3>
          {product.invoicePath && (
            <span
              title="Invoice attached"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-[#315EFB]"
            >
              <Receipt className="w-3 h-3 mr-1" /> Bill
            </span>
          )}
        </div>

        <p className="text-[14px] text-[#6C707A] mt-1">
          {product.brand}  •  {DateUtils.formatPrice(product.price)}
        </p>

        <div className="mt-2 flex items-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBadgeClass}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {warrantyText}
          </span>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#315EFB] group-hover:translate-x-0.5 transition-all" />
    </div>
  );
};
