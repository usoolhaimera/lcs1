import { useState, useEffect } from "react";
import type { Product } from "../types/Product";
import { removeDuplicates, shuffle } from "../utils";

interface UseProductsReturn {
  carouselProducts: Product[];
  recommendedProducts: Product[];
  recentlyViewedProducts: Product[];
  dealProducts: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<
    Product[]
  >([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8080/api/suggestions"); // Changed from /api/search
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !Array.isArray(data.suggestions)) { // Changed from data.laptops to data.suggestions
        throw new Error("Invalid data format received from server");
      }

      // Remove duplicates and ensure all products have proper multi-site data
      const laptops = removeDuplicates(data.suggestions); // Changed from data.laptops to data.suggestions

      // Shuffle the data to ensure different sections get varied content
      const shuffledLaptops = shuffle(laptops);

      // Divide into sections ensuring no overlap and good distribution
      const carouselData = shuffledLaptops.slice(0, 8);
      const recommendedData = shuffledLaptops.slice(8, 24);
      const recentlyViewedData = shuffledLaptops.slice(24, 32);
      const dealData = shuffledLaptops.slice(32, 48);

      setCarouselProducts(carouselData);
      setRecommendedProducts(recommendedData);
      setRecentlyViewedProducts(recentlyViewedData);
      setDealProducts(dealData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    carouselProducts,
    recommendedProducts,
    recentlyViewedProducts,
    dealProducts,
    loading,
    error,
    refetch: fetchProducts,
  };
};
