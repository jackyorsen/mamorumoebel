
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Star, 
  Truck, 
  ShieldCheck, 
  Headset, 
  Minus, 
  Plus,
  Bell,
  Check,
  ThumbsUp,
  ThumbsDown,
  X,
  Undo2,
  Gift
} from "lucide-react";
import { useProductFromSheets, useProductsFromSheets } from "../hooks/useSheetsApi";
import { useCart } from "../context/CartContext";
import { OptimizedImage } from "../components/OptimizedImage";
import { CouponBox, Coupon } from "../components/CouponBox";
import { ProductCard } from "../components/ProductCard";
import { NewsletterSection } from "../components/NewsletterSection";

type RouteParams = {
  sku: string;
};

// --- CONSTANTS ---
const PRIMARY_GREEN = "#2b4736";
const MAMORU_GREEN = "#0E4F34"; // Requested specific green
const MAMORU_ORANGE = "#E87E24"; // Requested specific orange
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
        for (let i = 8; i < 8; i++) {
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
  { id: 1, author: "Maria S.", date: "12. Oktober 2023", rating: 5, title: "Traumhaft schön!", content: "Die Vase sieht in echt noch besser aus als auf den Bildern. Sehr hochwertige Verarbeitung und sicher verpackt.", verified: true, helpful: 12, notHelpful: 0 },
  { id: 2, author: "Thomas K.", date: "28. September 2023", rating: 4, title: "Gutes Preis-Leistungs-Verhältnis", content: "Bin sehr zufrieden, nur die Farbe weicht minimal vom Foto ab.", verified: true, helpful: 5, notHelpful: 1 },
  { id: 3, author: "Lena M.", date: "15. September 2023", rating: 5, title: "Liebe es!", content: "Habe lange nach so etwas gesucht. Der Versand war blitzschnell.", verified: true, helpful: 8, notHelpful: 0 },
  { id: 4, author: "Jan B.", date: "02. September 2023", rating: 5, title: "Perfekt", content: "Alles bestens. Gerne wieder!", verified: false, helpful: 2, notHelpful: 0 }
];

