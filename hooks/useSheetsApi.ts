
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const API_BASE = "https://script.google.com/macros/s/AKfycbzinjacRgHSovguDr80D0EA2qLuQRBlvkAK29As_K8bBJ1OWQtCRbogjEebAft2kFs/exec";

// --- CLIENT SIDE CACHE ---
// Stores data in memory to make navigation instant
const CACHE: {
  products: Product[] | null;
  timestamp: number;
} = {
  products: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

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
  const price = typeof sp.price === 'number' ? sp.price : (parseFloat(String(sp.price)) || 0);
  const pricePrev = typeof sp.pricePrev === 'number' ? sp.pricePrev : (parseFloat(String(sp.pricePrev)) || 0);
  const stock = typeof sp.stock === 'number' ? sp.stock : (parseFloat(String(sp.stock)) || 0);
  const isSale = pricePrev > price;

  return {
    id: sp.sku,
    title: sp.name,
    description: sp.description,
    category: sp.category,
    price: isSale ? pricePrev : price,
    salePrice: isSale ? price : undefined,
    image: sp.images && sp.images.length > 0 ? sp.images[0] : 'https://via.placeholder.com/800x800?text=No+Image',
    slug: sp.sku,
    isNew: false,
    sku: sp.sku,
    stock: stock,
    images: sp.images || [],
    isOutOfStock: stock <= 0
  };
};

// PREFETCH FUNCTION (Call this on hover)
export const prefetchProducts = async () => {
  if (CACHE.products && (Date.now() - CACHE.timestamp < CACHE_DURATION)) {
    return; // Already valid
  }
  try {
     const response = await fetch(`${API_BASE}?action=products`);
     if (response.ok) {
        const data: SheetProduct[] = await response.json();
        CACHE.products = data.map(mapSheetProductToAppProduct);
        CACHE.timestamp = Date.now();
     }
  } catch (e) {
     // Silent fail on prefetch
  }
};

export function useProductsFromSheets() {
  const [products, setProducts] = useState<Product[]>(CACHE.products || []);
  const [loading, setLoading] = useState<boolean>(!CACHE.products);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // If we have cached data, we are done immediately
    if (CACHE.products && (Date.now() - CACHE.timestamp < CACHE_DURATION)) {
       setProducts(CACHE.products);
       setLoading(false);
       return;
    }

    const fetchProducts = async () => {
      // If we don't have data, show loading... but we might want to show MOCK data as Skeleton backdrop?
      // For now, standard flow.
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}?action=products`, {
          cache: "default", // Use browser HTTP cache if available
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data: SheetProduct[] = await response.json();
        const mapped = data.map(mapSheetProductToAppProduct);
        
        // Update Cache
        CACHE.products = mapped;
        CACHE.timestamp = Date.now();
        
        setProducts(mapped);
      } catch (err) {
        console.warn("Failed to fetch products, using fallback data:", err);
        setProducts(MOCK_PRODUCTS);
        // Fill cache with mock so we don't retry endlessly
        CACHE.products = MOCK_PRODUCTS; 
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useProductFromSheets(sku: string | undefined) {
  // Try to find in cache first (INSTANT LOAD)
  const cachedProduct = CACHE.products?.find(p => p.sku === sku || p.slug === sku || p.id === sku);
  
  const [product, setProduct] = useState<Product | null>(cachedProduct || null);
  const [loading, setLoading] = useState<boolean>(!cachedProduct);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!sku) {
        setLoading(false);
        return;
    }

    // If we found it in cache, we still might want to re-validate in background, 
    // but for "Instant Render", we rely on cache.
    if (cachedProduct) {
        setLoading(false);
        return; 
    }

    // Fallback: Fetch specific if global cache missed
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}?action=product&sku=${encodeURIComponent(sku)}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data: SheetProduct = await response.json();
        
        if (data && data.sku) {
             setProduct(mapSheetProductToAppProduct(data));
        } else {
             throw new Error("Product not found");
        }
      } catch (err) {
        // Fallback Logic
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
  }, [sku, cachedProduct]);

  return { product, loading, error };
}
