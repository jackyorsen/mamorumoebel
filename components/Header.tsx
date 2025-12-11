
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, HelpCircle, ChevronDown, Heart, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { getCategoriesByMainGroup, MAIN_GROUPS, getSlug } from '../utils/categoryHelper';
import { MegaMenu } from './MegaMenu';
import { OptimizedImage } from './OptimizedImage';

export const Header: React.FC = () => {
  const { cartCount, openCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuHovered, setIsMegaMenuHovered] = useState(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>(null);
  
  // Search Autocomplete State
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  
  const { products } = useProductsFromSheets();
  
  const menuStructure = useMemo(() => {
    return getCategoriesByMainGroup(products);
  }, [products]);

  // Filter products for autocomplete
  const suggestions = useMemo(() => {
    if (searchTerm.length < 3 || !products) return [];
    
    const lowerTerm = searchTerm.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(lowerTerm) || 
      p.category.toLowerCase().includes(lowerTerm)
    ).slice(0, 5); // Limit to 5 results
  }, [searchTerm, products]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowSuggestions(false);
    // Optional: Keep search term or clear it? Clearing it is usually better UX after navigation
    // setSearchTerm(''); 
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleMouseEnter = () => setIsMegaMenuHovered(true);
  const handleMouseLeave = () => setIsMegaMenuHovered(false);

  const toggleMobileGroup = (group: string) => {
    if (expandedMobileGroup === group) {
      setExpandedMobileGroup(null);
    } else {
      setExpandedMobileGroup(group);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 3);
  };

  const handleSuggestionClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        // Navigate to shop with search query (Assuming ShopPage handles query params or context)
        // For now, we just go to shop page if no specific logic exists
        navigate('/shop'); 
        setShowSuggestions(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#2b4736] text-white text-[12px] py-2 px-4 hidden md:block transition-colors">
        <div className="max-w-[1320px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="font-medium">Kostenloser Versand ab 100€</span>
            <span className="opacity-80">30 Tage Rückgaberecht</span>
          </div>
          <div className="flex items-center space-x-4">
             <Link to="/help" className="hover:text-gray-200 flex items-center transition-colors"><HelpCircle className="w-3.5 h-3.5 mr-1"/> Hilfe & Kontakt</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] font-sans">
        
        {/* UPPER ROW: Logo, Search, Icons */}
        <div className="border-b border-gray-100">
            <div className="max-w-[1320px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4 lg:gap-12">
            
                {/* Left: Mobile Burger & Logo */}
                <div className="flex items-center flex-shrink-0">
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-2 mr-2 text-gray-800 md:hidden hover:text-[#2b4736] transition-colors"
                        aria-label="Menü öffnen"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    <Link to="/" className="text-2xl font-bold tracking-[0.1em] text-[#333] uppercase">
                        MAMORU
                    </Link>
                </div>

                {/* Center: Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-3xl relative" ref={searchContainerRef}>
                    <form onSubmit={handleSearchSubmit} className="w-full relative">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                            placeholder="Suche nach Produkten" 
                            className="w-full h-[44px] bg-[#f5f5f5] text-gray-800 text-[14px] pl-11 pr-4 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#2b4736] focus:bg-white transition-all placeholder-gray-500"
                        />
                        <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2b4736]">
                           <Search className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-md shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                            {suggestions.length > 0 ? (
                                <ul>
                                    {suggestions.map((product) => (
                                        <li key={product.id} className="border-b border-gray-50 last:border-0">
                                            <button 
                                                onClick={() => handleSuggestionClick(product.slug)}
                                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                                                    <OptimizedImage 
                                                        src={product.image} 
                                                        alt={product.title} 
                                                        variant="small" 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#2b4736]">{product.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                                </div>
                                                <div className="text-sm font-bold text-[#2b4736] whitespace-nowrap">
                                                    {(product.salePrice ?? product.price).toFixed(2)} €
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                                            </button>
                                        </li>
                                    ))}
                                    <li>
                                        <button 
                                            onClick={handleSearchSubmit}
                                            className="w-full py-3 px-4 bg-gray-50 text-xs font-bold text-[#2b4736] uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Alle Ergebnisse anzeigen <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </li>
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    <p>Keine Produkte gefunden für "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-5 flex-shrink-0">
                    {/* Mobile Search Trigger */}
                    <button className="md:hidden p-2 text-gray-700">
                        <Search className="w-6 h-6" />
                    </button>

                    <Link to="/account" className="hidden md:flex p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex-col items-center justify-center">
                        <User className="w-6 h-6 stroke-[1.5]" />
                    </Link>

                    <Link to="/wishlist" className="hidden md:flex p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex-col items-center justify-center">
                        <Heart className="w-6 h-6 stroke-[1.5]" />
                    </Link>

                    <button 
                        onClick={openCart} 
                        className="p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex items-center gap-2 group"
                        aria-label="Warenkorb öffnen"
                    >
                        <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
                        <span className="font-medium text-base group-hover:text-[#2b4736] transition-colors">{cartCount}</span>
                    </button>
                </div>
            </div>
        </div>

        {/* LOWER ROW: Navigation Links (Desktop) */}
        <div className="hidden md:block bg-white">
            <div className="max-w-[1320px] mx-auto px-4">
                <nav className="flex items-center space-x-8 h-[52px]">
                    <Link to="/shop" className="text-[14px] font-bold text-[#333] hover:text-[#2b4736] transition-colors uppercase tracking-wide">Bestseller</Link>
                    <Link to="/shop" className="text-[14px] font-bold text-[#333] hover:text-[#2b4736] transition-colors uppercase tracking-wide">Neu</Link>
                    <Link to="/shop" className="text-[14px] font-bold text-[#d9534f] hover:text-[#b52b27] transition-colors uppercase tracking-wide">Deals</Link>
                    
                    {/* Mega Menu Trigger */}
                    <div 
                        className="h-full flex items-center"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Link
                            to="/shop"
                            className={`text-[14px] font-bold flex items-center h-full transition-colors relative z-10 uppercase tracking-wide ${isMegaMenuHovered ? 'text-[#2b4736]' : 'text-[#333] hover:text-[#2b4736]'}`}
                        >
                            Produkte
                            <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isMegaMenuHovered ? 'rotate-180' : ''}`} />
                        </Link>
                        {/* Mega Menu Overlay */}
                        <MegaMenu 
                            structure={menuStructure} 
                            isVisible={isMegaMenuHovered} 
                            onClose={() => setIsMegaMenuHovered(false)}
                        />
                    </div>

                    <Link to="/shop" className="text-[14px] font-bold text-[#333] hover:text-[#2b4736] transition-colors uppercase tracking-wide">Räume</Link>
                    <Link to="/shop" className="text-[14px] font-bold text-[#333] hover:text-[#2b4736] transition-colors uppercase tracking-wide">Style</Link>
                </nav>
            </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 backdrop-blur-sm md:hidden ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Off-Canvas Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[60] transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hidden flex flex-col shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-xl font-bold tracking-[0.1em] uppercase text-[#333]">MAMORU</span>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col">
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-50 border-b border-gray-50">Bestseller</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-50 border-b border-gray-50">Neu</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-[#d9534f] hover:bg-gray-50 border-b border-gray-50">Deals</Link>

            {/* Mobile Accordion for Main Groups */}
            {MAIN_GROUPS.map((group) => {
              const subCats = menuStructure[group];
              const hasSubCats = subCats && subCats.length > 0;
              const isExpanded = expandedMobileGroup === group;

              if (!hasSubCats) return null;

              return (
                <div key={group} className="border-b border-gray-50">
                  <button
                    onClick={() => toggleMobileGroup(group)}
                    className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#2b4736] transition-colors"
                  >
                    {group}
                    {isExpanded ? <Minus className="w-4 h-4 text-[#2b4736]" /> : <Plus className="w-4 h-4 text-gray-400" />}
                  </button>
                  
                  {/* Accordion Content */}
                  <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                    <ul className="flex flex-col py-2">
                       {subCats.map(cat => (
                         <li key={cat}>
                           <Link
                              to={`/kategorie/${getSlug(cat)}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-8 py-3 text-sm text-gray-600 hover:text-[#2b4736] border-l-2 border-transparent hover:border-[#2b4736] ml-6 transition-all"
                           >
                             {cat}
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            <Link
                to="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#2b4736] border-b border-gray-50 transition-colors"
            >
                Alle Artikel
            </Link>
          </nav>
          
          <div className="mt-8 px-6 pb-8 space-y-4">
            <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center text-gray-600 font-medium hover:text-[#2b4736]">
                <User className="w-5 h-5 mr-3" /> Mein Konto
            </Link>
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center text-gray-600 font-medium hover:text-[#2b4736]">
                <Heart className="w-5 h-5 mr-3" /> Wunschliste
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
