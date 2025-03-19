import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppSidebar from "./components/Sidebar/Sidebar";
import HomePage from "./pages/Home/Home";
import ThemePage from "./pages/Theme/Theme";
import Login from "./pages/Login/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Forge from "./pages/Forge/Forge";
import Settings from "./pages/Settings/Settings";
import TeamPage from "./pages/Team/Team"; // Add import for Team page
import { Catalog } from "./types/Catalog";
import CatalogPage from "./pages/Catalog/Catalog";

function AppContent() {
  const [currentCatalog, setCurrentCatalog] = useState<Catalog | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const renderContent = () => {
    switch (true) {
      case "Home" === selectedMenu:
        return (
          <HomePage
            setSelectedMenu={setSelectedMenu}
            setSelectedCatalog={setCurrentCatalog}
            currentCatalog={currentCatalog}
          />
        );
      case "Catalog" === selectedMenu:
        return (
          <CatalogPage
            currentCatalog={currentCatalog}
            setSelectedMenu={setSelectedMenu}
            setSelectedCatalog={setCurrentCatalog}
            setSelectedTheme={setCurrentTheme}
          />
        );
      case "Theme" === selectedMenu:
        return (
          <ThemePage
            selectedCatalog={currentCatalog as Catalog}
            selectedTheme={currentTheme}
          />
        );
      case "Team" === selectedMenu:
        return <TeamPage />; // Add Team page rendering
      case "Forge" === selectedMenu:
        return <Forge />;
      case "Settings" === selectedMenu:
        return <Settings />;
    }
  };

  return (
    <div
      className="app-container"
      style={{ minHeight: "100vh", display: "flex" }}
    >
      <AppSidebar
        selectedMenu={selectedMenu}
        currentCatalog={currentCatalog}
        currentTheme={currentTheme}
        setSelectedMenu={setSelectedMenu}
      />
      <div
        className="content-container"
        style={{ flexGrow: 1, marginLeft: "8rem", padding: "1rem" }}
      >
        <div className="mt-8">{renderContent()}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
