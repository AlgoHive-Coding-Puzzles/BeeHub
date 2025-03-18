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
}

const DiscoveredServiceCart: React.FC<DiscoveredServiceCartProps> = ({
  service,
  onCatalogAdded,
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

  const serviceStatusSeverity = () => {
    switch (service.status) {
      case "running":
        return "success";
      case "stopped":
        return "warning";
      case "error":
        return "danger";
      default:
        return "info";
    }
  };

  const footer = (
    <div className="flex justify-content-end">
      <Button
        label="Add as Catalog"
        icon="pi pi-plus"
        onClick={() => setShowKeyDialog(true)}
      />
    </div>
  );

  const header = (
    <div
      className="p-2 flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <i
        className={`pi ${
          service.service_type === "docker" ? "pi-server" : "pi-desktop"
        } text-4xl text-primary`}
      ></i>
    </div>
  );

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
      <Card
        title={service.name}
        subTitle={`${service.host}:${service.port} (${service.service_type})`}
        footer={footer}
        header={header}
        className="mb-3"
      >
        <div className="mt-2">
          <span
            className={`badge bg-${serviceStatusSeverity()}-500 p-2 rounded-md text-white`}
          >
            {service.status}
          </span>
        </div>
      </Card>

      <Dialog
        header={`Add ${service.name} as Catalog`}
        visible={showKeyDialog}
        style={{ width: "450px" }}
        footer={dialogFooter}
        onHide={() => setShowKeyDialog(false)}
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
