import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

import MapView from "./components/MapView";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 p-4 text-white text-xl">
          <h1 className="">Cargo Shipment Tracker</h1>
        </header>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shipment/:id/map" element={<MapView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
