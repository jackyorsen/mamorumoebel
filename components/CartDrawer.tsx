
import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 backdrop-blur-[2px] ${
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-[380px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-[#333] uppercase tracking-widest">
            Warenkorb ({items.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button 
            onClick={closeCart}
            className="group flex items-center text-[11px] font-bold text-gray-400 hover:text-[#333] uppercase tracking-wider transition-colors"
          >
            <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">Schliessen</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-gray-900 font-bold mb-2">Ihr Warenkorb ist leer</p>
              <p className="text-gray-500 text-sm mb-8 max-w-[200px] leading-relaxed">
                  Es sieht so aus, als hätten Sie noch keine Produkte hinzugefügt.
              </p>
              <Button onClick={closeCart} size="sm">
                Rückkehr zum Shop
              </Button>
            </div>
          ) : (
            <div className="px-6 py-4">
              {items.map((item) => {
                const effectivePrice = item.salePrice ?? item.price;
                return (
                  <div key={item.id} className="flex gap-4 py-5 border-b border-gray-100 last:border-0 group">
                    <div className="w-20 h-24 flex-shrink-0 bg-gray-50 rounded-sm overflow-hidden border border-gray-100 relative">
                       <OptimizedImage 
                        src={item.image} 
                        alt={item.title} 
                        variant="small"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link 
                          to={`/product/${item.slug}`} 
                          onClick={closeCart}
                          className="text-sm font-semibold text-[#333] hover:text-[#2b4736] transition-colors line-clamp-2 mb-1"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-sm h-7">
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="px-2 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 transition-colors"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-medium text-gray-700">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="px-2 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <span className="text-xs text-gray-400">x</span>
                            <span className={`text-sm font-bold ${item.salePrice ? 'text-[#d9534f]' : 'text-[#2b4736]'}`}>
                                {effectivePrice.toFixed(2)} €
                            </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors"
                      aria-label="Entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
            <div className="flex justify-between items-center mb-6 text-[#333]">
              <span className="font-bold uppercase tracking-wide text-sm">Zwischensumme</span>
              <span className="font-bold text-lg text-[#2b4736]">{cartTotal.toFixed(2)} €</span>
            </div>
            
            <div className="space-y-3">
              <Link to="/checkout" className="block w-full">
                  <Button fullWidth onClick={closeCart} size="lg" className="uppercase tracking-widest text-xs font-bold py-4 shadow-lg shadow-[#2b4736]/10">
                    Zur Kasse
                  </Button>
              </Link>
              <Link to="/cart" className="block w-full">
                  <Button fullWidth variant="outline" onClick={closeCart} className="uppercase tracking-widest text-xs font-bold py-3 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#333] hover:border-gray-300">
                    Warenkorb ansehen
                  </Button>
              </Link>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center">
               Kostenloser Versand ab 100€
            </p>
          </div>
        )}
      </div>
    </>
  );
};
