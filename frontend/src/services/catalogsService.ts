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
  return data.catalogs as Catalog[];
};
