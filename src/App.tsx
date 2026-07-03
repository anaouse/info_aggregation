import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import ToolsPage from "@/pages/ToolsPage";
import PredictionsPage from "@/pages/PredictionsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
