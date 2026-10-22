import React, { useState, useRef } from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { ArrowLeft, Calendar, Image as ImageIcon, Check, X, ShieldPlus } from 'lucide-react';

interface AddProductViewProps {
  onBack: () => void;
  onSaveProduct: (product: Omit<Product, 'id' | 'userId'>) => void;
}

export const AddProductView: React.FC<AddProductViewProps> = ({
  onBack,
  onSaveProduct,
}) => {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<number>(Date.now());
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [invoicePath, setInvoicePath] = useState<string | null>(null);
  const [invoiceName, setInvoiceName] = useState<string | null>(null);

  // Field validation errors matching Android AddProductActivity
  const [errors, setErrors] = useState<{
    productName?: string;
    brand?: string;
    price?: string;
    warrantyMonths?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, SVG, WebP)');
        return;
      }
      setInvoiceName(file.name);
      try {
        const compressed = await compressImage(file);
        setInvoicePath(compressed);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setInvoicePath(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveInvoice = () => {
    setInvoicePath(null);
    setInvoiceName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const trimmedName = productName.trim();
    const trimmedBrand = brand.trim();
    const numPrice = parseFloat(price.trim());
    const numWarranty = parseInt(warrantyMonths.trim(), 10);

    if (!trimmedName) {
      newErrors.productName = 'Enter product name';
    }

    if (!trimmedBrand) {
      newErrors.brand = 'Enter brand';
    }

    if (isNaN(numPrice) || numPrice < 0) {
      newErrors.price = 'Enter a valid price';
    }

    if (isNaN(numWarranty) || numWarranty <= 0) {
      newErrors.warrantyMonths = 'Enter warranty in months';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expiryDate = DateUtils.addMonths(purchaseDate, numWarranty);

    onSaveProduct({
      productName: trimmedName,
      brand: trimmedBrand,
      price: numPrice,
      purchaseDate,
      warrantyMonths: numWarranty,
      expiryDate,
      invoicePath,
      invoiceName
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Top back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B1D22] hover:text-[#315EFB] transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Cancel</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
        {/* Title matching activity_add_product.xml */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#315EFB] flex items-center justify-center">
            <ShieldPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1B1D22] tracking-tight">
              Add Product
            </h1>
            <p className="text-xs text-[#6C707A]">
              Register details and invoice to keep track of coverage
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => {
                setProductName(e.target.value);
                if (errors.productName) setErrors({ ...errors, productName: undefined });
              }}
              placeholder="e.g., iPhone 15, Dell Monitor, Microwave"
              className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                errors.productName
                  ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 focus:border-[#315EFB] focus:ring-2 focus:ring-[#315EFB]/20'
              }`}
            />
            {errors.productName && (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.productName}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1.5">
              Brand *
            </label>
            <input
              type="text"
              value={brand}
              onChange={e => {
                setBrand(e.target.value);
                if (errors.brand) setErrors({ ...errors, brand: undefined });
              }}
              placeholder="e.g., Apple, Samsung, Sony, LG"
              className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                errors.brand
                  ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 focus:border-[#315EFB] focus:ring-2 focus:ring-[#315EFB]/20'
              }`}
            />
            {errors.brand && (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.brand}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1.5">
              Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors({ ...errors, price: undefined });
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  errors.price
                    ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:border-[#315EFB] focus:ring-2 focus:ring-[#315EFB]/20'
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.price}</p>
            )}
          </div>

          {/* Purchase Date matching tvPurchaseDate & DatePickerDialog */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1.5">
              Purchase Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={DateUtils.toInputDate(purchaseDate)}
                onChange={e => {
                  const ms = DateUtils.fromInputDate(e.target.value);
                  setPurchaseDate(ms);
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#315EFB] focus:ring-2 focus:ring-[#315EFB]/20 transition-all cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#6C707A] mt-1.5 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Selected: <strong className="text-[#1B1D22]">{DateUtils.format(purchaseDate)}</strong>
            </p>
          </div>

          {/* Warranty Months matching etWarrantyMonths */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1.5">
              Warranty Duration (months) *
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={warrantyMonths}
              onChange={e => {
                setWarrantyMonths(e.target.value);
                if (errors.warrantyMonths) setErrors({ ...errors, warrantyMonths: undefined });
              }}
              placeholder="e.g., 12, 24, 36"
              className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                errors.warrantyMonths
                  ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 focus:border-[#315EFB] focus:ring-2 focus:ring-[#315EFB]/20'
              }`}
            />
            {errors.warrantyMonths ? (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.warrantyMonths}</p>
            ) : (
              <p className="text-xs text-[#6C707A] mt-1 font-medium">
                Warranty will expire on:{' '}
                <strong className="text-[#238B45]">
                  {DateUtils.format(DateUtils.addMonths(purchaseDate, parseInt(warrantyMonths, 10) || 0))}
                </strong>
              </p>
            )}
          </div>

          {/* Invoice section matching tvInvoice & btnChooseInvoice */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A]">
                Product Invoice (Optional)
              </label>
              <span className={`text-xs font-semibold ${invoicePath ? 'text-[#238B45]' : 'text-[#6C707A]'}`}>
                {invoicePath ? 'Invoice: Selected' : 'Invoice: Not selected'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {invoicePath ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-emerald-950 truncate">
                      {invoiceName || 'invoice_image.jpg'}
                    </p>
                    <p className="text-[11px] text-emerald-700">Image attached</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#315EFB] hover:underline px-2 py-1"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveInvoice}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1"
                    title="Remove invoice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-slate-300 hover:border-[#315EFB] hover:bg-blue-50/30 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Choose Invoice</span>
              </button>
            )}
          </div>

          {/* Save Product button matching btnSaveProduct */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#315EFB] hover:bg-[#1F3FAF] text-white rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
