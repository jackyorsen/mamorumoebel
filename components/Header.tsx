import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, Phone, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { cartCount, openCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll Lock für Mobile Menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  // Menüpunkte gemäß Anforderung
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Kategorien', path: '/shop' }, // Verlinkt vorerst auf Shop
    { name: 'Kontakt', path: '#' },        // Platzhalter
  ];

  const isActive = (path: string) => location.pathname === path && path !== '/shop';

  return (
    <>
      {/* Top Bar (Optional, Woodmart style often has this) */}
      <div className="bg-white border-b border-gray-100 text-gray-500 text-[12px] py-2 px-4 hidden md:block">
        <div className="max-w-[1320px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center hover:text-[#2b4736] cursor-pointer transition-colors">
              <Phone className="w-3 h-3 mr-2" /> +49 (0) 123 456 789
            </span>
            <span className="hidden lg:inline">Kostenloser Versand ab 100€</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center cursor-pointer hover:text-[#2b4736] transition-colors">
              Deutsch <ChevronDown className="w-3 h-3 ml-1" />
            </div>
            <span className="border-l border-gray-200 h-3"></span>
            <div className="flex items-center cursor-pointer hover:text-[#2b4736] transition-colors">
              EUR <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1320px] mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* ZONE 1 (Left): Logo (Desktop) / Burger (Mobile) */}
          <div className="flex-1 flex items-center justify-start">
            {/* Mobile Burger */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-gray-800 md:hidden hover:text-[#2b4736] transition-colors"
              aria-label="Menü öffnen"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Logo */}
            <Link to="/" className="hidden md:block text-2xl font-bold tracking-[0.15em] uppercase text-[#2b4736]">
              MAMORU
            </Link>
          </div>

          {/* ZONE 2 (Center): Menu (Desktop) / Logo (Mobile) */}
          <div className="flex-[2] flex justify-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className={`text-[13px] font-bold uppercase tracking-widest transition-colors py-2 relative group ${
                     isActive(link.path) ? 'text-[#2b4736]' : 'text-gray-600 hover:text-[#2b4736]'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-[#2b4736] transition-all duration-300 ${
                      isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Mobile Logo */}
            <Link to="/" className="md:hidden text-xl font-bold tracking-[0.15em] uppercase text-[#2b4736]">
              MAMORU
            </Link>
          </div>

          {/* ZONE 3 (Right): Icons */}
          <div className="flex-1 flex justify-end items-center gap-1 sm:gap-3">
            {/* Search Icon */}
            <button className="hidden md:flex p-2 text-gray-600 hover:text-[#2b4736] transition-transform hover:scale-105">
              <Search className="w-5 h-5" />
            </button>

            {/* User Icon */}
            <button className="hidden md:flex p-2 text-gray-600 hover:text-[#2b4736] transition-transform hover:scale-105">
              <User className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <button 
              onClick={openCart} 
              className="p-2 text-gray-800 hover:text-[#2b4736] transition-colors relative group"
              aria-label="Warenkorb öffnen"
            >
              <ShoppingBag className="w-5 h-5 md:w-[22px] md:h-[22px]" />
              <span className="absolute -top-1 -right-1 bg-[#2b4736] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white group-hover:bg-[#1f3528] transition-colors">
                {cartCount}
              </span>
            </button>
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <span className="text-lg font-bold tracking-[0.15em] uppercase text-[#2b4736]">MAMORU</span>
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
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#2b4736] border-b border-gray-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Utility Actions inside Drawer */}
          <div className="mt-8 px-6 space-y-6">
            <div className="flex items-center text-gray-600 font-medium cursor-pointer hover:text-[#2b4736]">
                <User className="w-5 h-5 mr-3" /> Mein Konto
            </div>
            <div className="flex items-center text-gray-600 font-medium cursor-pointer hover:text-[#2b4736]">
                <Search className="w-5 h-5 mr-3" /> Suche
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          <p className="mb-2 uppercase tracking-wide font-bold text-gray-400">Kundenservice</p>
          <a href="tel:0123456789" className="flex items-center text-base font-medium text-[#333]">
            <Phone className="w-4 h-4 mr-2" /> +49 (0) 123 456 789
          </a>
        </div>
      </div>
    </>
  );
};