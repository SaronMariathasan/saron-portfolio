import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#fb923c',
          },
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          text: {
            primary: '#213547',
          },
        }
      : {
          primary: {
            main: '#fb923c',
          },
          background: {
            default: '#121212',
            paper: '#1a1a1a',
          },
          text: {
            primary: '#f5f5f5',
          },
        }),
  },
  shape: {
    borderRadius: 12,
  },
});

export default getDesignTokens;
