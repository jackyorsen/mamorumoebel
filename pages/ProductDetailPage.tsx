
import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  Headset, 
  Minus, 
  Plus,
  Heart,
  Undo2,
  X,
  Maximize2
} from "lucide-react";
import { useProductFromSheets } from "../hooks/useSheetsApi";
import { useCart } from "../context/CartContext";

type RouteParams = {
  sku: string;
};

// Global Design Color
const PRIMARY_GREEN = "#2b4736";
const PRIMARY_GREEN_HOVER = "#1f3528";
const PRIMARY_GREEN_LIGHT = "rgba(43, 71, 54, 0.05)";

const formatPrice = (value: number | null | undefined, currency: string = "€") => {
  if (value == null || isNaN(value)) return "";
  return `${value.toFixed(2)} ${currency}`;
};

const SWIPE_THRESHOLD = 50; // px

// Mock Reviews Data
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Maria S.",
    date: "12. Oktober 2023",
    rating: 5,
    title: "Traumhaft schön!",
    content: "Die Vase sieht in echt noch besser aus als auf den Bildern. Sehr hochwertige Verarbeitung und sicher verpackt.",
    verified: true
  },
  {
    id: 2,
    author: "Thomas K.",
    date: "28. September 2023",
    rating: 4,
    title: "Gutes Preis-Leistungs-Verhältnis",
    content: "Bin sehr zufrieden, nur die Farbe weicht minimal vom Foto ab (einen Tick dunkler), was aber trotzdem gut passt.",
    verified: true
  },
  {
    id: 3,
    author: "Lena M.",
    date: "15. September 2023",
    rating: 5,
    title: "Liebe es!",
    content: "Habe lange nach so etwas gesucht. Der Versand war blitzschnell und der Kundenservice sehr freundlich.",
    verified: true
  },
  {
    id: 4,
    author: "Jan B.",
    date: "02. September 2023",
    rating: 5,
    title: "Perfekt",
    content: "Alles bestens. Gerne wieder!",
    verified: false
  }
];

