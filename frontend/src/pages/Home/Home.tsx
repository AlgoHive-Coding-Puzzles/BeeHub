import { Catalog } from "../../types/Catalog";
import SelectCatalog from "../../components/SelectCatalog/SelectCatalog";
import { useEffect, useState } from "react";
import { getCatalogs } from "../../services/catalogsService";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";

interface HomeProps {
  setSelectedMenu: (menu: string) => void;
  setSelectedCatalog: (catalog: Catalog | null) => void;
  currentCatalog: Catalog | null;
}

export default function HomePage({
  setSelectedMenu,
  currentCatalog,
  setSelectedCatalog,
}: HomeProps) {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const data = await getCatalogs();

        setCatalogs(data);
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const getStatusIndicator = (catalog: Catalog) => {
    const isConnected = catalog.address && catalog.private_key;
    return (
      <Tag
        severity={isConnected ? "success" : "warning"}
        value={isConnected ? "Connected" : "Not Connected"}
        className="ml-2"
      />
    );
  };

  const handleSelectCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setSelectedMenu("Catalog");
  };

  const truncateDescription = (
    description: string | undefined,
    maxLength: number = 120
  ) => {
    if (!description) return "";
    return description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to BeeHub</h1>
        <p className="text-gray-400 mb-6">
          Select a catalog to get started or browse the available servers below.
        </p>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Select</h2>
          <SelectCatalog
            currentCatalog={currentCatalog}
            setSelectedCatalog={setSelectedCatalog}
            setSelectedMenu={setSelectedMenu}
            catalogs={catalogs}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Available Servers</h2>
        {loading ? (
          <div className="flex justify-center p-6">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="catalog-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:translate-y-[-5px]"
              >
                <div className="h-3 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {catalog.name}
                    </h3>
                    {getStatusIndicator(catalog)}
                  </div>

                  <p className="text-gray-400 text-sm mb-4">
                    {truncateDescription(catalog.description)}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500">SERVER ADDRESS</div>
                    <div className="text-sm font-mono text-gray-300 truncate">
                      {catalog.address}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Button
                      label="Access"
                      icon="pi pi-arrow-right"
                      className="p-button-sm"
                      onClick={() => handleSelectCatalog(catalog)}
                    />
                    <Button
                      icon="pi pi-external-link"
                      className="p-button-rounded p-button-text p-button-sm"
                      tooltip="View API Docs"
                      tooltipOptions={{ position: "left" }}
                      onClick={() =>
                        window.open(
                          catalog.address + "/swagger/index.html",
                          "_blank"
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            {catalogs.length === 0 && !loading && (
              <div className="col-span-full">
                <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
                  <i className="pi pi-server mb-4 text-5xl text-gray-500"></i>
                  <h3 className="text-xl font-semibold mb-2">
                    No Catalogs Found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    There are no catalogs available. You can add new catalogs in
                    the Settings page.
                  </p>
                  <Button
                    label="Go to Settings"
                    icon="pi pi-cog"
                    className="p-button-outlined"
                    onClick={() => setSelectedMenu("Settings")}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
