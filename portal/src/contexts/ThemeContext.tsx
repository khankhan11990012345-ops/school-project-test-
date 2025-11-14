import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  active: string;
  navbar: string;
  sidebar: string;
  button: string;
  buttonHover: string;
  buttonActive: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeColors = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#667eea',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  hover: '#5568d3',
  active: '#667eea',
  navbar: '#ffffff',
  sidebar: '#ffffff',
  button: '#667eea',
  buttonHover: '#5568d3',
  buttonActive: '#4a5bc4',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [colors, setColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('theme-colors');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme-colors', JSON.stringify(colors));
    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, [colors]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setColors(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ colors, updateColor, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

