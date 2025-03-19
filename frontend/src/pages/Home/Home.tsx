import { Catalog } from "../../types/Catalog";
import SelectCatalog from "../../components/SelectCatalog/SelectCatalog";

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
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
      <p className="mt-4">Select a catalog to get started.</p>
      <p className="mt-2 text-sm">
        A catalog is a collection of themes that contains .alghive files. A
        catalog serves the themes as an API to the Alghive client.
      </p>
      <div className="mt-10">
        <SelectCatalog
          currentCatalog={currentCatalog}
          setSelectedCatalog={setSelectedCatalog}
          setSelectedMenu={setSelectedMenu}
        />
      </div>
    </div>
  );
}
