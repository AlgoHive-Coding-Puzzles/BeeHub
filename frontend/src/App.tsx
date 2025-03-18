import { useEffect, useState } from "react";
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
import { Catalog } from "./types/Catalog";
import { getCatalogs } from "./services/catalogsService";
import { Dropdown } from "primereact/dropdown";

function AppContent() {
  // const { data } = useFetch<ServerName>("/name");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = (await getCatalogs()) || [];
        setCatalogs(response);
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      }
    };

    fetchCatalogs();
  }, []);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const renderContent = () => {
    switch (true) {
      case "Home" === selectedMenu:
        return <HomePage setSelectedMenu={setSelectedMenu} />;
      case selectedMenu.startsWith("Theme"):
        return <ThemePage selectedMenu={selectedMenu} />;
      case "Puzzles" === selectedMenu:
        return <p className="text-center">Get puzzle input</p>;
      case "Team" === selectedMenu:
        return <p className="text-center">Manage users</p>;
      case "Forge" === selectedMenu:
        return <Forge />;
      case "Settings" === selectedMenu:
        return <p className="text-center">Access Settings</p>;
    }
  };

  return (
    <div className="app-container">
      <AppSidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
      />

      <div className="content-container">
        {!selectedCatalog && catalogs.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-center">{`BeeHub - Interface -`}</h1>
            <h2 className="text-xl font-semibold mt-4">Select a Catalog</h2>
            <Dropdown
              value={selectedCatalog}
              options={catalogs}
              onChange={(e) => setSelectedCatalog(e.value)}
              placeholder="Select a Catalog"
              className="w-1/2 mt-4"
              optionLabel="label"
              optionValue="value"
              filter
              filterBy="label"
              showClear
            />
          </div>
        )}

        {!selectedCatalog && selectedMenu !== "Home" && (
          <>
            <h1 className="text-3xl font-bold text-center">{`BeeHub - Interface`}</h1>
            <div className="mt-8">{renderContent()}</div>
          </>
        )}
        {!selectedCatalog && catalogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-center">{`BeeHub - Interface -`}</h1>
            <h2 className="text-xl font-semibold mt-4">
              No Catalogs Available
            </h2>
            <p className="text-lg mt-2">Please contact your administrator.</p>
          </div>
        )}
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
