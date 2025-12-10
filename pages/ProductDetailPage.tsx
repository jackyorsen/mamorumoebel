
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
  Maximize2,
  Bell,
  Check
} from "lucide-react";
import { useProductFromSheets } from "../hooks/useSheetsApi";
import { useCart } from "../context/CartContext";
import { OptimizedImage } from "../components/OptimizedImage";

type RouteParams = {
  sku: string;
};

// --- CONSTANTS ---
const PRIMARY_GREEN = "#2b4736";
const COLOR_GREEN = "#00C18A";
const COLOR_YELLOW = "#FFD85A";
const COLOR_ORANGE = "#FB8C00";
const COLOR_RED = "#D24A43";
const COLOR_NUMBER = "#00AE8A";

const formatPrice = (value: number | null | undefined, currency: string = "€") => {
  if (value == null || isNaN(value)) return "";
  return `${value.toFixed(2)} ${currency}`;
};

// Linear Interpolation & Easing
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const f = Math.max(0, Math.min(1, factor));
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  const r = Math.round(lerp(r1, r2, f));
  const g = Math.round(lerp(g1, g2, f));
  const b = Math.round(lerp(b1, b2, f));
  return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
};

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;
    function sampleCurveX(t: number) { return ((ax * t + bx) * t + cx) * t; }
    function sampleCurveY(t: number) { return ((ay * t + by) * t + cy) * t; }
    function solveCurveX(x: number) {
        let t2 = x;
        for (let i = 0; i < 8; i++) {
            const x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < 1e-6) return t2;
            const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        return t2;
    }
    return function(x: number) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        return sampleCurveY(solveCurveX(x));
    };
}
const easeDrain = cubicBezier(0.15, 0.85, 0.35, 1.00);

const MOCK_REVIEWS = [
  { id: 1, author: "Maria S.", date: "12. Oktober 2023", rating: 5, title: "Traumhaft schön!", content: "Die Vase sieht in echt noch besser aus als auf den Bildern. Sehr hochwertige Verarbeitung und sicher verpackt.", verified: true },
  { id: 2, author: "Thomas K.", date: "28. September 2023", rating: 4, title: "Gutes Preis-Leistungs-Verhältnis", content: "Bin sehr zufrieden, nur die Farbe weicht minimal vom Foto ab.", verified: true },
  { id: 3, author: "Lena M.", date: "15. September 2023", rating: 5, title: "Liebe es!", content: "Habe lange nach so etwas gesucht. Der Versand war blitzschnell.", verified: true },
  { id: 4, author: "Jan B.", date: "02. September 2023", rating: 5, title: "Perfekt", content: "Alles bestens. Gerne wieder!", verified: false }
];

