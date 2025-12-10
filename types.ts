
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number; // Optionaler Angebotspreis
  image: string;
  category: string;
  slug: string;
  isNew?: boolean; // Optionales Flag für neue Produkte
  // Added fields for Sheets API
  sku?: string;
  stock?: number;
  images?: string[];
  isOutOfStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ThemeColors = {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  surface: string;
};