import React from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App.jsx';

const theme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  primaryColor: 'gray',
  primaryShade: { light: 9, dark: 0 },
  defaultRadius: 'md',
  headings: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: '600' },
  colors: { dark: ['#f3f3f3','#dedede','#b8b8b8','#969696','#696969','#444444','#272727','#1f1f1f','#151515','#0e0e0e'] },
});

createRoot(document.getElementById('root')).render(
  <MantineProvider theme={theme} defaultColorScheme="dark"><App /></MantineProvider>
);
