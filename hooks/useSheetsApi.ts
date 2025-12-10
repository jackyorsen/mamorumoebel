
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { getSlug } from '../utils/categoryHelper';

const API_BASE = "https://script.google.com/macros/s/AKfycbzinjacRgHSovguDr80D0EA2qLuQRBlvkAK29As_K8bBJ1OWQtCRbogjEebAft2kFs/exec";

export interface SheetProduct {
  sku: string;
  name: string;
  description: string;
  category: string;
  ek: number;
  ekPrev: number;
  price: number;
  pricePrev: number;
  stock: number;
  images: string[];
}

const mapSheetProductToAppProduct = (sp: SheetProduct): Product => {
  // Ensure numerical values are parsed correctly and not null/undefined
  const price = typeof sp.price === 'number' ? sp.price : (parseFloat(String(sp.price)) || 0);
  const pricePrev = typeof sp.pricePrev === 'number' ? sp.pricePrev : (parseFloat(String(sp.pricePrev)) || 0);
  const stock = typeof sp.stock === 'number' ? sp.stock : (parseFloat(String(sp.stock)) || 0);
  
  // Determine if there is a sale (if previous price > current price)
  const isSale = pricePrev > price;

  return {
    id: sp.sku,
    title: sp.name,
    description: sp.description,
    category: sp.category,
    // If sale: price (display) is pricePrev (strikethrough), salePrice is price.
    // If no sale: price (display) is price.
    price: isSale ? pricePrev : price,
    salePrice: isSale ? price : undefined,
    image: sp.images && sp.images.length > 0 ? sp.images[0] : 'https://via.placeholder.com/800x800?text=No+Image',
    slug: sp.sku, // using SKU as slug for routing
    isNew: false, // API doesn't provide date, default to false
    sku: sp.sku,
    stock: stock,
    images: sp.images || [],
    isOutOfStock: stock <= 0
  };
};

export function useProductsFromSheets() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}?action=products`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data: SheetProduct[] = await response.json();
        const mapped = data.map(mapSheetProductToAppProduct);
        setProducts(mapped);
      } catch (err) {
        console.warn("Failed to fetch products, using fallback data:", err);
        // Fallback to MOCK_PRODUCTS if API fails
        setProducts(MOCK_PRODUCTS);
        // We do not set error state here to allow the UI to render with mock data
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useProductFromSheets(sku: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!sku) {
        setLoading(false);
        return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}?action=product&sku=${encodeURIComponent(sku)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
           throw new Error(`API Error: ${response.statusText}`);
        }

        const data: SheetProduct = await response.json();
        
        // API returns a single object structure
        if (data && data.sku) {
             setProduct(mapSheetProductToAppProduct(data));
        } else {
             throw new Error("Product not found in API");
        }

      } catch (err) {
        console.warn("Failed to fetch product, using fallback data:", err);
        
        // Fallback Logic: Find in MOCK_PRODUCTS
        // Check by SKU or Slug (since navigation might use slug)
        const found = MOCK_PRODUCTS.find(p => p.sku === sku || p.slug === sku || p.id === sku);
        
        if (found) {
            setProduct(found);
        } else {
            setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  return { product, loading, error };
}
