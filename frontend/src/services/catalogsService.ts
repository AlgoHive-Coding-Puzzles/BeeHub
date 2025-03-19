import { Catalog } from "../types/Catalog";
import { Theme } from "../types/Theme";

export const getCatalogs = async (): Promise<Catalog[]> => {
  const response = await fetch("/api/catalogs/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch catalogs");
  }
  const data = await response.json();

  return data as Catalog[];
};

export interface CreateCatalogDto {
  address: string;
  private_key: string;
  name: string;
  description?: string;
}

export interface UpdateCatalogDto {
  address?: string;
  private_key?: string;
  name?: string;
  description?: string;
}

export const createCatalog = async (
  catalog: CreateCatalogDto
): Promise<Catalog> => {
  const response = await fetch("/api/catalogs/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(catalog),
  });

  if (!response.ok) {
    throw new Error("Failed to create catalog");
  }

  const data = await response.json();
  return data as Catalog;
};

export const updateCatalog = async (
  catalogId: string,
  updateData: UpdateCatalogDto
): Promise<Catalog> => {
  const response = await fetch(`/api/catalogs/${catalogId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Failed to update catalog");
  }

  const data = await response.json();
  return data as Catalog;
};

export const deleteCatalog = async (catalogId: string): Promise<void> => {
  const response = await fetch(`/api/catalogs/${catalogId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete catalog");
  }
};

export const getCatalogById = async (catalogId: string): Promise<Catalog> => {
  const response = await fetch(`/api/catalogs/${catalogId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch catalog details");
  }

  const data = await response.json();
  return data as Catalog;
};

export const fromCatalogFetchThemes = async (address: string, key: string) => {
  try {
    const response = await fetch(`${address}/themes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch themes");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching themes:", error);
    throw error;
  }
};

export const fromCatalogReload = async (
  address: string,
  key: string
): Promise<Response> => {
  try {
    const response = await fetch(`${address}/theme/reload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to reload themes");
    }
    return response;
  } catch (error) {
    console.error("Error reloading themes:", error);
    throw error;
  }
};

export const fromCatalogDeleteTheme = async (
  address: string,
  key: string,
  themeName: string
): Promise<Response> => {
  try {
    const response = await fetch(`${address}/theme?name=${themeName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete theme");
    }
    return response;
  } catch (error) {
    console.error("Error deleting theme:", error);
    throw error;
  }
};

export const fromCatalogCreateTheme = async (
  address: string,
  key: string,
  themeName: string
): Promise<Response> => {
  try {
    const response = await fetch(`${address}/theme?name=${themeName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to create theme");
    }
    return response;
  } catch (error) {
    console.error("Error creating theme:", error);
    throw error;
  }
};

export const fromCatalogRefreshThemes = async (
  address: string,
  key: string
): Promise<Response> => {
  try {
    const response = await fetch(`${address}/theme/reload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to refresh themes");
    }
    return response;
  } catch (error) {
    console.error("Error refreshing themes:", error);
    throw error;
  }
};

export const fromCatalogUploadPuzzle = async (
  address: string,
  key: string,
  theme: string,
  fileFormData: FormData
) => {
  try {
    const response = await fetch(`${address}/puzzle/upload?theme=${theme}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      body: fileFormData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload puzzle");
    }
    return response;
  } catch (error) {
    console.error("Error uploading puzzle:", error);
    throw error;
  }
};

export const fromCatalogGetTheme = async (
  address: string,
  key: string,
  themeName: string
): Promise<Theme> => {
  try {
    const response = await fetch(`${address}/theme?name=${themeName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get theme");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting theme:", error);
    throw error;
  }
};

export const fromCatalogDeletePuzzle = async (
  address: string,
  key: string,
  themeName: string,
  puzzleName: string
): Promise<Response> => {
  try {
    const response = await fetch(
      `${address}/puzzle?theme=${themeName}&puzzle=${puzzleName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete puzzle");
    }
    return response;
  } catch (error) {
    console.error("Error deleting puzzle:", error);
    throw error;
  }
};
