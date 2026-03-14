import { useEffect, useState } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'ultrawide';

interface LayoutConfig {
  bmoMaxWidth: string;
  containerMaxWidth: string;
  panelMaxHeight: string;
  gap: string;
  padding: string;
}

export function useScreenLayout() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('laptop');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Detect screen size based on actual width
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1600) {
        setScreenSize('laptop'); // Your screen (1440px)
      } else if (width < 2200) {
        setScreenSize('desktop'); // Friend's standard large monitor (1920px)
      } else {
        setScreenSize('ultrawide'); // Friend's ultra-wide (2560px+)
      }
    };

    handleResize(); // Call on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define layout for each screen size
  const getLayoutConfig = (): LayoutConfig => {
    switch (screenSize) {
      case 'mobile':
        return {
          bmoMaxWidth: '460px',
          containerMaxWidth: '100%',
          panelMaxHeight: '520px',
          gap: '3px',
          padding: '3px',
        };
      case 'tablet':
        return {
          bmoMaxWidth: '500px',
          containerMaxWidth: '100%',
          panelMaxHeight: '560px',
          gap: '3px',
          padding: '3px',
        };
      case 'laptop': // YOUR SCREEN - KEEP PERFECT
        return {
          bmoMaxWidth: '560px',
          containerMaxWidth: '96rem',
          panelMaxHeight: '720px',
          gap: '4px',
          padding: '4px',
        };
      case 'desktop': // 1920px+ screens
        return {
          bmoMaxWidth: '580px', // Slightly larger BMO
          containerMaxWidth: '1400px', // Much wider container
          panelMaxHeight: '800px', // Taller panels
          gap: '4px',
          padding: '4px',
        };
      case 'ultrawide': // 2560px+ screens
        return {
          bmoMaxWidth: '620px', // Even larger BMO
          containerMaxWidth: '1800px', // Very wide container
          panelMaxHeight: '900px', // Much taller panels
          gap: '4px',
          padding: '4px',
        };
      default:
        return {
          bmoMaxWidth: '560px',
          containerMaxWidth: '96rem',
          panelMaxHeight: '720px',
          gap: '4px',
          padding: '4px',
        };
    }
  };

  return {
    screenSize,
    windowWidth,
    layoutConfig: getLayoutConfig(),
  };
}
