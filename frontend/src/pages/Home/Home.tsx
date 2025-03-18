import { Theme } from "../../types/Theme";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { convertBytes } from "../../utils/utils";
import { Catalog } from "../../types/Catalog";

interface HomeProps {
  setSelectedMenu: (menu: string) => void;
  selectedCatalog: Catalog;
}

export default function HomePage({
  setSelectedMenu,
  selectedCatalog,
}: HomeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState<string>("");
  const [newThemeDialogVisible, setNewThemeDialogVisible] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);

        const response = await fetch(selectedCatalog.address + "/themes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${selectedCatalog.private_key}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch themes");
        }
        const data = await response.json();
        setThemes(data);
      } catch (error) {
        console.error("Error fetching themes:", error);
        setError(true);
        setErrorMsg("An error occurred while fetching the themes");
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [selectedCatalog.address, selectedCatalog.private_key]);

  const handleReload = () => {
    fetch(selectedCatalog.address + "/theme/reload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${selectedCatalog.private_key}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        setSuccessMsg("Data reloaded successfully");
        reloadData();
      } else {
        setErrorMsg("An error occurred while reloading the data");
      }
    });

    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 5000);
  };

  const handleDeleteTheme = (theme: Theme) => {
    fetch(selectedCatalog.address + `/theme?name=${theme.name}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${selectedCatalog.private_key}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        setSuccessMsg("Theme deleted successfully");
        reloadData();
      } else {
        setErrorMsg("An error occurred while deleting the theme");
      }
    });

    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 5000);
  };

  const handleCreateTheme = () => {
    fetch(selectedCatalog.address + `/theme?name=${newThemeName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${selectedCatalog.private_key}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        setSuccessMsg("Theme created successfully");
        setNewThemeDialogVisible(false);
        setNewThemeName("");
        reloadData();
      } else {
        setErrorMsg("An error occurred while creating the theme");
      }
    });

    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 5000);
  };

  const reloadData = () => {
    fetch(selectedCatalog.address + "/themes", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setThemes(data);
      })
      .catch(() => {
        setErrorMsg("An error occurred while fetching the data");
      });

    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 5000);
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center">An error occurred</p>;
  }

  return (
    <div>
      <h2 className="text-2xl mb-6">Home</h2>

      <h3>Welcome to the Home Page</h3>

      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      <div className="mt-4 mb-4">
        <Button
          label="Create a new theme"
          icon="pi pi-plus"
          style={{ marginRight: "20px" }}
          onClick={() => setNewThemeDialogVisible(true)}
        />
        <Button
          label="Reload API data"
          icon="pi pi-refresh"
          className="p-button-raised"
          severity="success"
          style={{ marginRight: "20px" }}
          onClick={handleReload}
        />
        <Button
          label="API Docs"
          icon="pi pi-info"
          className="p-button-raised"
          severity="info"
          onClick={() => {
            window.location.href = window.location.origin + "/apidocs/";
          }}
        />
      </div>

      <Dialog
        header="Create a New Theme"
        visible={newThemeDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setNewThemeDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="themeName">Theme Name</label>
            <InputText
              id="themeName"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
            />
          </div>
          <Button
            label="Create"
            icon="pi pi-check"
            onClick={handleCreateTheme}
          />
        </div>
      </Dialog>

      <h4 className="text-2xl">Folders: </h4>
      {themes && themes?.length > 0 ? (
        <div className="grid grid-cols-3">
          {themes
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((theme) => (
              <div
                className="card flex justify-content-center"
                key={theme.name}
              >
                <Card
                  key={theme.name}
                  title={"Folder " + theme.name}
                  subTitle={`Enigmes: ${theme.enigmes_count}`}
                  header=<>
                    <img
                      alt="Card"
                      src="https://primefaces.org/cdn/primereact/images/usercard.png"
                    />
                  </>
                  footer=<>
                    <Button
                      label="Consult"
                      icon="pi pi-check"
                      style={{ marginRight: "10px" }}
                      onClick={() => setSelectedMenu("Theme/" + theme.name)}
                    />
                    <Button
                      label="Delete"
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={() => handleDeleteTheme(theme)}
                    />
                  </>
                  className="md:w-25rem"
                >
                  <p>
                    <strong>Size:</strong> {convertBytes(theme.size)}
                  </p>
                </Card>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center">No themes found</p>
      )}
    </div>
  );
}
