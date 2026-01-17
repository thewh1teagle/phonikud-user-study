import { createRoot } from 'react-dom/client'
import './index.css'
import App from './routes/Home.tsx'
import TestFirebase from './routes/experimental/TestFirebase.tsx'
import { BrowserRouter, Route, Routes } from "react-router";


createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename='/phonikud-user-study/'>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/experimental/test-firebase" element={<TestFirebase />} />
  </Routes>
  </BrowserRouter>,
)
