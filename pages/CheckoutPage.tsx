
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  Banknote,
  ChevronDown,
  ChevronUp,
  Lock,
  ShoppingBag
} from 'lucide-react';

// --- UI Components ---

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full py-[10px] px-[12px] rounded-[6px] border border-[#d2d6da] focus:border-[#1f3a34] focus:ring-0 outline-none transition-colors text-[14px] bg-white placeholder-[#9da3af] text-[#333] shadow-sm ${props.className || ''}`}
  />
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full py-[10px] px-[12px] pr-10 rounded-[6px] border border-[#d2d6da] focus:border-[#1f3a34] focus:ring-0 outline-none transition-colors text-[14px] bg-white appearance-none text-[#333] shadow-sm ${props.className || ''}`}
    >
      {props.children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[18px] font-semibold text-[#1f3a34] mt-4 mb-3">{children}</h2>
);

// --- Payment Tab Component ---

interface PaymentTabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const PaymentTab: React.FC<PaymentTabProps> = ({ id, label, icon, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-[10px] px-4 rounded-[6px] border transition-all duration-200 w-full sm:w-auto flex-1 ${
      isSelected
        ? 'bg-[#1f3a34] text-white border-[#1f3a34] shadow-md'
        : 'bg-white text-[#1f3a34] border-[#d2d6da] hover:border-[#1f3a34]'
    }`}
  >
    {icon}
    <span className="font-semibold text-xs sm:text-sm">{label}</span>
  </button>
);

// --- Main Page ---

export const CheckoutPage: React.FC = () => {
  const { items, cartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isOrderSummaryOpenMobile, setIsOrderSummaryOpenMobile] = useState(false);

  // Constants
  const shippingCost = 0;
  const total = cartTotal + shippingCost;

  return (
    <div className="bg-[#fafafa] min-h-screen font-sans text-[#333] pb-20">
      
      {/* Mobile Order Summary Toggle (Sticky Top) */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#fafafa] border-b border-[#e5e5e5] px-4 py-4 shadow-sm">
        <button 
          onClick={() => setIsOrderSummaryOpenMobile(!isOrderSummaryOpenMobile)}
          className="flex items-center justify-between w-full text-[#1f3a34] font-semibold"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> 
            {isOrderSummaryOpenMobile ? 'Bestellübersicht ausblenden' : 'Bestellübersicht anzeigen'}
            {isOrderSummaryOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          <span className="text-lg">{total.toFixed(2)} €</span>
        </button>
      </div>

      {/* Mobile Order Summary Content */}
      {isOrderSummaryOpenMobile && (
        <div className="lg:hidden bg-[#fafafa] px-4 py-6 border-b border-[#e5e5e5] animate-in slide-in-from-top-2">
           <OrderSummary items={items} subtotal={cartTotal} shipping={shippingCost} total={total} />
        </div>
      )}

      {/* Main Layout: Flex Container, Max 1100px, Gap 32px (gap-8) */}
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-8 items-start p-4 md:p-6 lg:pt-10">
        
        {/* LEFT COLUMN: Checkout Form - 58% width on desktop, shrinks to fit gap */}
        <div className="w-full lg:basis-[58%] lg:max-w-[58%] flex-shrink">
            
            {/* Inner Content: Max 480px and Centered (Compressed) */}
            <div className="w-full max-w-[480px] mx-auto space-y-3">
            
                {/* Header / Brand */}
                <div className="flex items-center justify-between mb-2">
                    <Link to="/" className="text-2xl font-bold tracking-[0.15em] uppercase text-[#1f3a34]">MAMORU</Link>
                    <Link to="/cart" className="text-[#1f3a34] hover:underline text-sm font-medium">Zurück zum Warenkorb</Link>
                </div>

                {/* Express Checkout */}
                <div className="mb-6">
                    <div className="text-xs font-semibold text-[#555] mb-2 text-center uppercase tracking-wider">Express Checkout</div>
                    <div className="grid grid-cols-3 gap-2">
                    <button className="bg-[#5a31f4] hover:bg-[#4825c9] text-white py-[10px] rounded-[6px] flex items-center justify-center font-bold text-sm transition-colors shadow-sm">
                        Shop Pay
                    </button>
                    <button className="bg-[#fbcc14] hover:bg-[#f2c200] text-[#333] py-[10px] rounded-[6px] flex items-center justify-center font-bold text-sm transition-colors shadow-sm">
                        PayPal
                    </button>
                    <button className="bg-black hover:bg-gray-800 text-white py-[10px] rounded-[6px] flex items-center justify-center font-bold text-sm transition-colors shadow-sm">
                        GPay
                    </button>
                    </div>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-[#e5e5e5]"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-[11px] font-semibold uppercase">Oder</span>
                    <div className="flex-grow border-t border-[#e5e5e5]"></div>
                </div>

                {/* Kontakt */}
                <section>
                    <SectionTitle>Kontakt</SectionTitle>
                    <div className="space-y-3">
                        <div>
                        <InputField id="email" type="email" placeholder="E-Mail" />
                        </div>
                        <div className="flex items-center gap-2 ml-1">
                        <input type="checkbox" id="newsletter" className="w-4 h-4 rounded border-gray-300 text-[#1f3a34] focus:ring-[#1f3a34] cursor-pointer" />
                        <label htmlFor="newsletter" className="text-sm text-gray-600 cursor-pointer select-none">Ich möchte Neuigkeiten und Angebote per E-Mail erhalten.</label>
                        </div>
                    </div>
                </section>

                {/* Lieferadresse */}
                <section>
                    <SectionTitle>Lieferadresse</SectionTitle>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <InputField placeholder="Vorname" />
                        </div>
                        <div>
                            <InputField placeholder="Nachname" />
                        </div>
                        </div>
                        <div>
                        <SelectField defaultValue="Deutschland">
                            <option value="Deutschland">Deutschland</option>
                            <option value="Österreich">Österreich</option>
                            <option value="Schweiz">Schweiz</option>
                        </SelectField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
                        <div>
                            <InputField placeholder="Straße und Hausnummer" />
                        </div>
                        <div>
                            <InputField placeholder="Adresszusatz" />
                        </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
                        <div>
                            <InputField placeholder="PLZ" />
                        </div>
                        <div>
                            <InputField placeholder="Stadt" />
                        </div>
                        </div>
                        <div>
                            <InputField placeholder="Telefon" />
                        </div>
                    </div>
                </section>

                {/* Versandart */}
                <section>
                    <SectionTitle>Versandart</SectionTitle>
                    <div className="border border-[#d2d6da] rounded-[6px] overflow-hidden bg-white shadow-sm">
                        <label className="flex items-center justify-between p-3 cursor-pointer border-b border-[#e5e5e5] hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" className="w-4 h-4 text-[#1f3a34] border-gray-300 focus:ring-[#1f3a34]" defaultChecked />
                            <span className="text-[14px] font-medium text-[#333]">Standardversand</span>
                        </div>
                        <span className="font-bold text-[#1f3a34] text-sm">Kostenlos</span>
                        </label>
                        <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" className="w-4 h-4 text-[#1f3a34] border-gray-300 focus:ring-[#1f3a34]" />
                            <span className="text-[14px] font-medium text-[#333]">Express (DHL)</span>
                        </div>
                        <span className="font-bold text-[#333] text-sm">4,90 €</span>
                        </label>
                    </div>
                </section>

                {/* Zahlung */}
                <section>
                    <SectionTitle>Zahlung</SectionTitle>
                    <p className="text-xs text-gray-500 mb-3">Alle Transaktionen sind sicher und verschlüsselt.</p>
                    
                    <div className="bg-white border border-[#d2d6da] rounded-[6px] p-2 shadow-sm">
                        <div className="flex flex-wrap gap-2 mb-3">
                        <PaymentTab 
                            id="card" 
                            label="Kreditkarte" 
                            icon={<CreditCard className="w-4 h-4" />} 
                            isSelected={paymentMethod === 'card'} 
                            onClick={() => setPaymentMethod('card')} 
                        />
                        <PaymentTab 
                            id="paypal" 
                            label="PayPal" 
                            icon={<Smartphone className="w-4 h-4" />} 
                            isSelected={paymentMethod === 'paypal'} 
                            onClick={() => setPaymentMethod('paypal')} 
                        />
                        <PaymentTab 
                            id="klarna" 
                            label="Klarna" 
                            icon={<Banknote className="w-4 h-4" />} 
                            isSelected={paymentMethod === 'klarna'} 
                            onClick={() => setPaymentMethod('klarna')} 
                        />
                        <PaymentTab 
                            id="bank" 
                            label="Überweisung" 
                            icon={<Landmark className="w-4 h-4" />} 
                            isSelected={paymentMethod === 'bank'} 
                            onClick={() => setPaymentMethod('bank')} 
                        />
                        </div>

                        <div className="px-2 pb-2">
                        {paymentMethod === 'card' && (
                            <div className="animate-in fade-in">
                            <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-[6px] p-4 flex items-center justify-center h-40">
                                {/* Simulated Stripe Element Container */}
                                <div className="text-center text-gray-500">
                                    <Lock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Sichere Kreditkarteneingabe via Stripe</p>
                                </div>
                            </div>
                            </div>
                        )}

                        {paymentMethod === 'paypal' && (
                            <div className="text-center py-6 bg-[#f9f9f9] rounded-[6px] border border-[#e5e5e5] animate-in fade-in">
                                <ShoppingBag className="w-8 h-8 mx-auto text-[#003087] mb-2" />
                                <p className="text-xs text-gray-600 w-3/4 mx-auto">
                                Sie werden nach dem Klick auf "Jetzt kaufen" zu PayPal weitergeleitet.
                                </p>
                            </div>
                        )}

                        {paymentMethod === 'klarna' && (
                            <div className="text-center py-6 bg-[#f9f9f9] rounded-[6px] border border-[#e5e5e5] animate-in fade-in">
                                <p className="font-bold text-[#ffb3c7] text-lg mb-1">Klarna.</p>
                                <p className="text-xs text-gray-600">Kauf auf Rechnung.</p>
                            </div>
                        )}
                        </div>
                    </div>
                </section>

                {/* CTA Button */}
                <button className="w-full bg-[#1f3a34] text-white font-bold text-[16px] py-4 rounded-[30px] hover:bg-[#25443c] transition-all transform active:scale-[0.99] shadow-lg hover:shadow-xl mt-6">
                    JETZT KAUFEN
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN: Order Summary (Desktop Sticky) - 42% width on desktop */}
        <div className="hidden lg:block sticky top-8 w-full lg:basis-[42%] lg:max-w-[42%] flex-shrink">
           <div className="bg-white p-5 rounded-[8px] border border-[#f0f0f0] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.05)]">
              <OrderSummary items={items} subtotal={cartTotal} shipping={shippingCost} total={total} />
           </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Component: Order Summary ---

const OrderSummary: React.FC<{ items: any[]; subtotal: number; shipping: number; total: number }> = ({ items, subtotal, shipping, total }) => {
  return (
    <div className="space-y-5">
       <h3 className="text-[16px] font-semibold text-[#333] border-b border-[#f0f0f0] pb-3 mb-3">Bestellübersicht</h3>
       
       <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
          {items.map((item) => (
             <div key={item.id} className="flex gap-3 items-start">
                <div className="relative w-14 h-14 bg-gray-50 rounded-[6px] border border-gray-100 flex-shrink-0">
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-[6px]" />
                   <span className="absolute -top-2 -right-2 bg-[#737373] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                   </span>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[13px] font-medium text-[#333] leading-snug line-clamp-2">{item.title}</p>
                   <p className="text-[11px] text-gray-500 mt-0.5">{item.category}</p>
                </div>
                <div className="text-[13px] font-medium text-[#333] whitespace-nowrap">
                   {( (item.salePrice || item.price) * item.quantity ).toFixed(2)} €
                </div>
             </div>
          ))}
       </div>

       <div className="h-px bg-[#e5e5e5]"></div>

       <div className="flex gap-2">
          <input 
             type="text" 
             placeholder="Rabattcode" 
             className="flex-1 px-3 py-[10px] rounded-[6px] border border-[#d2d6da] focus:border-[#1f3a34] focus:ring-0 outline-none bg-white text-sm placeholder-[#9da3af]"
          />
          <button className="bg-[#e5e5e5] text-[#333] hover:bg-[#d6d6d6] font-semibold px-3 rounded-[6px] transition-colors text-sm">
             Anwenden
          </button>
       </div>

       <div className="h-px bg-[#e5e5e5]"></div>

       <div className="space-y-2 text-[13px] text-gray-600">
          <div className="flex justify-between">
             <span>Zwischensumme</span>
             <span className="font-medium text-[#333]">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
             <span>Versand</span>
             <span className="font-medium text-[#333]">{shipping === 0 ? 'Kostenlos' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between">
             <span>MwSt. (19%)</span>
             <span className="font-medium text-[#333]">{(subtotal * 0.19).toFixed(2)} €</span>
          </div>
       </div>

       <div className="h-px bg-[#e5e5e5]"></div>

       <div className="flex justify-between items-center">
          <span className="text-base font-bold text-[#333]">Gesamt</span>
          <div className="text-right">
             <span className="text-xl font-bold text-[#1f3a34] block">{total.toFixed(2)} €</span>
             <span className="text-[10px] text-gray-400">inkl. MwSt.</span>
          </div>
       </div>
    </div>
  );
};
