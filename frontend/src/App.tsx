import { useEffect, useState, useRef } from "react";
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
import { getServices } from "./services/servicesService";
import { Service } from "./types/Service";
import DiscoveredServiceCart from "./components/DiscoveredServiceCart/DiscoveredServiceCart";
import { Toast } from "primereact/toast";

function AppContent() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const { isAuthenticated } = useAuth();
  const toast = useRef<Toast>(null);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const catalogs = await getCatalogs();
      setCatalogs(catalogs);
      return catalogs as Catalog[];
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch catalogs",
        life: 3000,
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch available services",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      const catalogList = await fetchCatalogs();

      // If no catalogs, fetch available services
      if (catalogList.length === 0) {
        await fetchServices();
      }
    };

    if (isAuthenticated) {
      init();
    }
  }, [isAuthenticated]);

  // Reload data when a new catalog is added
  const handleCatalogAdded = async () => {
    await fetchCatalogs();
    // Clear services if we now have catalogs
    if (catalogs.length > 0) {
      setServices([]);
    }
  };

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
            selectedCatalog={selectedCatalog as Catalog}
          />
        );
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
      <Toast ref={toast} />
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
              optionLabel="name"
              filter
              filterBy="name"
              showClear
            />
          </div>
        )}

        {(!selectedCatalog && selectedMenu !== "Home") ||
          (selectedCatalog && (
            <>
              <h1 className="text-3xl font-bold text-center">{`BeeHub - Interface`}</h1>
              <div className="mt-8">{renderContent()}</div>
            </>
          ))}

        {!selectedCatalog && catalogs.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center">{`BeeHub - Interface`}</h1>

            {loading ? (
              <p className="mt-4">Loading available catalogs...</p>
            ) : (
              <>
                <h2 className="text-xl font-semibold mt-4">
                  No Catalogs Available
                </h2>

                {services && services.length > 0 ? (
                  <div className="w-full mt-6">
                    <h3 className="text-lg font-medium mb-3">
                      Discovered Services - Add as Catalog
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <DiscoveredServiceCart
                          key={service.id}
                          service={service}
                          onCatalogAdded={handleCatalogAdded}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-lg">No services discovered.</p>
                    <p className="text-md mt-2">
                      Please contact your administrator or check your network
                      connection.
                    </p>
                  </div>
                )}
              </>
            )}
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
