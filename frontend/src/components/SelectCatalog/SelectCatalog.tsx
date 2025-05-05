import { useState, useEffect } from "react";
import { Catalog } from "../../types/Catalog";
import { Dropdown } from "primereact/dropdown";
import { getCatalogs } from "../../services/catalogsService";

interface SelectCatalogProps {
  setSelectedMenu: (menu: string) => void;
  setSelectedCatalog: (catalog: Catalog | null) => void;
  currentCatalog: Catalog | null;
  catalogs?: Catalog[];
}

export default function SelectCatalog({
  setSelectedMenu,
  currentCatalog,
  setSelectedCatalog,
  catalogs = [],
}: SelectCatalogProps) {
  const [_catalogs, setCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const data = await getCatalogs();
        setCatalogs(data);
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      }
    };

    if (catalogs && catalogs.length > 0) fetchCatalogs();
  }, [catalogs]);

  const handleCatalogChange = (selectedCatalog: Catalog) => {
    setSelectedCatalog(selectedCatalog);
    if (selectedCatalog) {
      setSelectedMenu("Catalog");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl font-semibold mt-4">Select a Catalog</h2>
      <Dropdown
        value={currentCatalog}
        options={_catalogs}
        onChange={(e) => handleCatalogChange(e.value)}
        placeholder="Select a Catalog"
        className="w-1/2 mt-4"
        optionLabel="name"
        filter
        filterBy="name"
        showClear
      />
    </div>
  );
}
