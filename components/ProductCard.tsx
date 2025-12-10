
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const hasSale = product.salePrice && product.salePrice < product.price;
  const isOOS = product.isOutOfStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if clicked on button
    if (isOOS) return;
    addToCart(product);
  };

  return (
    <Link 
      to={`/product/${product.slug}`} 
      className={`group block h-full ${isOOS ? 'cursor-not-allowed' : ''}`}
      onClick={(e) => {
        // Optional: If you strictly want to block navigation on OOS cards, you could prevent default here.
        // However, requirements say "Price text becomes gray... Keep full product information visible"
        // usually implies interaction to see details is allowed. 
        // We will keep navigation enabled to let users sign up for notifications.
      }}
    >
      <div className={`bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col relative transition-all duration-300 ${!isOOS ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : ''}`}>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isOOS ? (
             <span className="bg-[#d9534f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
               Ausverkauft
             </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-[#2b4736] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
                  New
                </span>
              )}
              {hasSale && (
                <span className="bg-[#d9534f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
                  Sale
                </span>
              )}
            </>
          )}
        </div>

        {/* Image Container */}
        <div className={`relative aspect-[4/5] overflow-hidden bg-gray-50 ${isOOS ? 'opacity-55' : ''}`}>
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${!isOOS ? 'group-hover:scale-105 opacity-100' : 'grayscale-[40%]'}`}
            loading="lazy"
          />
          
          {/* Quick Add Button - Only show if in stock */}
          {!isOOS && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 bg-white text-[#2b4736] p-3 rounded-full shadow-md opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#2b4736] hover:text-white focus:opacity-100 focus:translate-y-0"
              aria-label="In den Warenkorb"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">
            {product.category}
          </span>
          <h3 className={`text-[15px] font-semibold mb-2 leading-tight transition-colors ${isOOS ? 'text-gray-400' : 'text-[#333] group-hover:text-[#2b4736]'}`}>
            {product.title}
          </h3>
          
          <div className="mt-auto flex items-baseline gap-2">
            {isOOS ? (
               <span className="text-gray-400 font-bold text-lg">
                  {product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)} €
               </span>
            ) : (
              <>
                {hasSale ? (
                  <>
                    <span className="text-[#d9534f] font-bold text-lg">
                      {product.salePrice?.toFixed(2)} €
                    </span>
                    <span className="text-gray-400 text-sm line-through decoration-gray-400">
                      {product.price?.toFixed(2)} €
                    </span>
                  </>
                ) : (
                  <span className="text-[#333] font-bold text-lg">
                    {product.price?.toFixed(2)} €
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};