export const ProductDetailPage: React.FC = () => {
  const { sku } = useParams<RouteParams>();
  const { product, loading, error } = useProductFromSheets(sku || "");
  const { addToCart } = useCart();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'shipping' | 'reviews'>('description');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Discounts Configuration
  const discounts = [
    { percent: 18, code: "SHSVIP18", message: "JETZT KOSTENLOS MITGLIED WERDEN." },
    { percent: 12, code: "BLACK12", message: "auf alle Produkte" }
  ];

  // Logic: Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100;
  const calculateFinalPrice = (basePrice: number, percent: number) => {
    return Math.round((basePrice * (1 - percent / 100)) * 100) / 100;
  };

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sku]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLightboxOpen]);

  // Reset zoom when active image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [activeImageIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: PRIMARY_GREEN }}></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500 min-h-[50vh]">
        Produkt konnte nicht geladen werden.
      </div>
    );
  }

  const {
    description,
    price,
    salePrice,
    stock,
    images = [],
    image,
    title,
    sku: productSku
  } = product;

  // Image Logic
  const displayImages = images && images.length > 0
    ? images
    : [image || "https://via.placeholder.com/800x600?text=Kein+Bild"];

  const activeImage = displayImages[activeImageIndex] ?? displayImages[0];
  const currentPrice = salePrice ?? price;
  const oldPrice = salePrice ? price : undefined;
  
  const averageRating = MOCK_REVIEWS.reduce((acc, curr) => acc + curr.rating, 0) / MOCK_REVIEWS.length;

  // Actions
  const handleAddToCart = () => {
    for(let i=0; i<quantity; i++) {
        addToCart({
            ...product,
            image: displayImages[0],
        });
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newVal = prev + delta;
      return newVal < 1 ? 1 : newVal;
    });
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Slider Navigation
  const goPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goNext(); // Swipe Left -> Next
      else goPrev(); // Swipe Right -> Prev
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Lightbox Zoom Logic
  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <>
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-8">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-gray-500 font-medium uppercase tracking-wide mb-8">
        <Link to="/" className="opacity-60 hover:opacity-100 transition-opacity">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="opacity-60 hover:opacity-100 transition-opacity">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-[#2b4736] truncate max-w-[200px] sm:max-w-md">{title}</span>
      </nav>

      {/* --- UPPER SECTION: GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* --- A. MEDIA AREA (Left - 7 Columns) --- */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 h-fit">
          
          {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
          {displayImages.length > 1 && (
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-[90px] max-h-[600px] scrollbar-hide py-1">
              {displayImages.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-[80px] h-[80px] flex-shrink-0 bg-white rounded-lg overflow-hidden transition-all duration-200 ${
                      isActive
                        ? "border-2 shadow-sm"
                        : "border border-gray-200"
                    }`}
                    style={{ 
                        borderColor: isActive ? PRIMARY_GREEN : undefined 
                    }}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Image */}
          <div 
            className="order-1 md:order-2 flex-1 relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px] md:min-h-[600px] lg:h-[600px] group cursor-zoom-in"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsLightboxOpen(true)}
          >
             {/* Slider Buttons (Desktop Only) */}
             {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(e); }}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-[#2b4736] transition-all z-20 group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(e); }}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-[#2b4736] transition-all z-20 group"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}

            {/* Image (No Zoom) */}
            <img
              src={activeImage}
              alt={title}
              className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNew && (
                    <span 
                        className="text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-sm"
                        style={{ backgroundColor: PRIMARY_GREEN }}
                    >
                        Neu
                    </span>
                )}
                {salePrice && (
                    <span className="bg-[#e94e34] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-sm">
                        Sale
                    </span>
                )}
            </div>

            {/* Wishlist & Zoom Indicators */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
               <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors border border-gray-100 hover:border-red-100"
                >
                  <Heart className="w-5 h-5" />
               </button>
               <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-5 h-5" />
               </div>
            </div>
          </div>
        </div>

        {/* --- C. PRODUCT DATA (Right - 5 Columns) --- */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Header Info */}
          <div>
             <div className="flex justify-between items-center mb-2">
                 <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-1 text-yellow-400 hover:opacity-80 transition-opacity">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} />)}
                    <span className="text-gray-400 text-xs ml-2 font-medium underline decoration-dotted">({MOCK_REVIEWS.length} Bewertungen)</span>
                 </button>
                 <span className="text-gray-400 text-xs">SKU: {productSku}</span>
             </div>
             
             <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-3 leading-tight">{title}</h1>
             
             {/* Price */}
             <div className="flex items-baseline gap-3 mb-2">
               {/* Original price logic from prompt requests RED for end-price in coupons, but standard price usually red if sale */}
               <span className="text-3xl font-bold text-[#e94e34]">{formatPrice(currentPrice)}</span>
               {oldPrice && (
                 <span className="text-lg text-gray-400 line-through decoration-gray-400">{formatPrice(oldPrice)}</span>
               )}
             </div>
             <p className="text-xs text-gray-500 mb-4">Preis inkl. MwSt., zzgl. Versandkosten</p>
          </div>

          <div className="h-px bg-gray-100 my-2"></div>

          {/* Color Variants (Dummy) */}
          <div>
            <span className="text-sm font-bold text-gray-700 block mb-3">Farbe: <span className="font-normal text-gray-500">Weiß</span></span>
            <div className="flex gap-3">
              <button 
                className="w-10 h-10 rounded-full border border-gray-200 ring-2 ring-offset-2 bg-white shadow-sm flex items-center justify-center"
                style={{ '--tw-ring-color': PRIMARY_GREEN } as React.CSSProperties}
              >
                  <span className="sr-only">Weiss</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 bg-gray-600 shadow-sm hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 transition-all">
                  <span className="sr-only">Grau</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-wrap gap-4 mt-2 items-center">
             <div className="flex items-center border border-gray-300 rounded-full h-12 w-[120px] bg-white">
               <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] rounded-l-full transition-colors"
               >
                 <Minus className="w-4 h-4" />
               </button>
               <input 
                type="text" 
                value={quantity} 
                readOnly 
                className="flex-1 w-full text-center font-bold text-gray-800 border-none focus:ring-0 p-0"
               />
               <button 
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] rounded-r-full transition-colors"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* Buttons Row (Pill Shaped) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
             {/* In den Warenkorb - Outline Green Pill */}
             <button
               onClick={handleAddToCart}
               disabled={stock !== undefined && stock <= 0}
               className="border border-green-900 text-green-900 rounded-full px-6 py-3 font-semibold text-base w-full md:w-auto transition-all active:scale-95 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 hover:bg-green-50"
             >
               {stock !== undefined && stock <= 0 ? 'Ausverkauft' : 'In den Warenkorb'}
             </button>

             {/* Jetzt Kaufen - Filled Green Pill */}
             <button 
                className="bg-green-900 text-white rounded-full px-6 py-3 font-semibold text-base w-full md:w-auto transition-all active:scale-[0.98] shadow-md hover:shadow-lg hover:bg-green-800"
             >
                Jetzt Kaufen
             </button>
          </div>

          {/* Dynamic Coupon Boxes (Green Theme) */}
          <div className="flex flex-col gap-3 mt-6">
             {discounts.map((discount) => {
                const finalPrice = calculateFinalPrice(currentPrice, discount.percent);
                const isCopied = copiedCode === discount.code;
                
                return (
                  <div key={discount.code} className="flex rounded-lg overflow-hidden shadow-sm h-20 relative filter drop-shadow-sm group">
                     {/* Left Side (Percent) - Green */}
                     <div 
                        className="text-white w-[48px] flex flex-col items-center justify-center shrink-0"
                        style={{ backgroundColor: PRIMARY_GREEN }}
                     >
                        <span className="font-bold text-lg leading-none transform -rotate-90 origin-center whitespace-nowrap">
                            -{discount.percent}%
                        </span>
                     </div>
                     
                     {/* Dashed Separator */}
                     <div className="absolute left-[46px] top-0 bottom-0 border-l-2 border-dashed border-white/50 z-10"></div>
                     
                     {/* Right Side (Content) */}
                     <div className="flex-1 bg-white flex items-center px-4 py-2 relative">
                        {/* Ticket Notch (Right Edge) */}
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f7f7f7] rounded-full z-20"></div>

                        <div className="flex flex-col justify-center gap-0.5">
                           <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide leading-tight">{discount.message}</span>
                           <div className="text-xs font-bold text-gray-700">Code: <span className="select-all font-mono text-[#333]">{discount.code}</span></div>
                           <div className="text-sm font-bold text-[#333]">
                              Endpreis: <span className="text-[#e94e34]">{formatPrice(finalPrice)}</span>
                           </div>
                        </div>
                        
                        {/* Copy Button - Green Pill, Right Aligned */}
                        <button 
                           onClick={() => copyCoupon(discount.code)}
                           className="px-5 py-2 rounded-full bg-green-900 text-white font-semibold text-sm ml-auto mr-1 shadow-sm active:scale-95 transition-all hover:opacity-90"
                        >
                           {isCopied ? 'Kopiert!' : 'Kopieren'}
                        </button>
                     </div>
                  </div>
                );
             })}
          </div>

          {/* --- D. USP BOXES --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
             {[
                 { icon: Truck, title: "Kostenloser Versand", sub: "Innerhalb Deutschlands" },
                 { icon: Headset, title: "24/5 Support", sub: "Professionelle Hilfe" },
                 { icon: Undo2, title: "30-Tage Rückgabe", sub: "Sorgenfrei einkaufen" },
                 { icon: ShieldCheck, title: "100% Sicher", sub: "SSL Verschlüsselung" }
             ].map((usp, i) => (
                 <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <usp.icon className="w-8 h-8 stroke-1" style={{ color: PRIMARY_GREEN }} />
                    <div>
                        <p className="text-sm font-bold text-gray-900">{usp.title}</p>
                        <p className="text-xs text-gray-500">{usp.sub}</p>
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </div>

      {/* --- E. TABS SECTION --- */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap border-b border-gray-200">
          {[
            { id: 'description', label: 'Beschreibung' },
            { id: 'reviews', label: `Bewertungen (${MOCK_REVIEWS.length})` },
            { id: 'qa', label: 'Fragen & Antworten' },
            { id: 'shipping', label: 'Versand & Lieferung' }
          ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 md:px-10 py-5 text-sm font-bold uppercase tracking-wide transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white' 
                    : 'text-gray-500 hover:text-gray-800 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                style={{ color: activeTab === tab.id ? PRIMARY_GREEN : undefined }}
            >
                {tab.label}
                {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px]" style={{ backgroundColor: PRIMARY_GREEN }}></span>
                )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 md:p-12 min-h-[300px] text-gray-600 leading-relaxed text-[15px]">
          
          {activeTab === 'description' && (
            <div className="max-w-4xl animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Produktdetails</h3>
              <div className="prose prose-stone max-w-none text-gray-600">
                {description ? (
                    description.split('\n').map((line, idx) => (
                        line.trim() ? <p key={idx} className="mb-3">{line}</p> : <br key={idx} />
                    ))
                ) : (
                    <p>Keine Beschreibung verfügbar.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-8 mb-10 border-b border-gray-100 pb-8">
                {/* Summary Box */}
                <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                   <div className="text-5xl font-bold text-[#333] mb-2">{averageRating.toFixed(1)}</div>
                   <div className="flex gap-1 text-yellow-400 mb-2">
                      {[1,2,3,4,5].map(star => (
                         <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                   </div>
                   <p className="text-gray-500 text-sm">Basierend auf {MOCK_REVIEWS.length} Bewertungen</p>
                   <button className="mt-4 px-6 py-2 bg-[#2b4736] text-white text-sm font-bold rounded-full hover:bg-[#1f3528] transition-colors">
                      Bewertung schreiben
                   </button>
                </div>

                {/* Breakdown (Progress bars) */}
                <div className="flex-[2] space-y-2">
                  {[5,4,3,2,1].map(stars => {
                      const count = MOCK_REVIEWS.filter(r => r.rating === stars).length;
                      const percent = (count / MOCK_REVIEWS.length) * 100;
                      return (
                          <div key={stars} className="flex items-center gap-3 text-sm">
                              <span className="w-3 font-bold">{stars}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                              <span className="w-8 text-gray-400 text-right">{count}</span>
                          </div>
                      )
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                  {MOCK_REVIEWS.map(review => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{review.author}</span>
                                  {review.verified && (
                                       <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-medium flex items-center gap-1">
                                          <ShieldCheck className="w-3 h-3" /> Verifizierter Kauf
                                       </span>
                                  )}
                              </div>
                              <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <div className="flex gap-0.5 text-yellow-400 mb-2">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                              ))}
                          </div>
                          <h4 className="font-bold text-sm text-gray-800 mb-1">{review.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>
                      </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="max-w-3xl animate-in fade-in duration-300 space-y-8">
               <h3 className="text-xl font-bold text-gray-900 mb-4">Häufig gestellte Fragen</h3>
               
               {[
                   { q: "Ist das Montagematerial enthalten?", a: "Ja, das komplette Montagematerial sowie eine leicht verständliche Anleitung sind im Lieferumfang enthalten." },
                   { q: "Wie lange habe ich Garantie?", a: "Wir gewähren auf alle unsere Produkte die gesetzliche Gewährleistung von 2 Jahren." },
                   { q: "Kann ich das Produkt zurückgeben?", a: "Selbstverständlich. Sie können das Produkt innerhalb von 30 Tagen ohne Angabe von Gründen an uns zurücksenden." }
               ].map((qa, i) => (
                   <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                        <p className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                            <span style={{ color: PRIMARY_GREEN }}>Q:</span> {qa.q}
                        </p>
                        <p className="pl-6">A: {qa.a}</p>
                   </div>
               ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Versandinformationen</h3>
                    <p>Wir bearbeiten Ihre Bestellung umgehend. Bestellungen, die werktags bis 14:00 Uhr eingehen, werden in der Regel noch am selben Tag versendet.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-bold text-gray-900 mb-1">Deutschland</div>
                            <div className="text-sm text-gray-500">2-4 Werktage</div>
                            <div className="font-bold text-sm mt-2" style={{ color: PRIMARY_GREEN }}>Kostenlos</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-bold text-gray-900 mb-1">Österreich</div>
                            <div className="text-sm text-gray-500">3-5 Werktage</div>
                            <div className="font-bold text-sm mt-2" style={{ color: PRIMARY_GREEN }}>9,90 €</div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4">Unsere Logistikpartner</h4>
                      <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm">
                              <span className="font-bold italic text-yellow-500 text-xl">DHL</span>
                              <span className="text-xs text-gray-400 ml-auto">Standard</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm">
                              <span className="font-bold text-red-600 text-xl">DPD</span>
                              <span className="text-xs text-gray-400 ml-auto">Sperrgut</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* --- F. LIGHTBOX OVERLAY --- */}
    {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            {/* Controls */}
            <button 
                onClick={() => setIsLightboxOpen(false)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2 transition-colors"
                aria-label="Schließen"
            >
                <X size={32} />
            </button>

            {/* Navigation (only if multiple images) */}
            {displayImages.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    >
                        <ChevronRight size={40} />
                    </button>
                </>
            )}

            {/* Zoomable Image Container */}
            <div
                className="relative overflow-hidden w-full h-full flex items-center justify-center select-none"
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleLightboxMouseMove}
                style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
            >
                <img
                    src={activeImage}
                    alt={title}
                    className="max-h-screen max-w-full object-contain transition-transform duration-200 ease-out"
                    style={{
                        transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                        transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center center'
                    }}
                    loading="lazy"
                />
            </div>

            {/* Lightbox Thumbnails */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2 scrollbar-hide z-50">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                            className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                                idx === activeImageIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )}
    </>
  );
};
