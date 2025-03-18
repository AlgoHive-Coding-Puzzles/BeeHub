import { Service } from "../types/Service";

export const getServices = async (): Promise<Service[]> => {
  const response = await fetch("/services/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  const data = await response.json();
  return data as Service[];
};
