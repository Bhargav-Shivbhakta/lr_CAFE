import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './core/theme/global.css';
import './features';            // registers every feature module
import { AppRouter } from './core/AppRouter';

createRoot(document.getElementById('root')!).render(<StrictMode><AppRouter /></StrictMode>);
