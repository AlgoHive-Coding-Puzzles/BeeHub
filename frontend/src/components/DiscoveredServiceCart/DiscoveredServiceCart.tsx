import { useState } from "react";
import { Service } from "../../types/Service";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { createCatalog } from "../../services/catalogsService";
import { ProgressSpinner } from "primereact/progressspinner";

interface DiscoveredServiceCartProps {
  service: Service;
  onCatalogAdded: () => void;
  isOwner: boolean;
}

const DiscoveredServiceCart: React.FC<DiscoveredServiceCartProps> = ({
  service,
  onCatalogAdded,
  isOwner = false,
}) => {
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleAddCatalog = async () => {
    setIsLoading(true);
    try {
      // Test connection first with the provided key
      const apiUrl = `http://${service.host}:${service.port}/apikey`;
      const testResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${privateKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!testResponse.ok) {
        toast.current?.show({
          severity: "error",
          summary: "Connection Failed",
          detail: "Could not connect to the service with the provided key",
          life: 5000,
        });
        setIsLoading(false);
        return;
      }

      // If connection test successful, create catalog
      await createCatalog({
        address: `http://${service.host}:${service.port}`,
        private_key: privateKey,
        name: service.name,
        description: `Auto-discovered ${service.service_type} service`,
      });

      toast.current?.show({
        severity: "success",
        summary: "Catalog Created",
        detail: `${service.name} has been added to your catalogs`,
        life: 3000,
      });

      setShowKeyDialog(false);
      setPrivateKey("");
      onCatalogAdded();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add catalog. Please try again.",
        life: 5000,
      });
      console.error("Error adding catalog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = () => {
    if (service.service_type === "docker") {
      return "🐳";
    } else if (service.service_type === "local") {
      return "🖥️";
    } else {
      return "📡";
    }
  };

  const getStatusColor = () => {
    switch (service.status) {
      case "running":
        return "#22c55e"; // Green
      case "stopped":
        return "#f59e0b"; // Amber
      case "error":
        return "#ef4444"; // Red
      default:
        return "#64748b"; // Slate
    }
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowKeyDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Test & Add"
        icon="pi pi-check"
        onClick={handleAddCatalog}
        loading={isLoading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Card className="service-card border-1 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="service-icon-container bg-black-50 p-3 rounded-full">
              <p className="text-2xl text-gray-700 font-bold flex items-center justify-center h-full w-full rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105 cursor-pointer">
                {getServiceIcon()}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
              <p className="text-gray-600 text-sm">{`${service.host}:${service.port}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="status-dot w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
              title={`Status: ${service.status}`}
            ></div>
            <span className="text-xs font-medium text-gray-600 capitalize">
              {service.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="service-type px-2 py-1 bg-gray-100 rounded-md">
            <span className="text-xs font-medium text-gray-700 capitalize">
              {service.service_type}
            </span>
          </div>
          <Button
            label="Add as Catalog"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => setShowKeyDialog(true)}
            disabled={!isOwner}
          />
        </div>
      </Card>

      <Dialog
        header={`Add ${service.name} as Catalog`}
        visible={showKeyDialog}
        style={{ width: "450px" }}
        footer={dialogFooter}
        onHide={() => setShowKeyDialog(false)}
        breakpoints={{ "960px": "80vw", "640px": "90vw" }}
      >
        {isLoading ? (
          <div className="flex flex-column align-items-center justify-content-center p-5">
            <ProgressSpinner
              style={{ width: "50px", height: "50px" }}
              animationDuration=".5s"
            />
            <span className="mt-3">Testing connection...</span>
          </div>
        ) : (
          <div className="p-fluid">
            <div className="field mb-4">
              <label htmlFor="privateKey" className="font-bold block mb-2">
                API Key / Private Key
              </label>
              <InputText
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full"
              />
              <small className="block mt-1 text-gray-500">
                Enter the API key for the service to add it as a catalog
              </small>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default DiscoveredServiceCart;
