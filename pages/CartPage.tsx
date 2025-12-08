
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Ihr Warenkorb ist leer</h2>
        <p className="text-gray-500 mb-8">Stöbern Sie durch unseren Shop und entdecken Sie einzigartige Produkte.</p>
        <Link to="/shop">
          <Button>Zum Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Warenkorb</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
             const effectivePrice = item.salePrice ?? item.price;
             return (
            <div key={item.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md" 
                  loading="lazy"
                />
              </Link>
              
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[#333]">
                      <Link to={`/product/${item.slug}`} className="hover:text-[#2b4736]">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    {item.salePrice && item.salePrice < item.price && (
                        <span className="text-xs text-[#d9534f] font-semibold mt-1 inline-block">Preis reduziert</span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-gray-500 hover:text-[#2b4736]"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-500 hover:text-[#2b4736]"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                     {item.salePrice && item.salePrice < item.price && (
                         <span className="block text-xs text-gray-400 line-through">
                             {(item.price * item.quantity).toFixed(2)} €
                         </span>
                     )}
                    <p className={`font-bold text-lg ${item.salePrice ? 'text-[#d9534f]' : 'text-[#2b4736]'}`}>
                        {(effectivePrice * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}})}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Zusammenfassung</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Zwischensumme</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Versand</span>
                <span className="text-green-600 font-medium">Kostenlos</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between font-bold text-xl text-[#333]">
                <span>Gesamt</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Inkl. MwSt.</p>
            </div>

            <Link to="/checkout" className="block w-full">
               <Button fullWidth size="lg">
                 Zur Kasse <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </Link>
            
            <div className="mt-6 flex justify-center space-x-2 grayscale opacity-50">
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
