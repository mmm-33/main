// Accessibility utilities and helpers

export const accessibility = {
  // Announce content to screen readers
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus management
  trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Check color contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Validate WCAG contrast requirements
  validateContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const minRatio = level === 'AAA' ? 7 : 4.5;
    return ratio >= minRatio;
  },

  // Add keyboard navigation to elements
  addKeyboardNavigation(element: HTMLElement, onActivate: () => void): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeAttribute('tabindex');
      element.removeAttribute('role');
    };
  },

  // Generate unique IDs for form labels
  generateId(prefix: string = 'element'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Set up accessibility event listeners
  setupAccessibilityListeners(): () => void {
    const cleanupFunctions: (() => void)[] = [];

    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);
    cleanupFunctions.push(() => motionQuery.removeEventListener('change', handleMotionChange));

    // Listen for high contrast preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };
    contrastQuery.addEventListener('change', handleContrastChange);
    cleanupFunctions.push(() => contrastQuery.removeEventListener('change', handleContrastChange));

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }
};