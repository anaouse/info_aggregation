import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import ToolsPage from "@/pages/ToolsPage";
import PredictionsPage from "@/pages/PredictionsPage";
import AssetsPage from "@/pages/AssetsPage";
import AnimePage from "@/pages/AnimePage";
import AnimePlayPage from "@/pages/AnimePlayPage";
import MusicPage from "@/pages/MusicPage";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";

export default function App() {
  return (
    <MusicPlayerProvider>
      <BrowserRouter>
        <Routes>
        {/* Pages with Header */}
        <Route
          path="/"
          element={
            <div className="app">
              <Header />
              <HomePage />
            </div>
          }
        />
        <Route
          path="/tools"
          element={
            <div className="app">
              <Header />
              <ToolsPage />
            </div>
          }
        />
        <Route
          path="/predictions"
          element={
            <div className="app">
              <Header />
              <PredictionsPage />
            </div>
          }
        />
        <Route
          path="/assets"
          element={
            <div className="app">
              <Header />
              <AssetsPage />
            </div>
          }
        />
        <Route
          path="/anime"
          element={
            <div className="app">
              <Header />
              <AnimePage />
            </div>
          }
        />
        <Route
          path="/music"
          element={
            <div className="app">
              <Header />
              <MusicPage />
            </div>
          }
        />

        {/* Standalone page without Header */}
        <Route path="/anime/play" element={<AnimePlayPage />} />
        </Routes>
      </BrowserRouter>
    </MusicPlayerProvider>
  );
}
