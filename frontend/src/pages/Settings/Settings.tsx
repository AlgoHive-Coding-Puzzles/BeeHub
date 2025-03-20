import { useState, useEffect, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Catalog } from "../../types/Catalog";
import { Service } from "../../types/Service";
import {
  getCatalogs,
  updateCatalog,
  deleteCatalog,
  createCatalog,
  UpdateCatalogDto,
} from "../../services/catalogsService";
import { getServices } from "../../services/servicesService";
import DiscoveredServiceCart from "../../components/DiscoveredServiceCart/DiscoveredServiceCart";
import AuthService from "../../services/AuthService";

const Settings: React.FC = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [unregisteredServices, setUnregisteredServices] = useState<Service[]>(
    []
  );
  const [isOwner, setIsOwner] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [editData, setEditData] = useState<UpdateCatalogDto>({
    name: "",
    description: "",
    address: "",
    private_key: "",
  });
  const [newCatalogData, setNewCatalogData] = useState<UpdateCatalogDto>({
    name: "",
    description: "",
    address: "",
    private_key: "",
  });
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load catalogs and services
      const catalogsData = await getCatalogs();
      const servicesData = await getServices();
      const user = await AuthService.getCurrentUser();
      setIsOwner(user.is_owner);

      setCatalogs(catalogsData);

      // Filter services that are not registered as catalogs
      const catalogAddresses = catalogsData.map((catalog) => {
        const url = new URL(catalog.address);
        return `${url.hostname}:${url.port}`;
      });

      const unregistered = servicesData.filter((service) => {
        const serviceAddress = `${service.host}:${service.port}`;
        return !catalogAddresses.includes(serviceAddress);
      });

      setUnregisteredServices(unregistered);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to load data",
        detail: "Could not retrieve settings data",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogAdded = () => {
    loadData();
  };

  const openEditDialog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setEditData({
      name: catalog.name,
      description: catalog.description || "",
      address: catalog.address,
      private_key: catalog.private_key || "",
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedCatalog) return;

    try {
      await updateCatalog(selectedCatalog.id, editData);
      toast.current?.show({
        severity: "success",
        summary: "Catalog Updated",
        detail: `${editData.name} has been updated successfully`,
        life: 3000,
      });
      setEditDialog(false);
      loadData();
    } catch (error) {
      console.error("Error updating catalog:", error);
      toast.current?.show({
        severity: "error",
        summary: "Update Failed",
        detail: "Could not update the catalog",
        life: 3000,
      });
    }
  };

  const confirmDeleteCatalog = (catalog: Catalog) => {
    confirmDialog({
      message: `Are you sure you want to delete the catalog "${catalog.name}"?`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(catalog.id),
    });
  };

  const handleDelete = async (catalogId: string) => {
    try {
      await deleteCatalog(catalogId);
      toast.current?.show({
        severity: "success",
        summary: "Catalog Deleted",
        detail: "The catalog has been removed successfully",
        life: 3000,
      });
      loadData();
    } catch (error) {
      console.error("Error deleting catalog:", error);
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: "Could not delete the catalog",
        life: 3000,
      });
    }
  };

  const openCreateDialog = () => {
    setNewCatalogData({
      name: "",
      description: "",
      address: "",
      private_key: "",
    });
    setCreateDialog(true);
  };

  const handleCreate = async () => {
    try {
      if (
        !newCatalogData.address?.startsWith("http://") &&
        !newCatalogData.address?.startsWith("https://")
      ) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Address",
          detail: "Address must start with http:// or https://",
          life: 3000,
        });
        return;
      }

      // @ts-expect-error pls
      await createCatalog(newCatalogData);
      toast.current?.show({
        severity: "success",
        summary: "Catalog Created",
        detail: `${newCatalogData.name} has been created successfully`,
        life: 3000,
      });
      setCreateDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating catalog:", error);
      toast.current?.show({
        severity: "error",
        summary: "Creation Failed",
        detail: "Could not create the catalog",
        life: 3000,
      });
    }
  };

  // DataTable action buttons template
  const actionBodyTemplate = (rowData: Catalog) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => openEditDialog(rowData)}
          tooltip="Edit"
          disabled={!isOwner}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteCatalog(rowData)}
          tooltip="Delete"
          disabled={!isOwner}
        />
      </div>
    );
  };

  // Status template with a tag
  const statusTemplate = (rowData: Catalog) => {
    // Simple connectivity check - in a real app, you might want to do a proper health check
    const isConnected = rowData.address && rowData.private_key;

    return (
      <Tag
        severity={isConnected ? "success" : "warning"}
        value={isConnected ? "Connected" : "Not Connected"}
      />
    );
  };

  const addressTemplate = (rowData: Catalog) => {
    return <span className="text-sm font-mono">{rowData.address}</span>;
  };

  return (
    <div className="settings-container p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Catalogs Management">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Catalogs</h2>
              <Button
                label="Add Catalog"
                icon="pi pi-plus"
                onClick={openCreateDialog}
                disabled={!isOwner}
              />
            </div>

            <DataTable
              value={catalogs}
              paginator
              rows={10}
              loading={loading}
              emptyMessage="No catalogs found"
              responsiveLayout="scroll"
              className="mb-6"
            >
              <Column field="name" header="Name" sortable />
              <Column field="description" header="Description" />
              <Column
                field="address"
                header="Address"
                body={addressTemplate}
                sortable
              />
              <Column header="Status" body={statusTemplate} />
              <Column
                header="Actions"
                body={actionBodyTemplate}
                style={{ width: "10rem" }}
              />
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Discovered Services">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Available Unregistered Services
            </h2>

            {loading ? (
              <div className="flex justify-content-center">
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "2rem" }}
                ></i>
              </div>
            ) : unregisteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unregisteredServices.map((service) => (
                  <DiscoveredServiceCart
                    key={service.id}
                    service={service}
                    onCatalogAdded={handleCatalogAdded}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center p-4 bg-gray-50 rounded-md">
                No unregistered services found. All discovered services have
                been added as catalogs.
              </p>
            )}
          </div>
        </TabPanel>
      </TabView>

      {/* Edit Catalog Dialog */}
      <Dialog
        header="Edit Catalog"
        visible={editDialog}
        onHide={() => setEditDialog(false)}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setEditDialog(false)}
            />
            <Button label="Save" icon="pi pi-save" onClick={handleUpdate} />
          </div>
        }
      >
        {selectedCatalog && (
          <div className="p-fluid">
            <div className="field mb-4">
              <label htmlFor="name" className="font-bold">
                Name
              </label>
              <InputText
                id="name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="description" className="font-bold">
                Description
              </label>
              <InputTextarea
                id="description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="address" className="font-bold">
                Service Address
              </label>
              <InputText
                id="address"
                value={editData.address}
                onChange={(e) =>
                  setEditData({ ...editData, address: e.target.value })
                }
              />
              <small className="text-gray-500">Format: http://host:port</small>
            </div>

            <div className="field mb-4">
              <label htmlFor="apiKey" className="font-bold">
                API Key
              </label>
              <Password
                id="apiKey"
                value={editData.private_key}
                onChange={(e) =>
                  setEditData({ ...editData, private_key: e.target.value })
                }
                feedback={false}
                toggleMask
                className="w-full"
              />
              <small className="text-gray-500">
                Update the API key/private key if needed
              </small>
            </div>
          </div>
        )}
      </Dialog>

      {/* Create Catalog Dialog */}
      <Dialog
        header="Create Catalog"
        visible={createDialog}
        onHide={() => setCreateDialog(false)}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setCreateDialog(false)}
            />
            <Button label="Create" icon="pi pi-plus" onClick={handleCreate} />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="createName" className="font-bold">
              Name
            </label>
            <InputText
              id="createName"
              value={newCatalogData.name}
              onChange={(e) =>
                setNewCatalogData({ ...newCatalogData, name: e.target.value })
              }
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="createDescription" className="font-bold">
              Description
            </label>
            <InputTextarea
              id="createDescription"
              value={newCatalogData.description}
              onChange={(e) =>
                setNewCatalogData({
                  ...newCatalogData,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="createAddress" className="font-bold">
              Service Address
            </label>
            <InputText
              id="createAddress"
              value={newCatalogData.address}
              onChange={(e) =>
                setNewCatalogData({
                  ...newCatalogData,
                  address: e.target.value,
                })
              }
            />
            <small className="text-gray-500">Format: http://host:port</small>
          </div>

          <div className="field mb-4">
            <label htmlFor="createApiKey" className="font-bold">
              API Key
            </label>
            <Password
              id="createApiKey"
              value={newCatalogData.private_key}
              onChange={(e) =>
                setNewCatalogData({
                  ...newCatalogData,
                  private_key: e.target.value,
                })
              }
              feedback={false}
              toggleMask
              className="w-full"
            />
            <small className="text-gray-500">
              Enter the API key/private key for this catalog
            </small>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Settings;
