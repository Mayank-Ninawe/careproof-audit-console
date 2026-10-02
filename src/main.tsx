import {createRoot} from 'react-dom/client';
import App from './app/App.tsx';
import './index.css';
import { initializeAuthObserver } from './store/authStore';

// Connect Firebase Auth state observer to the application store
initializeAuthObserver();

createRoot(document.getElementById('root')!).render(<App />);
