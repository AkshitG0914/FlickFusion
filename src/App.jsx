import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import WatchMoviePage from "./pages/WatchMoviePage.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/watch/:seriesId" element={<WatchPage />} />
      <Route path="/watch-movie/:movieId" element={<WatchMoviePage />} />
    </Routes>
  );
};

export default App;
