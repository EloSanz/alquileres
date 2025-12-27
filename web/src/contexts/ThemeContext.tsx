import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

export const ThemeContext = createContext<{
  themeName: string;
  setTheme: (name: string) => void;
  themes: Record<string, any>;
}>({
  themeName: 'light',
  setTheme: () => {},
  themes: {},
});

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

const kyotoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#e573a7', contrastText: '#ffffff' }, // Sakura pink
    secondary: { main: '#f7cac9', contrastText: '#6d4c41' }, // Soft pink
    background: {
      default: 'rgba(247, 202, 201, 0.7)', // Soft pink with transparency
      paper: 'rgba(255, 255, 255, 0.85)'
    },
    text: {
      primary: '#6d4c41', // Brownish for contrast
      secondary: '#a1887f'
    },
    divider: '#f7cac9',
  },
  typography: {
    fontFamily: 'Sawarabi Mincho, Noto Serif JP, serif',
    fontSize: 16,
    h4: { fontSize: '2.1rem' },
    body1: { fontSize: '1.05rem' },
    body2: { fontSize: '1rem' },
    caption: { fontSize: '0.95rem' }
  },
});

const tokyoTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00eaff', contrastText: '#000000' }, // Neon blue
    secondary: { main: '#ff00cc', contrastText: '#ffffff' }, // Neon pink
    background: {
      default: 'rgba(10, 20, 40, 0.85)',
      paper: 'rgba(30, 40, 60, 0.95)'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0'
    },
    divider: '#222',
  },
  typography: {
    fontFamily: 'M PLUS 1p, Noto Sans JP, sans-serif',
    fontSize: 16,
    h4: { fontSize: '2.1rem' },
    body1: { fontSize: '1.05rem' },
    body2: { fontSize: '1rem' },
    caption: { fontSize: '0.95rem' }
  },
});

const themes = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2', contrastText: '#ffffff' },
      secondary: { main: '#9c27b0', contrastText: '#ffffff' },
      background: {
        default: '#f7f9fa',
        paper: '#fdfdfd'
      },
      divider: '#e0e0e0',
      text: {
        primary: '#222',
        secondary: '#444'
      }
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: 16,
      h4: { fontSize: '2.1rem' },
      body1: { fontSize: '1.05rem' },
      body2: { fontSize: '1rem' },
      caption: { fontSize: '0.95rem' }
    },
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.15) !important', // More visible primary color with !important
            },
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#90caf9', contrastText: '#000000' },
      secondary: { main: '#ce93d8', contrastText: '#000000' },
      background: { default: '#1e1e1e', paper: '#2d2d2d' }
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: 16,
      h4: { fontSize: '2.1rem' },
      body1: { fontSize: '1.05rem' },
      body2: { fontSize: '1rem' },
      caption: { fontSize: '0.95rem' }
    }
  }),
  github: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#2ea44f', contrastText: '#ffffff' },
      secondary: { main: '#58a6ff', contrastText: '#000000' },
      background: { default: '#0d1117', paper: '#161b22' },
      text: { primary: '#c9d1d9', secondary: '#8b949e' }
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: 16,
      h4: { fontSize: '2.1rem' },
      body1: { fontSize: '1.05rem' },
      body2: { fontSize: '1rem' },
      caption: { fontSize: '0.95rem' }
    }
  }),
  tokyo: tokyoTheme,
  kyoto: kyotoTheme
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('themeName');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeName', themeName);
  }, [themeName]);

  const setTheme = (name: string) => {
    setThemeName(name);
  };

  const theme = (themes as any)[themeName] || themes.light || createTheme();

  // Pass themeName so components can use it for background image logic
  return (
    <ThemeContext.Provider value={{ themeName, setTheme, themes }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
