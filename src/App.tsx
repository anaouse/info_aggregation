import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import ToolsPage from "@/pages/ToolsPage";
import PredictionsPage from "@/pages/PredictionsPage";
import AssetsPage from "@/pages/AssetsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
