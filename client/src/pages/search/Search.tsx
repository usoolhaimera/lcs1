import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "../../components";

interface SuggestionItem {
  id: string;
  title: string;
  brand: string;
  series: string;
  processor: string;
  ram: string;
  storage: string;
  price: number;
  image: string;
}

interface Laptop {
  _id: string;
  brand: string;
  series: string;
  specs: {
    head: string;
    brand: string;
    series: string;
    processor: {
      name: string;
      gen: string;
      variant: string;
    };
    ram: {
      size: string;
      type: string;
    };
    storage: {
      size: string;
      type: string;
    };
    details: {
      imageLinks: string[];
    };
    displayInch: number;
    gpu: string;
    basePrice: number;
    ratingCount: string;
  };
  sites: Array<{
    source: string;
    price: number;
    link: string;
    rating: number;
    ratingCount: string;
    basePrice: number;
  }>;
  allTimeLowPrice: number;
}

interface SearchResponse {
  success: boolean;
  laptops: Laptop[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Filters {
  brands: string[];
  processors: string[];
  rams: string[];
  screenSizes: string[];
  cpuTypes: string[];
  customerReview: string;
  priceRange: string;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    processors: [],
    rams: [],
    screenSizes: [],
    cpuTypes: [],
    customerReview: "",
    priceRange: "",  });

  // Check if any filters are applied
  const hasFiltersApplied = (filters: Filters) => {
    return (
      filters.brands.length > 0 ||
      filters.processors.length > 0 ||
      filters.rams.length > 0 ||
      filters.screenSizes.length > 0 ||
      filters.cpuTypes.length > 0 ||
      filters.customerReview !== "" ||
      filters.priceRange !== ""
    );
  };
  // Fetch search results using suggestions API (for direct searches without filters)
  const fetchSuggestionsResults = useCallback(async (query: string) => {
    setLoading(true);      try {
      const response = await fetch(
        `http://localhost:8080/api/suggestions?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      console.log("Suggestions API Response:", data); // Debug log

      if (data.success && Array.isArray(data.suggestions)) {
        // Transform suggestions API response to match our Laptop interface
        const transformedLaptops: Laptop[] = data.suggestions.map((item: SuggestionItem) => ({
          _id: item.id,
          brand: item.brand || "Unknown Brand",
          series: item.series || "Unknown Series",
          specs: {
            head: item.title || "Unknown Model",
            brand: item.brand || "Unknown Brand",
            series: item.series || "Unknown Series",
            processor: {
              name: item.processor?.split(' ')[0] || "Unknown",
              gen: item.processor?.match(/(\d+)th Gen/)?.[1] || "",
              variant: item.processor?.split(' ').slice(1).join(' ') || ""
            },
            ram: {
              size: item.ram?.match(/(\d+)GB/)?.[1] || "0",
              type: item.ram?.match(/DDR\d+/i)?.[0] || "Unknown"
            },
            storage: {
              size: item.storage?.match(/(\d+)GB/)?.[1] || "0",
              type: item.storage?.match(/(SSD|HDD|EMMC)/i)?.[0] || "Unknown"
            },
            details: {
              imageLinks: item.image ? [item.image] : []
            },
            displayInch: 15.6, // Default value since suggestions API doesn't provide this
            gpu: "Unknown",
            basePrice: item.price || 0,
            ratingCount: "0"
          },
          sites: item.price ? [{
            source: "amazon",
            price: item.price,
            link: "",
            rating: 0,
            ratingCount: "0",
            basePrice: item.price
          }] : [],
          allTimeLowPrice: item.price || 0
        }));

        setLaptops(transformedLaptops);
        // Use pagination data from API response
        setPagination({
          total: data.pagination?.total || transformedLaptops.length,
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || transformedLaptops.length,
          totalPages: data.pagination?.totalPages || 1,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Error fetching suggestions results:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch search results using advanced search API (for filtered searches)
  const fetchAdvancedSearchResults = useCallback(
    async (query: string, currentFilters: Filters, page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Only include query if no brand filters are applied
        // When brand filters are applied, they replace the query entirely
        if (query && currentFilters.brands.length === 0) {
          const formattedQuery = query.trim().split(/\s+/).join(" && ");
          params.append("query", formattedQuery);
        }

        if (currentFilters.brands.length > 0) {
          currentFilters.brands.forEach((brand) =>
            params.append("laptop_model", brand)
          );
        }
        if (currentFilters.processors.length > 0) {
          currentFilters.processors.forEach((processor) =>
            params.append("processor", processor)
          );
        }
        if (currentFilters.rams.length > 0) {
          currentFilters.rams.forEach((ram) => params.append("ram", ram));
        }
        if (currentFilters.customerReview) {
          params.append("rating_min", currentFilters.customerReview);
        }
        if (currentFilters.priceRange) {
          const [min, max] = currentFilters.priceRange.split("-");
          if (min) params.append("price_min", min);
          if (max) params.append("price_max", max);
        }
        params.append("page", page.toString());
        params.append("limit", "20");
        
        const response = await fetch(
          `http://localhost:8080/api/advancedsearch?${params}`
        );
        const data: SearchResponse = await response.json();

        console.log("Advanced Search API Response:", data); // Debug log
        console.log("Search Parameters:", params.toString()); // Debug log

        if (data.success) {
          setLaptops(data.laptops);
          setPagination(data.pagination);
        } else {
          console.error("Advanced Search API returned success: false");
        }
      } catch (error) {
        console.error("Error fetching advanced search results:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Main search function that decides which API to use
  const fetchSearchResults = useCallback(
    async (query: string, currentFilters: Filters, page = 1) => {
      if (!query && !hasFiltersApplied(currentFilters)) {
        // No query and no filters - clear results
        setLaptops([]);
        setPagination(null);
        return;
      }

      if (hasFiltersApplied(currentFilters)) {
        // Use advanced search API when filters are applied
        await fetchAdvancedSearchResults(query, currentFilters, page);
      } else if (query) {
        // Use suggestions API for direct search queries without filters
        await fetchSuggestionsResults(query);
      }
    },
    [fetchAdvancedSearchResults, fetchSuggestionsResults]
  );

  // Handle filter change
  const handleFilterChange = (
    filterType: keyof Filters,
    value: string,
    checked?: boolean
  ) => {
    const newFilters = { ...filters };

    if (filterType === "customerReview" || filterType === "priceRange") {
      newFilters[filterType] = value;
    } else {
      const filterArray = newFilters[filterType] as string[];
      if (checked) {
        newFilters[filterType] = [...filterArray, value];
      } else {
        newFilters[filterType] = filterArray.filter((item) => item !== value);
      }
    }

    setFilters(newFilters);
    fetchSearchResults(searchQuery, newFilters);
  }; // Initial search on page load
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      // Use empty filters for initial load to prevent infinite loop
      fetchSearchResults(query, {
        brands: [],
        processors: [],
        rams: [],
        screenSizes: [],
        cpuTypes: [],
        customerReview: "",
        priceRange: "",
      });
    }
  }, [searchParams, fetchSearchResults]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1b4d] to-[#1a2a4f] text-white">
      <Header />

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          {/* Enhanced Hero Section */}
          <div className="mb-12 text-center">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
                Discover Your Perfect Laptop
              </h1>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-100"></div>
              <div className="absolute -bottom-1 left-1/4 w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
            </div>

            {searchQuery && (
              <div className="mt-6 inline-flex items-center space-x-3 glass-dark px-6 py-3 rounded-full border border-purple-500/30">
                <span className="text-lg text-white/80">Searching for:</span>
                <span className="text-xl font-semibold text-purple-400">
                  "{searchQuery}"
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLaptops([]);
                    setPagination(null);
                  }}
                  className="ml-2 text-white/60 hover:text-white transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
            )}

