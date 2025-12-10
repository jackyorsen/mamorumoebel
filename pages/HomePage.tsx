
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { useProductsFromSheets } from '../hooks/useSheetsApi';

export const HomePage: React.FC = () => {
  // Use the new Google Sheets API Hook
  const { products, loading } = useProductsFromSheets();
  
  // Slice the first 4 items for the bestseller list logic, but ENSURE OOS items are pushed to end first
  const bestsellers = useMemo(() => {
    if (!products) return [];
    // Sort logic: In-stock first
    const sorted = [...products].sort((a, b) => {
        const aOOS = a.isOutOfStock ? 1 : 0;
        const bOOS = b.isOutOfStock ? 1 : 0;
        return aOOS - bOOS;
    });
    return sorted.slice(0, 4);
  }, [products]);

  // Category Mock Data (Static for now)
  const categories = [
    { 
      name: 'Wohnzimmer', 
      image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1780&auto=format&fit=crop', 
      count: 'Mehr entdecken' 
    },
    { 
      name: 'Beleuchtung', 
      image: 'https://images.unsplash.com/photo-1513506003011-38f044aff2dd?q=80&w=1932&auto=format&fit=crop', 
      count: 'Mehr entdecken' 
    },
    { 
      name: 'Dekoration', 
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1974&auto=format&fit=crop', 
      count: 'Mehr entdecken' 
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative h-[450px] md:h-[520px] rounded-xl overflow-hidden flex items-center justify-center text-center shadow-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
                alt="Modern Interior" 
                className="w-full h-full object-cover"
            />
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 border border-white/40 rounded-full text-white text-xs md:text-sm uppercase tracking-[0.2em] font-medium mb-6 backdrop-blur-sm">
            Neue Kollektion
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight drop-shadow-md">
            Minimalismus <br className="hidden md:block"/> trifft auf Eleganz.
          </h1>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="bg-white text-[#2b4736] hover:bg-gray-100 border-none min-w-[180px]">
                Jetzt einkaufen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              to="/shop" 
              key={idx} 
              className="group relative h-[300px] md:h-[380px] overflow-hidden rounded-lg block shadow-sm"
            >
              <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/20 transition-colors z-10" />
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-sm group-hover:translate-x-2 transition-transform duration-300">
                    {cat.name}
                </h3>
                <div className="flex items-center text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>{cat.count}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestseller / Products Section */}
      <section>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 border-b border-gray-200 pb-5">
          <div className="relative">
            <span className="text-[#2b4736] text-xs font-bold uppercase tracking-widest mb-2 block">
                Unsere Lieblinge
            </span>
            <h2 className="text-3xl font-bold text-[#333]">Highlights</h2>
            {/* Decorative underline */}
            <div className="absolute -bottom-[21px] left-0 w-16 h-[2px] bg-[#2b4736]"></div>
          </div>
          
          <Link to="/shop" className="group flex items-center text-sm font-bold text-[#333] hover:text-[#2b4736] transition-colors mt-4 sm:mt-0">
            Alle Produkte anzeigen
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-3 group-hover:bg-[#2b4736] group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        )}
      </section>
      
      {/* Newsletter / Brand Area */}
       <section className="bg-white rounded-xl p-8 md:p-16 shadow-sm border border-gray-100 text-center relative overflow-hidden">
             {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#2b4736]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#2b4736]/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#333]">Bleiben Sie auf dem Laufenden</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Abonnieren Sie unseren Newsletter und erhalten Sie exklusive Einblicke in neue Kollektionen und Design-Trends.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Ihre E-Mail Adresse"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] transition-all"
                    />
                    <Button type="submit" className="whitespace-nowrap">
                        Anmelden
                    </Button>
                </form>
            </div>
       </section>
    </div>
  );
};