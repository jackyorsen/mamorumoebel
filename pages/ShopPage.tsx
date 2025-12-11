
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown } from 'lucide-react';
import { useProductsFromSheets } from '../hooks/useSheetsApi';

export const ShopPage: React.FC = () => {
  const [sortValue, setSortValue] = useState('default');
  const { products, loading, error } = useProductsFromSheets();

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const sorted = [...products];
    
    sorted.sort((a, b) => {
        // 1. OOS always last
        const aOOS = a.isOutOfStock ? 1 : 0;
        const bOOS = b.isOutOfStock ? 1 : 0;
        if (aOOS !== bOOS) return aOOS - bOOS;

        // 2. User selected sort
        switch (sortValue) {
          case 'price-asc': {
             const priceA = a.salePrice ?? a.price;
             const priceB = b.salePrice ?? b.price;
             return priceA - priceB;
          }
          case 'price-desc': {
             const priceA = a.salePrice ?? a.price;
             const priceB = b.salePrice ?? b.price;
             return priceB - priceA;
          }
          case 'default':
          default:
            return 0;
        }
    });

    return sorted;
  }, [products, sortValue]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 w-full">
      {/* Page Title & Filter Bar */}
      <div className="bg-white p-6 md:p-8 rounded-lg mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Title & Breadcrumb */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-2 uppercase tracking-wider">Shop</h1>
          <nav className="text-xs text-gray-500 font-medium uppercase tracking-wide">
             <Link to="/" className="opacity-60 hover:opacity-100 transition-opacity">Home</Link> 
             <span className="mx-2">/</span> 
             <span className="text-[#2b4736]">Shop</span>
          </nav>
        </div>

        {/* Right: Count & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full md:w-auto">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
             {loading ? 'Lade Produkte...' : `${products.length} Produkte gefunden`}
          </span>
          
          <div className="relative w-full sm:w-auto">
            <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] cursor-pointer transition-all hover:bg-gray-100"
                disabled={loading}
            >
                <option value="default">Standard</option>
                <option value="price-asc">Preis aufsteigend</option>
                <option value="price-desc">Preis absteigend</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
          </div>
      )}

      {/* Error State */}
      {error && !loading && (
          <div className="text-center py-20 text-red-500 bg-white rounded-lg border border-red-100">
              <p className="font-bold">Es gab ein Problem beim Laden der Produkte.</p>
              <p className="text-sm mt-2">{error.message}</p>
          </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
      )}
      
      {!loading && !error && sortedProducts.length === 0 && (
        <div className="text-center py-24 bg-white rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Keine Produkte gefunden.</p>
        </div>
      )}
    </div>
  );
};
