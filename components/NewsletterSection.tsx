
import React from 'react';
import { Link } from 'react-router-dom';

export const NewsletterSection: React.FC = () => {
  return (
    <section className="bg-white py-12 md:py-16 border-t border-gray-100 w-full mt-auto">
      <div className="max-w-[700px] mx-auto px-4 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[#333] uppercase tracking-wide">
          BLEIBEN SIE AUF DEM LAUFENDEN
        </h3>
        <p className="text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto">
          Abonnieren Sie unseren Newsletter, um über exklusive Angebote und neue Produkte informiert zu werden.
        </p>

        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto mb-4">
            <input
              type="email"
              placeholder="Ihre E-Mail Adresse"
              className="flex-1 bg-white border border-gray-300 rounded-l-md sm:rounded-r-none rounded-r-md px-4 py-3.5 text-sm focus:outline-none focus:border-[#333] focus:ring-1 focus:ring-[#333] transition-all mb-3 sm:mb-0"
              required
            />
            <button
              type="submit"
              className="bg-[#222] text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-l-none rounded-r-md hover:bg-[#444] transition-colors whitespace-nowrap hidden sm:block"
            >
              Abonnieren
            </button>
            <button
              type="submit"
              className="bg-[#222] text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-md hover:bg-[#444] transition-colors whitespace-nowrap sm:hidden w-full"
            >
              Abonnieren
            </button>
          </div>

          <div className="flex items-start justify-center gap-2 text-left max-w-lg mx-auto px-1">
            <input
              type="checkbox"
              id="newsletter-privacy"
              required
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#2b4736] focus:ring-[#2b4736] cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor="newsletter-privacy"
              className="text-[11px] text-gray-400 cursor-pointer select-none leading-snug"
            >
              Ich möchte den Newsletter abonnieren und stimme zu, dass meine E-Mail-Adresse verarbeitet wird. Ich kann mich jederzeit wieder abmelden. Es gelten unsere{" "}
              <Link to="#" className="underline hover:text-[#333]">
                Datenschutzbestimmungen
              </Link>
              .
            </label>
          </div>
        </form>
      </div>
    </section>
  );
};
