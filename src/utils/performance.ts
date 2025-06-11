// Performance optimization utilities

export const performance = {
  // Debounce function for search inputs
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images with Intersection Observer
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = src;
            img.classList.remove('opacity-0');
            img.classList.add('opacity-100');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    observer.observe(img);
  },

  // Preload critical resources
  preloadResource(href: string, as: string, type?: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Preload images
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Memory cleanup for event listeners
  createCleanupFunction(element: Element, event: string, handler: EventListener): () => void {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  },

  // Optimize animations for performance
  optimizeAnimation(element: HTMLElement): void {
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
  },

  // Clean up animation optimizations
  cleanupAnimation(element: HTMLElement): void {
    element.style.willChange = 'auto';
    element.style.backfaceVisibility = 'visible';
    element.style.perspective = 'none';
  }
};

export const monitoring = {
  // Performance monitoring
  measurePerformance(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  },

  // Error tracking with context
  trackError(error: Error, context?: Record<string, any>): void {
    console.error('Application Error:', error, context);
    
    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: context });
    }
  },

  // User interaction tracking
  trackEvent(event: string, properties?: Record<string, any>): void {
    console.log('Event:', event, properties);
    
    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Example: analytics.track(event, properties);
    }
  },

  // Core Web Vitals monitoring
  measureCoreWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};