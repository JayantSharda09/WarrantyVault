import React, { useState } from 'react';
import { Product } from '../types/product';
import { DateUtils } from '../util/dateUtils';
import { ProductItem } from './ProductItem';
import { Search, Plus, PackageX, Filter } from 'lucide-react';

interface ProductListViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateAdd: () => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  onSelectProduct,
  onNavigateAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'soon' | 'expired'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const days = DateUtils.daysRemaining(product.expiryDate);
    if (filterType === 'active') return days >= 0;
    if (filterType === 'soon') return days >= 0 && days <= 30;
    if (filterType === 'expired') return days < 0;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Title matching fragment_product_list.xml */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B1D22] tracking-tight">
            My Products
          </h1>
          <p className="text-xs text-[#6C707A] mt-0.5">
            {products.length} {products.length === 1 ? 'item' : 'items'} registered in vault
          </p>
        </div>

        <button
          onClick={onNavigateAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#315EFB] hover:bg-[#1F3FAF] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by product name or brand..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#1B1D22] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#315EFB]/30 focus:border-[#315EFB] transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#6C707A] font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-[#1B1D22] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setFilterType('active')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
            filterType === 'active'
              ? 'bg-[#238B45] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterType('soon')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
            filterType === 'soon'
              ? 'bg-[#B77900] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Expiring Soon
        </button>
        <button
          onClick={() => setFilterType('expired')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
            filterType === 'expired'
              ? 'bg-[#C62828] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Expired
        </button>
      </div>

      {/* Product List */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <ProductItem
              key={product.id}
              product={product}
              onClick={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center my-4">
          <PackageX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1B1D22]">No products matched</h3>
          <p className="text-xs text-[#6C707A] mt-1">
            {searchQuery
              ? `No items found matching "${searchQuery}". Try a different keyword.`
              : 'No products in this category.'}
          </p>
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-3 text-xs font-semibold text-[#315EFB] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
