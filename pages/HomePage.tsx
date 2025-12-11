
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sofa, Utensils, Bath, BedDouble, Monitor, DoorOpen, Truck, Smile, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { OptimizedImage } from '../components/OptimizedImage';
import { NewsletterSection } from '../components/NewsletterSection';

export const HomePage: React.FC = () => {
  // Use the new Google Sheets API Hook with Caching
  const { products, loading } = useProductsFromSheets();
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  
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

  // Category Mock Data
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

  // Room Data for "Shoppen nach Raum"
  const rooms = [
    { name: 'Wohnzimmer', icon: Sofa, image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=2000' },
    { name: 'Küche & Esszimmer', icon: Utensils, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2000' },
    { name: 'Badezimmer', icon: Bath, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2000' },
    { name: 'Schlafzimmer', icon: BedDouble, image: 'https://images.unsplash.com/photo-1616594039964-40891a90b3b9?q=80&w=2000' },
    { name: 'Home Office', icon: Monitor, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000' },
    { name: 'Eingangsbereich', icon: DoorOpen, image: 'https://images.unsplash.com/photo-1517817748493-49ec54a32465?q=80&w=2000' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Width */}
      <section className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center text-center">
        {/* Background Image */}
        <div className="absolute inset-0">
            <OptimizedImage 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
                alt="Modern Interior" 
                variant="full"
                className="w-full h-full object-cover"
            />
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/20 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 px-6 max-w-4xl mx-auto">
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

      {/* Main Content Container */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-16 space-y-16 lg:space-y-24 w-full">
        {/* Categories Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link 
                to="/shop" 
                key={idx} 
                className="group relative h-[300px] md:h-[380px] overflow-hidden rounded-lg block shadow-sm"
              >
                <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/20 transition-colors z-20" />
                <OptimizedImage
                  src={cat.image}
                  alt={cat.name}
                  variant="small"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-8 left-8 z-30">
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

        {/* Shoppen nach Raum Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10 text-[#333]">Shoppen nach Raum</h2>
          
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl bg-gray-100">
              {/* Background Images - Stacked for cross-fade transition */}
              {rooms.map((room, index) => (
                  <div 
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeRoomIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                      <OptimizedImage 
                          src={room.image} 
                          alt={room.name} 
                          variant="full" 
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                  </div>
              ))}

              {/* Navigation Tabs overlay */}
              <div className="absolute bottom-6 left-0 right-0 z-20 px-4 overflow-x-auto scrollbar-hide">
                  <div className="flex justify-start md:justify-center gap-4 min-w-max pb-2 px-2">
                      {rooms.map((room, index) => {
                          const isActive = activeRoomIndex === index;
                          return (
                              <button
                                  key={index}
                                  onClick={() => setActiveRoomIndex(index)}
                                  className={`
                                      flex flex-col items-center justify-center p-4 
                                      w-[140px] h-[110px] rounded-lg backdrop-blur-md transition-all duration-300
                                      border shadow-lg
                                      ${isActive 
                                          ? 'bg-[#2b4736] text-white border-[#2b4736] scale-105' 
                                          : 'bg-white/90 text-gray-700 border-white/50 hover:bg-white hover:scale-105'}
                                  `}
                              >
                                  <room.icon className={`w-8 h-8 mb-3 stroke-[1.5] ${isActive ? 'text-white' : 'text-[#2b4736]'}`} />
                                  <span className="text-sm font-bold leading-tight text-center">{room.name}</span>
                              </button>
                          );
                      })}
                  </div>
              </div>
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

          {/* Product Grid - Using Skeleton or Products */}
          {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-[400px] bg-gray-100 skeleton rounded-lg"></div>
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

        {/* "Why MAMORU MÖBEL" Section */}
        <section>
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#333] mb-4">Warum MAMORU MÖBEL?</h2>
              <p className="text-gray-500">Ihr erster Anlaufpunkt für die Ausstattung Ihres Zuhauses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
              {[
                  { 
                      icon: Truck, 
                      highlight: "Kostenloser", 
                      rest: "Versand", 
                      desc: "Gratis-Versand innerhalb Deutschlands." 
                  },
                  { 
                      icon: Smile, 
                      highlight: "24/5", 
                      rest: "Support", 
                      desc: "Erstklassiger Kundenservice, der Ihnen von Montag bis Freitag zur Verfügung steht." 
                  },
                  { 
                      icon: Clock, 
                      highlight: "30-Tage", 
                      rest: "Rückgaberecht", 
                      desc: "Problemlose Rückgabe und Umtausch innerhalb von 30 Tagen nach dem Kauf." 
                  },
                  { 
                      icon: ShieldCheck, 
                      highlight: "100% sichere", 
                      rest: "Zahlungsmethoden", 
                      desc: "Stressfrei einkaufen mit sicheren und vielseitigen Zahlungsmöglichkeiten." 
                  }
              ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 pt-10 rounded-lg border border-gray-100 text-center shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-sm border border-gray-50 group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="w-8 h-8 text-[#333] stroke-[1.2]" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 mt-4">
                          <span className="text-[#e94e34]">{item.highlight}</span> <span className="text-[#333]">{item.rest}</span>
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed px-2">
                          {item.desc}
                      </p>
                  </div>
              ))}
          </div>
        </section>
      </div>
      
      {/* Newsletter Section - Reusable Component */}
      <NewsletterSection />
    </div>
  );
};
