import { Catalog } from "../types/Catalog";

export const getCatalogs = async (): Promise<Catalog[]> => {
  const response = await fetch("/catalogs/", {
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

export const createCatalog = async (
  catalog: CreateCatalogDto
): Promise<Catalog> => {
  console.log(catalog);

  const response = await fetch("/catalogs/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(catalog),
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to create catalog");
  }

  const data = await response.json();
  return data as Catalog;
};
