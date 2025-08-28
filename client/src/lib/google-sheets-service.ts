// Business icon mapping based on category and sub-category
export function getBusinessIcon(category: string, subCategory?: string): string {
  const iconMap: Record<string, Record<string, string> | string> = {
    restaurant: {
      pizza: "🍕",
      coffee: "☕",
      default: "🍽️"
    },
    retail: {
      clothing: "👔",
      grocery: "🛒",
      default: "🛍️"
    },
    health: {
      salon: "✂️",
      default: "🏥"
    },
    automotive: {
      "car-repair": "🚗",
      default: "🔧"
    },
    services: "🔧",
    default: "🏢"
  };

  const categoryIcons = iconMap[category.toLowerCase()];
  
  if (typeof categoryIcons === 'string') {
    return categoryIcons;
  }
  
  if (categoryIcons && subCategory) {
    return categoryIcons[subCategory.toLowerCase()] || categoryIcons.default || iconMap.default as string;
  }
  
  return iconMap.default as string;
}

// Performance tracking utilities
export const performanceTracker = {
  startTimer: () => Date.now(),
  endTimer: (startTime: number) => Date.now() - startTime,
  
  // Mock performance metrics for demonstration
  getPerformanceStats: () => ({
    loadTime: "245ms",
    searchTime: "12ms", 
    renderTime: "18ms",
    device: "Desktop",
    memory: "23MB",
  })
};

// Cache implementation for better performance
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 30000; // 30 seconds TTL

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
