import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  User,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCatalogUsers,
  updateCatalogUsers,
  fetchIsOwner,
} from "../../services/usersService";
import { getCatalogs } from "../../services/catalogsService";
import { useAuth } from "../../contexts/AuthContext";
import { Catalog } from "../../types/Catalog";

const TeamPage = () => {
  const { username } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [accessDialogVisible, setAccessDialogVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    is_owner: false,
  });

  const [editedUser, setEditedUser] = useState({
    username: "",
    is_owner: false,
  });

  const [selectedCatalogIds, setSelectedCatalogIds] = useState<number[]>([]);

  const toast = useRef<Toast>(null);

  // Load users and catalogs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, catalogsData, isOwner] = await Promise.all([
          getUsers(),
          getCatalogs(),
          fetchIsOwner(username),
        ]);

        setUsers(usersData);
        setCatalogs(catalogsData);
        setIsOwner(isOwner);
      } catch (error) {
        console.error("Failed to load data:", error);
        showError("Failed to load users and catalogs");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  // Show toast messages
  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 5000,
    });
  };

  // Handle form submissions
  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.password) {
        showError("Username and password are required");
        return;
      }

      await createUser(newUser);
      showSuccess(`User ${newUser.username} created successfully`);
      setCreateDialogVisible(false);
      setNewUser({ username: "", password: "", is_owner: false });

      // Reload users
      const usersData = await getUsers();
      setUsers(
        usersData.map((user) => ({
          ...user,
          last_connected: user.last_connected || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to create user:", error);
      showError("Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser || !editedUser.username) {
        showError("Username is required");
        return;
      }

      await updateUser(selectedUser.id, editedUser);
      showSuccess(`User ${editedUser.username} updated successfully`);
      setEditDialogVisible(false);

      // Reload users
      const usersData = await getUsers();
      setUsers(
        usersData.map((user) => ({
          ...user,
          last_connected: user.last_connected || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to update user:", error);
      showError("Failed to update user");
    }
  };

  const confirmDeleteUser = (user: User) => {
    confirmDialog({
      message: `Are you sure you want to delete user ${user.username}?`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteUser(user),
    });
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id);
      showSuccess(`User ${user.username} deleted successfully`);

      // Remove user from the list
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      showError("Failed to delete user");
    }
  };

  // Open catalog access management dialog
  const handleManageAccess = async (user: User) => {
    try {
      setSelectedUser(user);
      setAccessLoading(true);
      setAccessDialogVisible(true);

      // Fetch which catalogs this user has access to
      const catalogAccess = await getCatalogUsers(user.id.toString());
      setSelectedCatalogIds(catalogAccess);
    } catch (error) {
      console.error("Failed to get catalog access:", error);
      showError("Failed to load catalog access information");
    } finally {
      setAccessLoading(false);
    }
  };

  // Save catalog access changes
  const handleSaveAccess = async () => {
    try {
      if (!selectedUser) return;

      setAccessLoading(true);

      // Update access for each catalog
      for (const catalog of catalogs) {
        // Get current users with access to this catalog
        const currentUserIds = await getCatalogUsers(catalog.id);

        // If user should have access but doesn't
        if (selectedCatalogIds.includes(Number(catalog.id))) {
          if (!currentUserIds.includes(selectedUser.id)) {
            await updateCatalogUsers(catalog.id, [
              ...currentUserIds,
              selectedUser.id,
            ]);
          }
        }
        // If user shouldn't have access but does
        else {
          if (currentUserIds.includes(selectedUser.id)) {
            await updateCatalogUsers(
              catalog.id,
              currentUserIds.filter((id) => id !== selectedUser.id)
            );
          }
        }
      }

      showSuccess("Catalog access updated successfully");
      setAccessDialogVisible(false);
    } catch (error) {
      console.error("Failed to update catalog access:", error);
      showError("Failed to update catalog access");
    } finally {
      setAccessLoading(false);
    }
  };

  // Handle checkbox changes for catalog access
  const handleCatalogCheckboxChange = (
    e: CheckboxChangeEvent,
    catalogId: string
  ) => {
    if (e.checked) {
      setSelectedCatalogIds([...selectedCatalogIds, Number(catalogId)]);
    } else {
      setSelectedCatalogIds(
        selectedCatalogIds.filter((id) => id !== Number(catalogId))
      );
    }
  };

  // DataTable column templates
  const lastLoginTemplate = (rowData: User) => {
    if (!rowData.last_connected) return <span>Never</span>;

    const loginDate = new Date(rowData.last_connected);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let severity: "success" | "info" | "warning" | "danger" = "success";
    if (diffDays > 30) severity = "danger";
    else if (diffDays > 7) severity = "warning";
    else if (diffDays > 2) severity = "info";

    // If diffDays is between -1 and 1, show "Today" or "Yesterday"
    if (diffDays >= -1 && diffDays < 1) {
      return (
        <Tag
          severity="success"
          value={diffDays === 0 ? "Today" : "Yesterday"}
          className="mr-2"
        />
      );
    }

    return (
      <div>
        <Tag
          severity={severity}
          value={`${diffDays} days ago`}
          className="mr-2"
        />
        <span className="text-xs text-gray-500">
          {loginDate.toLocaleDateString()} {loginDate.toLocaleTimeString()}
        </span>
      </div>
    );
  };

  const roleTemplate = (rowData: User) => {
    return (
      <Tag
        severity={rowData.is_owner ? "warning" : "info"}
        value={rowData.is_owner ? "Admin" : "User"}
        icon={rowData.is_owner ? "pi pi-shield" : "pi pi-user"}
      />
    );
  };

  const actionsTemplate = (rowData: User) => {
    const isCurrentUser = rowData.username === username;

    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => {
            setSelectedUser(rowData);
            setEditedUser({
              username: rowData.username,
              is_owner: rowData.is_owner,
            });
            setEditDialogVisible(true);
          }}
          tooltip="Edit user"
          disabled={!isOwner}
        />
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => handleManageAccess(rowData)}
          tooltip="Manage catalog access"
          disabled={!isOwner}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteUser(rowData)}
          tooltip="Delete user"
          disabled={isCurrentUser || !isOwner}
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Button
          label="Add User"
          icon="pi pi-user-plus"
          onClick={() => setCreateDialogVisible(true)}
          disabled={!isOwner}
        />
      </div>

      <div className="card shadow-md">
        <DataTable
          value={users}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No users found"
          sortField="username"
          sortOrder={1}
          className="p-datatable-sm"
          stripedRows
        >
          <Column field="username" header="Username" sortable />
          <Column field="is_owner" header="Role" body={roleTemplate} sortable />
          <Column
            field="last_connected"
            header="Last Login"
            body={lastLoginTemplate}
            sortable
            sortField="last_connected"
          />
          <Column
            body={actionsTemplate}
            header="Actions"
            style={{ width: "15rem" }}
          />
        </DataTable>
      </div>

      {/* Create user dialog */}
      <Dialog
        header="Create New User"
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        style={{ width: "450px" }}
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setCreateDialogVisible(false)}
            />
            <Button
              label="Create"
              icon="pi pi-check"
              onClick={handleCreateUser}
            />
          </>
        }
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="username" className="font-bold block mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="password" className="font-bold block mb-2">
              Password
            </label>
            <Password
              id="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              toggleMask
              feedback={true}
              required
            />
            <small className="text-gray-500">
              Password must be at least 6 characters long
            </small>
          </div>

          <div className="field-checkbox mb-4">
            <Checkbox
              inputId="is_owner"
              checked={newUser.is_owner}
              onChange={(e) =>
                setNewUser({ ...newUser, is_owner: e.checked as boolean })
              }
            />
            <label htmlFor="is_owner" className="ml-2">
              Admin privileges
            </label>
          </div>
        </div>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog
        header={`Edit User: ${selectedUser?.username}`}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        style={{ width: "450px" }}
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setEditDialogVisible(false)}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleUpdateUser}
            />
          </>
        }
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="edit_username" className="font-bold block mb-2">
              Username
            </label>
            <InputText
              id="edit_username"
              value={editedUser.username}
              onChange={(e) =>
                setEditedUser({ ...editedUser, username: e.target.value })
              }
              required
            />
          </div>

          <div className="field-checkbox mb-4">
            <Checkbox
              inputId="edit_is_owner"
              checked={editedUser.is_owner}
              onChange={(e) =>
                setEditedUser({ ...editedUser, is_owner: e.checked as boolean })
              }
            />
            <label htmlFor="edit_is_owner" className="ml-2">
              Admin privileges
            </label>
          </div>

          <Divider align="center">
            <span className="text-xs font-semibold text-gray-400 px-2">
              Password changes require a separate form
            </span>
          </Divider>
        </div>
      </Dialog>

      {/* Catalog access dialog */}
      <Dialog
        header={`Catalog Access for ${selectedUser?.username}`}
        visible={accessDialogVisible}
        onHide={() => setAccessDialogVisible(false)}
        style={{ width: "600px" }}
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setAccessDialogVisible(false)}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSaveAccess}
              loading={accessLoading}
            />
          </>
        }
      >
        {accessLoading ? (
          <div className="flex justify-center items-center p-6">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <div>
            <p className="mb-3 text-gray-600">
              Select which catalogs this user should have access to:
            </p>

            <div className="catalog-access-grid grid grid-cols-1 md:grid-cols-2 gap-3">
              {catalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  className="catalog-access-item p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="field-checkbox mb-0">
                    <Checkbox
                      inputId={`catalog_${catalog.id}`}
                      checked={selectedCatalogIds.includes(Number(catalog.id))}
                      onChange={(e) =>
                        handleCatalogCheckboxChange(e, catalog.id)
                      }
                    />
                    <label
                      htmlFor={`catalog_${catalog.id}`}
                      className="ml-2 font-medium"
                    >
                      {catalog.name}
                    </label>
                  </div>
                  {catalog.description && (
                    <div className="ml-6 mt-1">
                      <span className="text-xs text-gray-500">
                        {catalog.description}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {catalogs.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No catalogs available. Create catalogs first to manage access.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default TeamPage;