            <p className="text-xl text-white/60 mt-4 max-w-2xl mx-auto">
              Explore thousands of laptops with advanced filters and find the
              one that matches your needs perfectly
            </p>
          </div>{" "}
          <div className="flex gap-8">
            {/* Enhanced Filters Sidebar */}
            <div className="w-80 glass-dark rounded-2xl p-6 h-fit sticky top-32 border border-purple-500/20 backdrop-blur-lg shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-2">🔍</span>
                  Smart Filters
                </h3>
                <button
                  onClick={() => {
                    setFilters({
                      brands: [],
                      processors: [],
                      rams: [],
                      screenSizes: [],
                      cpuTypes: [],
                      customerReview: "",
                      priceRange: "",
                    });
                    fetchSearchResults(searchQuery, {
                      brands: [],
                      processors: [],
                      rams: [],
                      screenSizes: [],
                      cpuTypes: [],
                      customerReview: "",
                      priceRange: "",
                    });
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">🏢</span>
                  Brand
                </h4>
                <div className="space-y-3">
                  {["HP", "Dell", "Lenovo", "Asus", "Acer", "Apple", "MSI"].map(
                    (brand) => (
                      <label
                        key={brand}
                        className="flex items-center space-x-3 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) =>
                            handleFilterChange(
                              "brands",
                              brand,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                        />
                        <span className="text-white/80 group-hover:text-white transition-colors">
                          {brand}
                        </span>
                        <span className="text-xs text-purple-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          Filter
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Processor Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">⚡</span>
                  Processor
                </h4>
                <div className="space-y-3">
                  {[
                    "Intel Core i3",
                    "Intel Core i5",
                    "Intel Core i7",
                    "Intel Core i9",
                    "AMD Ryzen 3",
                    "AMD Ryzen 5",
                    "AMD Ryzen 7",
                  ].map((processor) => (
                    <label
                      key={processor}
                      className="flex items-center space-x-3 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.processors.includes(processor)}
                        onChange={(e) =>
                          handleFilterChange(
                            "processors",
                            processor,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors text-sm">
                        {processor}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RAM Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">🧠</span>
                  RAM
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["4GB", "8GB", "16GB", "32GB"].map((ram) => (
                    <label
                      key={ram}
                      className="flex items-center space-x-2 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.rams.includes(ram)}
                        onChange={(e) =>
                          handleFilterChange("rams", ram, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors text-sm">
                        {ram}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Screen Size Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📺</span>
                  Screen Size
                </h4>
                <div className="space-y-3">
                  {["13-14 inch", "15-16 inch", "17+ inch"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center space-x-3 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.screenSizes.includes(size)}
                        onChange={(e) =>
                          handleFilterChange(
                            "screenSizes",
                            size,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CPU Type Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">💻</span>
                  CPU Type
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Intel", "AMD"].map((cpu) => (
                    <label
                      key={cpu}
                      className="flex items-center space-x-2 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.cpuTypes.includes(cpu)}
                        onChange={(e) =>
                          handleFilterChange("cpuTypes", cpu, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors">
                        {cpu}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Customer Review Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">⭐</span>
                  Customer Review
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "4+ Stars", value: "4", stars: "⭐⭐⭐⭐" },
                    { label: "3+ Stars", value: "3", stars: "⭐⭐⭐" },
                    { label: "2+ Stars", value: "2", stars: "⭐⭐" },
                    { label: "1+ Stars", value: "1", stars: "⭐" },
                  ].map((rating) => (
                    <label
                      key={rating.value}
                      className="flex items-center space-x-3 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="radio"
                        name="customerReview"
                        checked={filters.customerReview === rating.value}
                        onChange={() =>
                          handleFilterChange("customerReview", rating.value)
                        }
                        className="w-4 h-4 border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors flex-1">
                        {rating.label}
                      </span>
                      <span className="text-yellow-400 text-sm">
                        {rating.stars}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">💰</span>
                  Price Range
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Under ₹30,000",
                      value: "0-30000",
                      color: "text-green-400",
                    },
                    {
                      label: "₹30,000 - ₹50,000",
                      value: "30000-50000",
                      color: "text-blue-400",
                    },
                    {
                      label: "₹50,000 - ₹80,000",
                      value: "50000-80000",
                      color: "text-yellow-400",
                    },
                    {
                      label: "₹80,000 - ₹1,20,000",
                      value: "80000-120000",
                      color: "text-orange-400",
                    },
                    {
                      label: "Above ₹1,20,000",
                      value: "120000-",
                      color: "text-red-400",
                    },
                  ].map((price) => (
                    <label
                      key={price.value}
                      className="flex items-center space-x-3 cursor-pointer group hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === price.value}
                        onChange={() =>
                          handleFilterChange("priceRange", price.value)
                        }
                        className="w-4 h-4 border-purple-500/30 bg-transparent text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                      />
                      <span
                        className={`group-hover:text-white transition-colors ${price.color}`}
                      >
                        {price.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>{" "}
            {/* Enhanced Search Results */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-20">
                  <div className="relative">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
                    <div className="absolute inset-0 inline-block animate-pulse rounded-full h-16 w-16 border-4 border-pink-500/20 border-r-pink-500"></div>
                  </div>
                  <p className="text-white/60 mt-6 text-lg">
                    🔍 Searching for the perfect laptops...
                  </p>
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Enhanced Results Header */}
                  {pagination && (
                    <div className="mb-8 glass-dark rounded-xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {searchQuery ? (
                              <>
                                Results for{" "}
                                <span className="text-purple-400">
                                  "{searchQuery}"
                                </span>
                              </>
                            ) : (
                              "All Laptops"
                            )}
                          </h2>
                          <p className="text-white/60 flex items-center">
                            <span className="text-purple-400 font-semibold mr-1">
                              {pagination.total}
                            </span>
                            laptops found • Page {pagination.page} of{" "}
                            {pagination.totalPages}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">
                            Showing{" "}
                            {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(
                              pagination.page * pagination.limit,
                              pagination.total
                            )}{" "}
                            of {pagination.total}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {laptops.map((laptop, index) => (
                      <div
                        key={laptop._id}
                        className="group glass-dark rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border border-purple-500/20 hover:border-purple-500/40"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "fadeInUp 0.6s ease-out forwards",
                        }}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={laptop.specs?.details?.imageLinks?.[0] || "/placeholder-laptop.jpg"}
                            alt={laptop.specs?.head || "Laptop"}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-laptop.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {laptop.sites?.[0]?.rating && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              ⭐ {laptop.sites[0].rating}
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-purple-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {laptop.brand || laptop.specs?.brand}
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                            {laptop.specs?.head || "Unknown Laptop"}
                          </h3>

                          <div className="grid grid-cols-2 gap-3 text-sm text-white/80 mb-6">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">⚡</span>
                              <span className="truncate">
                                {laptop.specs?.processor ? 
                                  `${laptop.specs.processor.name} ${laptop.specs.processor.gen}th Gen` : 
                                  "Unknown Processor"
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">🧠</span>
                              <span>
                                {laptop.specs?.ram ? 
                                  `${laptop.specs.ram.size}GB ${laptop.specs.ram.type.toUpperCase()}` : 
                                  "Unknown RAM"
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-orange-400">💾</span>
                              <span className="truncate">
                                {laptop.specs?.storage ? 
                                  `${laptop.specs.storage.size}GB ${laptop.specs.storage.type.toUpperCase()}` : 
                                  "Unknown Storage"
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-pink-400">🖥️</span>
                              <span className="truncate">
                                {laptop.specs?.displayInch ? `${laptop.specs.displayInch}"` : "Unknown Display"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ₹{(() => {
                                  // Extract lowest price from sites array
                                  if (laptop.sites && laptop.sites.length > 0) {
                                    const prices = laptop.sites
                                      .map((site) => site.price)
                                      .filter((price): price is number => typeof price === 'number' && price > 0);
                                    if (prices.length > 0) {
                                      return Math.min(...prices).toLocaleString();
                                    }
                                  }
                                  // Fallback to allTimeLowPrice
                                  if (laptop.allTimeLowPrice && laptop.allTimeLowPrice > 0) {
                                    return laptop.allTimeLowPrice.toLocaleString();
                                  }
                                  return "N/A";
                                })()}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                Best Price
                              </p>
                            </div>
                            <button className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-6 mt-12">
                      <button
                        onClick={() =>
                          fetchSearchResults(
                            searchQuery,
                            filters,
                            pagination.page - 1
                          )
                        }
                        disabled={!pagination.hasPrev}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          pagination.hasPrev
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                            : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        ← Previous
                      </button>

                      <div className="flex items-center space-x-2">
                        {[...Array(Math.min(5, pagination.totalPages))].map(
                          (_, i) => {
                            const pageNum =
                              Math.max(1, pagination.page - 2) + i;
                            if (pageNum > pagination.totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() =>
                                  fetchSearchResults(
                                    searchQuery,
                                    filters,
                                    pageNum
                                  )
                                }
                                className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                                  pageNum === pagination.page
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                    : "glass-dark text-white/80 hover:text-white hover:bg-purple-500/20"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() =>
                          fetchSearchResults(
                            searchQuery,
                            filters,
                            pagination.page + 1
                          )
                        }
                        disabled={!pagination.hasNext}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          pagination.hasNext
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                            : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Enhanced No Results */}
                  {!loading && laptops.length === 0 && (
                    <div className="text-center py-20">
                      <div className="relative mb-8">
                        <div className="text-8xl mb-4 animate-bounce">🔍</div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-500 rounded-full animate-ping delay-75"></div>
                      </div>
                      <h3 className="text-4xl font-bold text-white mb-4">
                        No Laptops Found
                      </h3>
                      <p className="text-xl text-white/60 mb-8 max-w-md mx-auto">
                        {searchQuery
                          ? `We couldn't find any laptops matching "${searchQuery}" with your current filters.`
                          : "Try adjusting your filters to see more results."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setFilters({
                              brands: [],
                              processors: [],
                              rams: [],
                              screenSizes: [],
                              cpuTypes: [],
                              customerReview: "",
                              priceRange: "",
                            });
                            fetchSearchResults("", {
                              brands: [],
                              processors: [],
                              rams: [],
                              screenSizes: [],
                              cpuTypes: [],
                              customerReview: "",
                              priceRange: "",
                            });
                          }}
                          className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                        >
                          🔄 Clear All Filters
                        </button>
                        <button
                          onClick={() => fetchSearchResults("", filters)}
                          className="glass-dark border border-purple-500/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-500/20 transition-all duration-300"
                        >
                          🔍 Show All Laptops
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
