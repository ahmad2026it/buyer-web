'use client';

import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: { main: '#A54AFF' },
    error: { main: '#D92D20' },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
        },
      },
    },
  },
});
