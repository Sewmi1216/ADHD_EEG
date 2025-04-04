import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Explicitly type the children prop
type FontLoaderProps = {
  children: React.ReactNode; // This allows any valid React children
};

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'poppins-regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'poppins-bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
        'poppins-semibold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'poppins-extrabold': require('../../assets/fonts/Poppins/Poppins-ExtraBold.ttf')
        
      });
      setFontsLoaded(true);
      SplashScreen.hideAsync(); // Hide splash screen after fonts are loaded
    } catch (error) {
      console.error('Error loading fonts', error);
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      await SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding automatically
      await loadFonts();
    };
    loadResources();
  }, []);

  if (!fontsLoaded) {
    return null; // Return nothing while the fonts are loading
  }

  return <>{children}</>; // Render children when fonts are loaded
};

export default FontLoader;
