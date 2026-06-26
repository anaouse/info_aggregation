import { createRoot } from 'react-dom/client'
import App from '@/App'
import '@/css/source-item.css'
import '@/css/sources-list.css'
import '@/css/confirm-window.css'
import '@/css/add-source-bar.css'
import '@/css/header.css'
import '@/css/root.css'
import '@/css/add-prediction-bar.css'
import '@/css/prediction-item.css'
import '@/css/predictions-list.css'

createRoot(document.getElementById('root')!).render(<App />)
