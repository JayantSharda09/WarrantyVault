import React from 'react';
import { ArrowLeft, Download, FileQuestion } from 'lucide-react';

interface InvoiceViewProps {
  invoiceUrl: string | null;
  invoiceName?: string | null;
  productName: string;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoiceUrl,
  invoiceName,
  productName,
  onBack,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B1D22] hover:text-[#315EFB] transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </button>

        {invoiceUrl && (
          <a
            href={invoiceUrl}
            download={invoiceName || `${productName.toLowerCase().replace(/\s+/g, '_')}_invoice.png`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315EFB] hover:text-[#1F3FAF] py-1.5 px-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1B1D22]">Invoice & Receipt</h2>
            <p className="text-xs text-[#6C707A]">{productName}</p>
          </div>
          {invoiceName && (
            <span className="text-xs text-[#6C707A] bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              {invoiceName}
            </span>
          )}
        </div>

        {invoiceUrl ? (
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 overflow-hidden">
            <img
              src={invoiceUrl}
              alt={`Invoice for ${productName}`}
              className="max-h-[600px] w-auto object-contain rounded-lg shadow-xs"
            />
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#1B1D22]">No invoice available</p>
            <p className="text-xs text-[#6C707A] mt-1 max-w-xs mx-auto">
              There is no invoice image attached for this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
