import React, { useState } from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { Bell, X, AlertCircle } from 'lucide-react';

interface WarrantyNotificationBannerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const WarrantyNotificationBanner: React.FC<WarrantyNotificationBannerProps> = ({
  products,
  onSelectProduct,
}) => {
  const [dismissed, setDismissed] = useState(false);

  // Replicate WarrantyWorker: alert for products expiring within 0..7 days
  const expiringSoon = products.filter(p => {
    const days = DateUtils.daysRemaining(p.expiryDate);
    return days >= 0 && days <= 7;
  });

  if (expiringSoon.length === 0 || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-5 rounded-r-xl shadow-xs">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Warranty Expiry Reminder ({expiringSoon.length})
            </h4>
            <div className="mt-1 space-y-1">
              {expiringSoon.map(p => {
                const days = DateUtils.daysRemaining(p.expiryDate);
                const message =
                  days === 0
                    ? `${p.productName} warranty expires today.`
                    : `${p.productName} warranty expires in ${days} day${days > 1 ? 's' : ''}.`;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-medium cursor-pointer underline flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>{message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 p-1 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
