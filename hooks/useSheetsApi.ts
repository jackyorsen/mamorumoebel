
import { useState, useEffect } from 'react';
import { Product } from '../types';

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
  // Determine if there is a sale (if previous price > current price)
  // In this API: price is current, pricePrev is old.
  // If pricePrev > price, we treat price as salePrice and pricePrev as original price.
  const isSale = sp.pricePrev > sp.price;

  return {
    id: sp.sku,
    title: sp.name,
    description: sp.description,
    category: sp.category,
    // If sale: price (display) is pricePrev (strikethrough), salePrice is price.
    // If no sale: price (display) is price.
    price: isSale ? sp.pricePrev : sp.price,
    salePrice: isSale ? sp.price : undefined,
    image: sp.images && sp.images.length > 0 ? sp.images[0] : 'https://via.placeholder.com/800x800?text=No+Image',
    slug: sp.sku, // using SKU as slug for routing
    isNew: false, // API doesn't provide date, default to false
    sku: sp.sku,
    stock: sp.stock,
    images: sp.images || []
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
          // The prompt asked for Headers: { cache: "no-store" } but technically it belongs in options
          // We add it to options as per standard Fetch API
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data: SheetProduct[] = await response.json();
        const mapped = data.map(mapSheetProductToAppProduct);
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err);
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
             setError(new Error("Product not found or invalid format"));
        }

      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  return { product, loading, error };
}