export const ProductDetailPage: React.FC = () => {
  const { sku } = useParams<RouteParams>();
  const { product, loading, error } = useProductFromSheets(sku || "");
  const { products: allProducts } = useProductsFromSheets();
  const { addToCart } = useCart();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'shipping' | 'reviews'>('description');

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, name: '', email: '', content: '' });
  const [hoverRating, setHoverRating] = useState(0);

  // Stock Animation
  const [barWidth, setBarWidth] = useState(100);
  const [barColor, setBarColor] = useState(COLOR_GREEN);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // Thumbnail Scroll Ref
  const thumbsRef = useRef<HTMLDivElement>(null);
  
  // Recommendations Scroll Ref
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sku]);

  // Lock body scroll for lightbox OR review modal
  useEffect(() => {
    if (isLightboxOpen || isReviewModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLightboxOpen, isReviewModalOpen]);

  useEffect(() => { setIsZoomed(false); }, [activeImageIndex]);

  // Stock Animation Logic
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
  const isLoading = loading || !product;
  const safeProduct = product || { 
      id: "fallback-id", title: "", description: "", price: 0, salePrice: undefined, images: [], image: "", stock: 0, isOutOfStock: false, sku: "", isNew: false, category: "Allgemein", slug: "fallback"
  };
  
  const displayImages = safeProduct.images && safeProduct.images.length > 0 ? safeProduct.images : [safeProduct.image || ""];
  const activeImage = displayImages[activeImageIndex] || "";
  const currentPrice = safeProduct.salePrice ?? safeProduct.price;

  // --- RECOMMENDATIONS LOGIC ---
  const recommendations = useMemo(() => {
      if (!allProducts || allProducts.length === 0 || isLoading) return [];
      
      // 1. Filter by category (same category)
      let recs = allProducts.filter(p => p.category === safeProduct.category && p.id !== safeProduct.id);
      
      // 2. Fallback: If less than 5, fill with others (excluding current)
      if (recs.length < 5) {
          const others = allProducts.filter(p => p.category !== safeProduct.category && p.id !== safeProduct.id);
          recs = [...recs, ...others];
      }
      
      // 3. Limit to 15
      return recs.slice(0, 15);
  }, [allProducts, safeProduct, isLoading]);

  const scrollRecommendations = (direction: 'left' | 'right') => {
      if (recommendationsRef.current) {
          const container = recommendationsRef.current;
          const scrollAmount = container.clientWidth; // Scroll one viewport width
          container.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  };

  // --- Review Stats Calculation ---
  const averageRating = useMemo(() => {
      if (MOCK_REVIEWS.length === 0) return 0;
      const total = MOCK_REVIEWS.reduce((acc, curr) => acc + curr.rating, 0);
      return (total / MOCK_REVIEWS.length).toFixed(1);
  }, []);

  const ratingDistribution = useMemo(() => {
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      MOCK_REVIEWS.forEach(r => {
          // @ts-ignore
          if (dist[r.rating] !== undefined) dist[r.rating]++;
      });
      return dist;
  }, []);

  // --- DYNAMIC COUPONS ---
  const coupons: Coupon[] = useMemo(() => {
    if (isLoading || safeProduct.isOutOfStock) return [];
    
    return [
      {
        discount: 15,
        code: "BLACK15",
        description: "auf alle Produkte für Mitglieder & Newsletter-Abonnenten [kostenlos anmelden!]",
        finalPrice: calculateFinalPrice(currentPrice, 15)
      },
      {
        discount: 12,
        code: "BLACK12",
        description: "auf alle Produkte - für alle Kunden",
        finalPrice: calculateFinalPrice(currentPrice, 12)
      }
    ];
  }, [currentPrice, isLoading, safeProduct.isOutOfStock]);

  const handleAddToCart = () => {
    if (safeProduct.isOutOfStock) return;
    for(let i=0; i<quantity; i++) addToCart({ ...safeProduct, image: displayImages[0] });
  };

  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const increaseQuantity = () => setQuantity(prev => {
     if (safeProduct.stock && prev >= safeProduct.stock) return prev;
     return prev + 1;
  });

  const goNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => prev === displayImages.length - 1 ? 0 : prev + 1);
  };
  const goPrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => prev === 0 ? displayImages.length - 1 : prev - 1);
  };

  const handleScrollThumbs = (direction: 'up' | 'down') => {
    if (thumbsRef.current) {
        // Vertical step: 150px (height) + 12px (gap) = 162
        const scrollAmount = 162; 
        thumbsRef.current.scrollBy({ 
            top: direction === 'up' ? -scrollAmount : scrollAmount, 
            behavior: 'smooth' 
        });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Logic to submit review would go here
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 0, name: '', email: '', content: '' });
      alert("Vielen Dank für Ihre Bewertung!");
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 relative">
        
        {/* --- LEFT: IMAGES (STICKY ON DESKTOP) --- */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:gap-6 h-fit lg:sticky lg:top-[80px] lg:self-start">
          
          {/* Thumbnails (Songmics Style: Wide, Vertical, Hidden Scrollbar, Rectangular) */}
          <div className="order-2 md:order-1 relative flex flex-col items-center">
             
             {/* Up Arrow (Desktop) */}
             {displayImages.length > 3 && (
                <button 
                    onClick={() => handleScrollThumbs('up')}
                    className="hidden md:flex w-full items-center justify-center pb-2 text-gray-400 hover:text-[#2b4736] transition-colors z-10"
                    disabled={isLoading}
                >
                    <ChevronUp className="w-6 h-6" />
                </button>
             )}

             {/* Thumbnails Container */}
             {/* Songmics: Bigger, Rectangular, No Scrollbar */}
             <div 
                ref={thumbsRef}
                className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-hidden w-full md:w-[120px] max-h-[600px] scrollbar-hide py-1 px-1 scroll-smooth snap-y"
             >
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="w-[120px] h-[150px] flex-shrink-0 bg-gray-200 rounded-md skeleton"></div>)
                ) : (
                    displayImages.map((img, idx) => (
                    <button
                        key={idx}
                        onMouseEnter={() => setActiveImageIndex(idx)}
                        onClick={() => setActiveImageIndex(idx)}
                        // Songmics Style: Rectangular (~4:5), Wide (120px), Gray BG
                        className={`relative w-[120px] h-[150px] flex-shrink-0 bg-[#f7f7f7] rounded-[4px] overflow-hidden transition-all duration-200 snap-start ${idx === activeImageIndex ? "border border-[#2b4736]" : "border border-transparent hover:border-gray-300"}`}
                    >
                        <OptimizedImage 
                            src={img} 
                            variant="small" 
                            className="w-full h-full"
                            imgClassName="!object-contain p-1 mix-blend-multiply" 
                        />
                    </button>
                    ))
                )}
             </div>

             {/* Down Arrow (Desktop) */}
             {displayImages.length > 3 && (
                <button 
                    onClick={() => handleScrollThumbs('down')}
                    className="hidden md:flex w-full items-center justify-center pt-2 text-gray-400 hover:text-[#2b4736] transition-colors z-10"
                    disabled={isLoading}
                >
                    <ChevronDown className="w-6 h-6" />
                </button>
             )}
          </div>
          
          {/* Main Image (Songmics Style: Flexible Container, NOT Square, Object Contain) */}
          <div 
            className={`order-1 md:order-2 flex-1 relative bg-white border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[500px] group select-none ${isLoading ? '' : 'cursor-zoom-in'}`}
            onClick={() => !isLoading && setIsLightboxOpen(true)}
          >
             {isLoading ? (
                 <div className="w-full h-full bg-gray-200 skeleton absolute inset-0"></div>
             ) : (
                 <>
                    {displayImages.length > 1 && (
                      <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); goPrev(e); }} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#2b4736] z-20 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); goNext(e); }} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#2b4736] z-20 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    <OptimizedImage 
                        src={activeImage} 
                        alt={safeProduct.title} 
                        variant="full" 
                        // Key Songmics Feature: Container grows with image, but limited max height. 
                        // Image is NEVER cropped (!object-contain).
                        className="w-full h-auto flex justify-center items-center"
                        imgClassName={`max-w-full max-h-[750px] w-auto h-auto !object-contain transition-transform duration-500 ${safeProduct.isOutOfStock ? 'grayscale' : ''}`}
                    />
                 </>
             )}
          </div>
        </div>

        {/* --- RIGHT: INFO --- */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div>
             <div className="flex justify-between items-center mb-1">
                 {isLoading ? (
                     <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
                 ) : (
                     <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-1 text-yellow-400 hover:opacity-80 transition-opacity">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(parseFloat(averageRating as string)) ? 'fill-current' : 'text-gray-300'}`} />)}
                        <span className="text-gray-400 text-xs ml-2 font-medium underline decoration-dotted">({MOCK_REVIEWS.length} Bewertungen)</span>
                     </button>
                 )}
                 {isLoading ? <div className="h-4 w-20 bg-gray-200 rounded skeleton"></div> : <span className="text-gray-400 text-xs">SKU: {safeProduct.sku}</span>}
             </div>
             
             {isLoading ? (
                 <div className="h-10 w-3/4 bg-gray-200 rounded skeleton mb-3"></div>
             ) : (
                 <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-2 leading-tight">{safeProduct.title}</h1>
             )}

             <div className="flex items-baseline gap-3 mb-2">
               {isLoading ? (
                   <div className="h-8 w-24 bg-gray-200 rounded skeleton"></div>
               ) : (
                   <>
                    <span className={`text-3xl font-bold ${safeProduct.isOutOfStock ? 'text-gray-400' : 'text-[#333]'}`}>{formatPrice(currentPrice)}</span>
                    {safeProduct.salePrice && <span className="text-lg text-gray-400 line-through decoration-gray-400">{formatPrice(safeProduct.price)}</span>}
                    <span className="text-xs text-gray-500 font-normal">inkl. MwSt.</span>
                   </>
               )}
             </div>

             {/* --- BANNER (Songmics Style) --- */}
             {!isLoading && !safeProduct.isOutOfStock && (
                 <div className="w-full sm:w-auto inline-flex items-center gap-2.5 bg-[#FFF7EE] border border-[#F0E0D0] rounded-lg px-4 py-2.5 mt-1 mb-3 shadow-sm">
                     <Gift className="w-[18px] h-[18px] text-[#E87E24] flex-shrink-0" />
                     <div className="text-[13px] sm:text-[14px] leading-tight text-[#333]">
                         <span className="font-bold text-[#D24A43]">XMAS SALE</span> – Nur für Mitglieder: <span className="font-semibold">Exklusiver Bestpreis!</span>
                         <a href="#" className="block sm:inline sm:ml-2 text-[11px] font-bold text-[#0E4F34] underline hover:no-underline mt-0.5 sm:mt-0">
                            Jetzt kostenlos Mitglied werden
                         </a>
                     </div>
                 </div>
             )}
          </div>
          
          {/* --- STOCK (Moved closer) --- */}
          <div className="mb-4 mt-0">
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

          {/* Add To Cart & Quantity */}
          <div className="flex flex-col gap-4 w-full mt-1">
             {isLoading ? (
                <div className="h-14 w-full bg-gray-200 rounded-md skeleton"></div>
             ) : safeProduct.isOutOfStock ? (
               <button disabled className="bg-gray-200 text-gray-500 rounded-md px-6 py-4 font-semibold text-base w-full cursor-not-allowed flex items-center justify-center gap-2">
                 <Bell className="w-5 h-5" /> Benachrichtigen
               </button>
             ) : (
               <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full">
                 {/* Quantity Selector */}
                 <div className="flex items-center border border-gray-300 rounded-md h-[48px] w-full sm:w-auto min-w-[100px] justify-between">
                    <button onClick={decreaseQuantity} className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 rounded-l-md transition-colors"><Minus size={16} /></button>
                    <span className="flex-1 text-center font-semibold text-gray-700">{quantity}</span>
                    <button onClick={increaseQuantity} className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 rounded-r-md transition-colors"><Plus size={16} /></button>
                 </div>
                 
                 {/* Buttons */}
                 <div className="flex flex-1 gap-3 w-full">
                     <button onClick={handleAddToCart} className="flex-1 border border-[#2b4736] text-[#2b4736] bg-white hover:bg-gray-50 rounded-full px-4 h-[48px] font-semibold text-sm sm:text-base transition-all active:scale-[0.98] whitespace-nowrap">
                        In den Warenkorb
                     </button>
                     <button className="flex-1 bg-[#2b4736] text-white hover:bg-[#1f3528] rounded-full px-4 h-[48px] font-semibold text-sm sm:text-base transition-all active:scale-[0.98] shadow-sm hover:shadow-md whitespace-nowrap">
                        Jetzt Kaufen
                     </button>
                 </div>
               </div>
             )}
          </div>

          {/* COUPONS */}
          {!isLoading && !safeProduct.isOutOfStock && (
             <CouponBox coupons={coupons} />
          )}

          {/* Trust Badges - Redesigned (Songmics Style) - SCALED: Icons +10%, Gap +10%, Title +10% */}
          <div className="mt-6 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100">
             {[
                 { 
                   icon: Truck, 
                   title: "Kostenloser Versand", 
                   desc: "Versand innerhalb Deutschlands gratis. Versandkosten ins Ausland werden an der Kasse berechnet." 
                 },
                 { 
                   icon: Headset, 
                   title: "24/5 Support", 
                   desc: "Erstklassiger Kundenservice, der Ihnen von Montag bis Freitag zu Verfügung steht." 
                 },
                 { 
                   icon: Undo2, 
                   title: "30-Tage-Rückgaberecht", 
                   desc: "Problemlose Rückgabe und Umtausch innerhalb von 30 Tagen nach dem Kauf." 
                 },
                 { 
                   icon: ShieldCheck, 
                   title: "100% Zahlungssicherheit", 
                   desc: "Stressfrei einkaufen mit sicheren und vielseitigen Zahlungsmöglichkeiten." 
                 }
             ].map((usp, i) => (
                 <div key={i} className="p-3 sm:p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-shrink-0 text-[#2b4736] mt-0.5">
                        <usp.icon className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.2]" />
                    </div>
                    <div>
                        <h4 className="text-[14px] sm:text-[15px] font-bold text-[#222] mb-0.5">{usp.title}</h4>
                        <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed">{usp.desc}</p>
                    </div>
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
            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
                {isLoading ? (
                    <div className="space-y-4 max-w-2xl">
                        <div className="h-4 bg-gray-200 rounded skeleton w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded skeleton w-full"></div>
                        <div className="h-4 bg-gray-200 rounded skeleton w-5/6"></div>
                    </div>
                ) : (
                    <div className="text-[0.95rem] leading-[1.6] text-[#444]">
                        {safeProduct.description ? safeProduct.description.split('\n').map((line, idx) => {
                            const trimmed = line.trim();
                            if (!trimmed) return <br key={idx} />;
                            
                            // Simple heuristic: If line is short (< 60 chars) and mostly uppercase, treat as subheader
                            const isUppercase = trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
                            
                            if (isUppercase) {
                                return <h4 key={idx} className="font-bold text-[#1C1C1C] mt-6 first:mt-0 mb-2 text-[1rem] uppercase tracking-wide">{trimmed}</h4>;
                            }

                            return <p key={idx} className="mb-4 last:mb-0">{trimmed}</p>;
                        }) : (
                            <p>Keine Beschreibung verfügbar.</p>
                        )}
                    </div>
                )}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-8">
              {/* A) Review Summary & Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start pb-8 border-b border-gray-100">
                  <div className="flex flex-col gap-4">
                      <div className="flex items-baseline gap-4">
                          <span className="text-6xl font-extrabold text-[#333] leading-none">{averageRating}</span>
                          <div className="flex flex-col">
                             <div className="flex text-yellow-400 gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating as string)) ? "fill-current" : "text-gray-200"}`} />
                                ))}
                             </div>
                             <span className="text-sm text-gray-500 font-medium">{MOCK_REVIEWS.length} Bewertungen</span>
                          </div>
                      </div>
                      
                      {/* B) Write Review Button */}
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                        style={{ backgroundColor: MAMORU_GREEN }}
                      >
                         Bewertung schreiben
                      </button>
                  </div>

                  {/* Rating Bars */}
                  <div className="flex flex-col gap-2 w-full max-w-sm">
                      {[5, 4, 3, 2, 1].map((stars) => {
                          // @ts-ignore
                          const count = ratingDistribution[stars];
                          const percent = MOCK_REVIEWS.length > 0 ? (count / MOCK_REVIEWS.length) * 100 : 0;
                          return (
                              <div key={stars} className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center w-8 shrink-0 gap-1">
                                      <span className="font-bold text-[#333]">{stars}</span>
                                      <Star className="w-3 h-3 text-gray-300 fill-current" />
                                  </div>
                                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                                  </div>
                                  <span className="w-6 text-right text-gray-400 text-xs">{count}</span>
                              </div>
                          );
                      })}
                  </div>
              </div>

              {/* D) Reviews List (Cards) */}
              <div className="grid grid-cols-1 gap-5">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="bg-white border border-[#E2E2E2] rounded-[10px] p-6 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                      {/* Header Row: Name/Verified Left, Date Right */}
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                               <span className="text-[0.85rem] font-bold text-[#444]">{review.author}</span>
                               {review.verified && (
                                  <span className="inline-flex items-center text-[10px] uppercase font-bold text-[#2b4736] tracking-wider">
                                      <Check className="w-3 h-3 mr-1" strokeWidth={3} /> Verifizierter Kauf
                                  </span>
                               )}
                          </div>
                          <span className="text-[0.85rem] text-[#777]">{review.date}</span>
                      </div>
  
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                          ))}
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-[1.15rem] font-semibold text-[#222] mb-2 leading-tight flex items-center gap-2">
                          {review.title}
                      </h4>
                      
                      {/* Content */}
                      <p className="text-[0.95rem] text-[#444] leading-relaxed mb-4">
                          {review.content}
                      </p>

                      {/* Helpful Section */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                          <button className="flex items-center gap-1.5 hover:text-[#2b4736] transition-colors">
                              <ThumbsUp className="w-3.5 h-3.5" /> Hilfreich ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                              <ThumbsDown className="w-3.5 h-3.5" /> Nicht hilfreich ({review.notHelpful})
                          </button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'qa' && (
            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 lg:divide-x divide-gray-100">
                
                {/* Left Column (Q1 & Q2) */}
                <div className="lg:pr-8 space-y-8">
                  {/* Q1 */}
                  <div>
                    <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                      Q: Wie kann ich für meine Bestellung bezahlen?
                    </h4>
                    <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                      A: Derzeit akzeptieren wir Bezahlungen via PayPal, Kreditkarte und Vorkasse. Bei Zahlung per Vorkasse muss der Gesamtbetrag der Bestellung innerhalb von 10 Tagen auf unser Konto eingehen. Unsere Kontoinformationen erhalten Sie nach Aufgabe der Bestellung. Es können bis zu 3 Tage vergehen, bis wir den Eingang Ihre Überweisung nachprüfen können. Nach Erhalt Ihrer Zahlung versenden wir die Bestellung.
                    </p>
                  </div>

                  {/* Q2 */}
                  <div>
                    <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                      Q: Wo kann ich die Aufbauanleitung zu dem von mir bestellten Produkt finden?
                    </h4>
                    <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                      A: Jedem Produkt, das vor dem Gebrauch zusammengebaut werden muss, liegt eine Anleitung bei. Sie können zudem unseren Kundenservice per E-Mail kontaktieren, um eine Anleitung zu erhalten.
                    </p>
                  </div>
                </div>

                {/* Right Column (Q3 & Q4) */}
                <div className="lg:pl-8 space-y-8 pt-8 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  {/* Q3 */}
                  <div>
                    <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                      Q: Wird eine Umsatzsteuer berechnet?
                    </h4>
                    <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                      A: Die Umsatzsteuer von 19% ist bereits im Preis der Produkte enthalten. Bitte kontaktieren Sie unseren Kundenservice per E-Mail oder telefonisch unter +49 (0) 123 456 789 (Mo. bis Fr. 10–17 Uhr) wenn Sie weitere Informationen benötigen.
                    </p>
                  </div>

                  {/* Q4 */}
                  <div>
                    <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                      Q: Wie kann ich meine Sendung verfolgen?
                    </h4>
                    <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                      A: Nach Bestellung wird Ihnen eine zunächst eine "Bestellbestätigung" zugeschickt. Später erhalten Sie zudem eine "Versandbestätigung", die alle notwendigen Tracking-Informationen enthält. Mit der Paket-Nr. können Sie den Paketstatus auf der Webseite der Zusteller-Firma nachverfolgen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 lg:divide-x-0 divide-y lg:divide-y-0 divide-gray-100">
                    {/* Left Column */}
                    <div className="lg:pr-8">
                        <h4 className="text-[1.1rem] font-semibold text-[#1C1C1C] mb-4">
                             Kostenloser Versand innerhalb Deutschlands
                        </h4>
                        <div className="text-[0.95rem] leading-[1.6] text-[#444] space-y-4">
                            <p>
                                Wir versenden Ihre Bestellung kostenlos innerhalb Deutschlands.
                            </p>
                            <p>
                                Sobald alle Artikel Ihrer Bestellung versandbereit sind, wird das Paket verschickt.
                                <br />
                                <span className="font-medium text-[#222]">Versanddauer:</span> In der Regel 2–4 Werktage.
                            </p>
                            <p>
                                Weitere Details finden Sie auf unserer Seite{' '}
                                <Link to="/versand" className="text-[#0E4F34] hover:underline font-medium">
                                    „Versand- und Lieferinformationen“
                                </Link>.
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="pt-8 lg:pt-0 lg:pl-8">
                        <h4 className="text-[1.1rem] font-semibold text-[#1C1C1C] mb-4">
                             Rückgabe innerhalb von 30 Tagen
                        </h4>
                        <div className="text-[0.95rem] leading-[1.6] text-[#444] space-y-4">
                            <p>
                                Sie können Ihre Bestellung innerhalb von 30 Tagen ohne Angabe von Gründen zurückgeben.
                            </p>
                            <p>
                                Kontaktieren Sie uns, wenn Ihre Sendung beschädigt ankommt oder Teile fehlen – wir lösen das Problem schnell und unkompliziert.
                            </p>
                            <p>
                                Die vollständigen Bedingungen finden Sie auf unserer Seite{' '}
                                <Link to="/rueckgabe" className="text-[#0E4F34] hover:underline font-medium">
                                    „Rückgabe- und Umtauschrichtlinien“
                                </Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RECOMMENDATIONS SLIDER --- */}
      {recommendations.length > 0 && (
          <div className="mt-16 mb-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-[#2b4736] tracking-tight">
                      Das könnte Ihnen auch gefallen
                  </h2>
                  <div className="flex gap-2">
                      <button 
                          onClick={() => scrollRecommendations('left')}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#2b4736] hover:text-[#2b4736] text-gray-500 flex items-center justify-center transition-all active:scale-95"
                          aria-label="Vorherige Produkte"
                      >
                          <ChevronLeft className="w-5 h-5 stroke-[2]" />
                      </button>
                      <button 
                          onClick={() => scrollRecommendations('right')}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#2b4736] hover:text-[#2b4736] text-gray-500 flex items-center justify-center transition-all active:scale-95"
                          aria-label="Nächste Produkte"
                      >
                          <ChevronRight className="w-5 h-5 stroke-[2]" />
                      </button>
                  </div>
              </div>
              
              {/* Slider Container */}
              <div 
                  ref={recommendationsRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth"
              >
                  {recommendations.map((product) => (
                      /* 
                         Desktop: 5 items -> gap is 1.5rem (24px). 4 gaps = 96px total gap. 
                         Width = calc((100% - 96px) / 5) = approx 20% minus spacing.
                         Using flex-shrink-0 and precise width calc for perfect 5-up alignment.
                      */
                      <div 
                        key={product.id} 
                        className="flex-shrink-0 snap-start w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc((100%-96px)/5)]"
                      >
                          <ProductCard product={product} />
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
    
    {/* Newsletter Section - Placed outside the max-w container to allow full width background, consistent with HomePage */}
    <NewsletterSection />

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

    {/* C) REVIEW MODAL */}
    {isReviewModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-[550px] rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#222]">Bewertung abgeben</h2>
                    <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                        {/* Rating */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#444]">Ihre Bewertung <span className="text-red-500">*</span></label>
                            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                        onMouseEnter={() => setHoverRating(star)}
                                        className="focus:outline-none transition-transform active:scale-90"
                                    >
                                        <Star 
                                            className={`w-8 h-8 ${star <= (hoverRating || reviewForm.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-100'}`} 
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="flex flex-col gap-2">
                             <label htmlFor="review-content" className="text-sm font-bold text-[#444]">Ihre Erfahrung <span className="text-red-500">*</span></label>
                             <textarea 
                                id="review-content"
                                rows={5}
                                required
                                value={reviewForm.content}
                                onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                                className="w-full p-4 rounded-[8px] border border-[#DADADA] focus:border-[#0E4F34] focus:ring-1 focus:ring-[#0E4F34] outline-none transition-all text-sm resize-none placeholder-gray-400"
                                placeholder="Teilen Sie Ihre Gedanken zum Produkt..."
                             />
                        </div>

                        {/* Name & Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="review-name" className="text-sm font-bold text-[#444]">Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    id="review-name"
                                    required
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-[8px] border border-[#DADADA] focus:border-[#0E4F34] focus:ring-1 focus:ring-[#0E4F34] outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="review-email" className="text-sm font-bold text-[#444]">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email"
                                    id="review-email"
                                    required
                                    value={reviewForm.email}
                                    onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                                    className="w-full px-4 py-3 rounded-[8px] border border-[#DADADA] focus:border-[#0E4F34] focus:ring-1 focus:ring-[#0E4F34] outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-start gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="save-info" 
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0E4F34] focus:ring-[#0E4F34] cursor-pointer" 
                            />
                            <label htmlFor="save-info" className="text-xs text-gray-500 cursor-pointer select-none leading-relaxed">
                                Meinen Namen, E-Mail und Website in diesem Browser speichern, bis ich wieder kommentiere.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full py-4 rounded-[8px] text-white font-bold text-base uppercase tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] mt-2"
                            style={{ backgroundColor: MAMORU_ORANGE }}
                        >
                            Bewertung absenden
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )}
    </>
  );
};
