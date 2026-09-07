import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Projects from "./pages/Projects";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <footer className="bg-white border-top py-3 text-center text-muted small">
            &copy; {new Date().getFullYear()} WebEra Solutions PK. All rights
            reserved.
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}
