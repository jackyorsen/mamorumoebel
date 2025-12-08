import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2b4736] text-white pt-16 pb-8 mt-auto border-t border-[#1f3528]">
      <div className="max-w-[1320px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Column 1: Shop */}
        <div>
          <h4 className="text-lg font-bold mb-6 uppercase tracking-wider border-b border-[#3e614d] pb-2 inline-block">Shop</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Alle Produkte</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Wohnzimmer</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Schlafzimmer</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Küche & Esszimmer</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Dekoration</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block font-medium text-[#e0e0e0]">Sale Angebote</a></li>
          </ul>
        </div>

        {/* Column 2: Hilfe */}
        <div>
          <h4 className="text-lg font-bold mb-6 uppercase tracking-wider border-b border-[#3e614d] pb-2 inline-block">Hilfe</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Häufige Fragen (FAQ)</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Versand & Lieferung</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Rücksendung & Umtausch</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Zahlungsarten</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Größentabellen</a></li>
          </ul>
        </div>

        {/* Column 3: Informationen */}
        <div>
          <h4 className="text-lg font-bold mb-6 uppercase tracking-wider border-b border-[#3e614d] pb-2 inline-block">Informationen</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Über uns</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Karriere</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Datenschutz</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">AGB</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200 block">Impressum</a></li>
          </ul>
        </div>

        {/* Column 4: Kontakt */}
        <div>
          <h4 className="text-lg font-bold mb-6 uppercase tracking-wider border-b border-[#3e614d] pb-2 inline-block">Kontakt</h4>
          <div className="text-gray-300 text-sm leading-relaxed mb-6 space-y-2">
            <p>
              <strong className="text-white block mb-1">NordicGreen GmbH</strong>
              Musterstraße 123<br />
              10115 Berlin
            </p>
            <p>
              <a href="mailto:support@mamoru.de" className="hover:text-white transition-colors block">support@mamoru.de</a>
              <a href="tel:+49123456789" className="hover:text-white transition-colors block">+49 (0) 123 456 789</a>
            </p>
          </div>
          
          <div className="flex space-x-4">
             <a href="#" className="bg-[#1f3528] p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#3e614d] transition-all duration-300"><Facebook size={18} /></a>
             <a href="#" className="bg-[#1f3528] p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#3e614d] transition-all duration-300"><Instagram size={18} /></a>
             <a href="#" className="bg-[#1f3528] p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#3e614d] transition-all duration-300"><Twitter size={18} /></a>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="max-w-[1320px] mx-auto px-4 pt-8 border-t border-[#3e614d] flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} MAMORU Shop. Alle Rechte vorbehalten.
        </p>
        
        {/* Payment Icons */}
        <div className="flex items-center space-x-2 opacity-90">
            <div className="h-8 w-12 bg-white rounded flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-extrabold text-[#1a1f71] tracking-tighter">VISA</span>
            </div>
            <div className="h-8 w-12 bg-white rounded flex items-center justify-center shadow-sm">
                <div className="flex -space-x-1">
                    <div className="w-3 h-3 bg-[#eb001b] rounded-full opacity-80"></div>
                    <div className="w-3 h-3 bg-[#f79e1b] rounded-full opacity-80"></div>
                </div>
            </div>
            <div className="h-8 w-12 bg-white rounded flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-[#003087] italic">PayPal</span>
            </div>
            <div className="h-8 w-12 bg-white rounded flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-medium text-black">Pay</span>
            </div>
        </div>
      </div>
    </footer>
  );
};