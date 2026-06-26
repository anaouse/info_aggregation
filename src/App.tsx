import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import Page1 from "@/pages/Page1";
import PredictionsPage from "@/pages/PredictionsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/predictions" element={<PredictionsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