export const ProductDetailPage: React.FC = () => {
  const { sku } = useParams<RouteParams>();
  const { product, loading, error } = useProductFromSheets(sku || "");
  const { addToCart } = useCart();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'shipping' | 'reviews'>('description');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  
  // Stock Animation
  const [barWidth, setBarWidth] = useState(100);
  const [barColor, setBarColor] = useState(COLOR_GREEN);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sku]);

  useEffect(() => {
    if (isLightboxOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLightboxOpen]);

  useEffect(() => { setIsZoomed(false); }, [activeImageIndex]);

  // Stock Animation
  useEffect(() => {
    if (loading || !product) return;
    setBarWidth(100);
    setBarColor(COLOR_GREEN);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const stock = product.stock ?? 0;
    const isOutOfStock = product.isOutOfStock;

    if (isOutOfStock || stock <= 0 || stock >= 30) return;

    const MAX_STOCK = 30;
    const targetPercentage = Math.max(5, (stock / MAX_STOCK) * 100); 
    const DURATION = 2000;

    const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const timeElapsed = time - startTimeRef.current;
        const rawProgress = Math.min(timeElapsed / DURATION, 1);
        const easedProgress = easeDrain(rawProgress);
        const currentWidth = 100 + (targetPercentage - 100) * easedProgress;

        let currentColor = COLOR_GREEN;
        if (currentWidth >= 30) {
            const factor = 1 - ((currentWidth - 30) / 70);
            currentColor = interpolateColor(COLOR_GREEN, COLOR_YELLOW, factor);
        } else if (currentWidth >= 10) {
            const factor = 1 - ((currentWidth - 10) / 20);
            currentColor = interpolateColor(COLOR_YELLOW, COLOR_ORANGE, factor);
        } else {
            const factor = 1 - (currentWidth / 10);
            currentColor = interpolateColor(COLOR_ORANGE, COLOR_RED, factor);
        }

        setBarWidth(currentWidth);
        setBarColor(currentColor);

        if (timeElapsed < DURATION) requestRef.current = requestAnimationFrame(animate);
    };
    const timeoutId = setTimeout(() => {
        startTimeRef.current = undefined;
        requestRef.current = requestAnimationFrame(animate);
    }, 200);
    return () => {
        clearTimeout(timeoutId);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [product, loading]);

  const calculateFinalPrice = (basePrice: number, percent: number) => Math.round((basePrice * (1 - percent / 100)) * 100) / 100;

  // --- SAFE ACCESSORS FOR SKELETON STATE ---
  // If product is null (loading), we use defaults to prevent crash, but render Skeletons
  const isLoading = loading || !product;
  const safeProduct = product || { 
      title: "", description: "", price: 0, salePrice: undefined, images: [], image: "", stock: 0, isOutOfStock: false, sku: "", isNew: false 
  };
  
  const displayImages = safeProduct.images && safeProduct.images.length > 0 ? safeProduct.images : [safeProduct.image || ""];
  const activeImage = displayImages[activeImageIndex] || "";
  const currentPrice = safeProduct.salePrice ?? safeProduct.price;
  const averageRating = 4.8; // Static for demo

  const handleAddToCart = () => {
    if (safeProduct.isOutOfStock) return;
    for(let i=0; i<quantity; i++) addToCart({ ...safeProduct, image: displayImages[0] });
  };

  const goNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => prev === displayImages.length - 1 ? 0 : prev + 1);
  };
  const goPrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => prev === 0 ? displayImages.length - 1 : prev - 1);
  };

  return (
    <>
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-gray-500 font-medium uppercase tracking-wide mb-8">
        <Link to="/" className="opacity-60 hover:opacity-100">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="opacity-60 hover:opacity-100">Shop</Link>
        <span className="mx-2">/</span>
        {isLoading ? (
             <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
        ) : (
             <span className="text-[#2b4736] truncate max-w-[200px] sm:max-w-md">{safeProduct.title}</span>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* --- LEFT: IMAGES --- */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 h-fit">
          {/* Thumbnails */}
          <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-[90px] max-h-[600px] scrollbar-hide py-1">
             {isLoading ? (
                [1,2,3].map(i => <div key={i} className="w-[80px] h-[80px] flex-shrink-0 bg-gray-200 rounded-lg skeleton"></div>)
             ) : (
                displayImages.length > 1 && displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-[80px] h-[80px] flex-shrink-0 bg-white rounded-lg overflow-hidden transition-all duration-200 ${idx === activeImageIndex ? "border-2 shadow-sm" : "border border-gray-200"}`}
                    style={{ borderColor: idx === activeImageIndex ? PRIMARY_GREEN : undefined }}
                  >
                    <OptimizedImage src={img} variant="small" className="w-full h-full object-cover" />
                  </button>
                ))
             )}
          </div>
          
          {/* Main Image */}
          <div 
            className={`order-1 md:order-2 flex-1 relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px] md:min-h-[600px] lg:h-[600px] group ${isLoading ? '' : 'cursor-zoom-in'}`}
            onClick={() => !isLoading && setIsLightboxOpen(true)}
          >
             {isLoading ? (
                 <div className="w-full h-full bg-gray-200 skeleton absolute inset-0"></div>
             ) : (
                 <>
                    {displayImages.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); goPrev(e); }} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-[#2b4736] z-20"><ChevronLeft className="w-6 h-6" /></button>
                        <button onClick={(e) => { e.stopPropagation(); goNext(e); }} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-[#2b4736] z-20"><ChevronRight className="w-6 h-6" /></button>
                      </>
                    )}
                    <OptimizedImage 
                        src={activeImage} 
                        alt={safeProduct.title} 
                        variant="full" 
                        className={`w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105 ${safeProduct.isOutOfStock ? 'grayscale' : ''}`} 
                    />
                 </>
             )}
          </div>
        </div>

        {/* --- RIGHT: INFO --- */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div>
             <div className="flex justify-between items-center mb-2">
                 {isLoading ? (
                     <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
                 ) : (
                     <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-1 text-yellow-400 hover:opacity-80 transition-opacity">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} />)}
                        <span className="text-gray-400 text-xs ml-2 font-medium underline decoration-dotted">({MOCK_REVIEWS.length} Bewertungen)</span>
                     </button>
                 )}
                 {isLoading ? <div className="h-4 w-20 bg-gray-200 rounded skeleton"></div> : <span className="text-gray-400 text-xs">SKU: {safeProduct.sku}</span>}
             </div>
             
             {isLoading ? (
                 <div className="h-10 w-3/4 bg-gray-200 rounded skeleton mb-3"></div>
             ) : (
                 <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-3 leading-tight">{safeProduct.title}</h1>
             )}

             <div className="flex items-baseline gap-3 mb-2">
               {isLoading ? (
                   <div className="h-8 w-24 bg-gray-200 rounded skeleton"></div>
               ) : (
                   <>
                    <span className={`text-3xl font-bold ${safeProduct.isOutOfStock ? 'text-gray-400' : 'text-[#e94e34]'}`}>{formatPrice(currentPrice)}</span>
                    {safeProduct.salePrice && <span className="text-lg text-gray-400 line-through decoration-gray-400">{formatPrice(safeProduct.price)}</span>}
                   </>
               )}
             </div>
          </div>
          <div className="h-px bg-gray-100 my-2"></div>
          
          {/* --- STOCK --- */}
          <div className="my-4">
             {isLoading ? (
                 <div className="h-6 w-full bg-gray-200 rounded skeleton"></div>
             ) : (
                 safeProduct.isOutOfStock || safeProduct.stock === 0 ? (
                   <div className="text-[15px] font-medium text-[#333]">Ausverkauft</div>
                 ) : safeProduct.stock >= 30 ? (
                   <>
                     <div className="flex items-center gap-2 mb-2">
                        <Check className="w-4 h-4" style={{ color: COLOR_GREEN }} />
                        <span className="text-[15px] font-normal text-[#000000]">Vorrätig</span>
                     </div>
                     <div className="w-full h-[5px] bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className="h-full w-full" style={{ backgroundColor: COLOR_GREEN }}></div>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="mb-2 text-[15px] font-normal text-[#000000]">
                        Nur noch <span style={{ color: COLOR_NUMBER }}>{safeProduct.stock}</span> Artikel auf Lager.
                     </div>
                     <div className="w-full h-[5px] bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: barColor }}></div>
                     </div>
                   </>
                 )
             )}
          </div>

          {/* Add To Cart */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
             {isLoading ? (
                <div className="h-14 w-full bg-gray-200 rounded-full skeleton"></div>
             ) : safeProduct.isOutOfStock ? (
               <button disabled className="bg-gray-200 text-gray-500 rounded-lg px-6 py-4 font-semibold text-base w-full cursor-not-allowed flex items-center justify-center gap-2">
                 <Bell className="w-5 h-5" /> Benachrichtigen
               </button>
             ) : (
               <>
                 <button onClick={handleAddToCart} className="border border-green-900 text-green-900 rounded-full px-6 py-3 font-semibold text-base w-full md:w-auto transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-green-50">In den Warenkorb</button>
                 <button className="bg-green-900 text-white rounded-full px-6 py-3 font-semibold text-base w-full md:w-auto transition-all active:scale-[0.98] shadow-md hover:shadow-lg hover:bg-green-800">Jetzt Kaufen</button>
               </>
             )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
             {[
                 { icon: Truck, title: "Kostenloser Versand", sub: "Innerhalb Deutschlands" },
                 { icon: Headset, title: "24/5 Support", sub: "Professionelle Hilfe" },
                 { icon: Undo2, title: "30-Tage Rückgabe", sub: "Sorgenfrei einkaufen" },
                 { icon: ShieldCheck, title: "100% Sicher", sub: "SSL Verschlüsselung" }
             ].map((usp, i) => (
                 <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <usp.icon className="w-8 h-8 stroke-1" style={{ color: PRIMARY_GREEN }} />
                    <div><p className="text-sm font-bold text-gray-900">{usp.title}</p><p className="text-xs text-gray-500">{usp.sub}</p></div>
                 </div>
             ))}
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {[
            { id: 'description', label: 'Beschreibung' },
            { id: 'reviews', label: `Bewertungen (${MOCK_REVIEWS.length})` },
            { id: 'qa', label: 'Fragen & Antworten' },
            { id: 'shipping', label: 'Versand & Lieferung' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative px-6 md:px-10 py-5 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-white' : 'text-gray-500 hover:text-gray-800 bg-gray-50/50 hover:bg-gray-50'}`} style={{ color: activeTab === tab.id ? PRIMARY_GREEN : undefined }}>
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[3px]" style={{ backgroundColor: PRIMARY_GREEN }}></span>}
            </button>
          ))}
        </div>
        <div className="p-8 md:p-12 min-h-[300px] text-gray-600 leading-relaxed text-[15px]">
          {activeTab === 'description' && (
            <div className="max-w-4xl animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Produktdetails</h3>
              <div className="prose prose-stone max-w-none text-gray-600">
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded skeleton w-full"></div>
                        <div className="h-4 bg-gray-200 rounded skeleton w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded skeleton w-4/6"></div>
                    </div>
                ) : (
                    safeProduct.description ? safeProduct.description.split('\n').map((line, idx) => (line.trim() ? <p key={idx} className="mb-3">{line}</p> : <br key={idx} />)) : <p>Keine Beschreibung verfügbar.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
             <div className="space-y-6">
               {MOCK_REVIEWS.map(review => (
                   <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6">
                       <h4 className="font-bold text-sm text-gray-800">{review.title}</h4>
                       <p className="text-gray-600 text-sm">{review.content}</p>
                   </div>
               ))}
             </div>
          )}
          {activeTab === 'qa' && (
             <div className="space-y-4">
               <p className="font-bold">Häufige Fragen:</p>
               <p>Ist das Montagematerial dabei? Ja.</p>
             </div>
          )}
          {activeTab === 'shipping' && (
             <div className="space-y-4"><p>Kostenloser Versand in DE.</p></div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox */}
    {isLightboxOpen && !isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white z-50 p-2"><X size={32} /></button>
            <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsZoomed(!isZoomed)} onMouseMove={(e) => {
                if (!isZoomed) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
            }} style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}>
                <OptimizedImage src={activeImage} alt="" variant="full" className="max-h-screen max-w-full object-contain" style={{ transform: isZoomed ? 'scale(2.5)' : 'scale(1)', transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center center' }} />
            </div>
        </div>
    )}
    </>
  );
};
