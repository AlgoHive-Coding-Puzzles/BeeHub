export interface User {
  id: number;
  username: string;
  is_owner: boolean;
  last_connected?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  is_owner: boolean;
}

export interface UpdateUserDto {
  username?: string;
  is_owner?: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/users/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data as User[];
};

export const getUserById = async (userId: number): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  const data = await response.json();
  return data as User;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await fetch("/api/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  const data = await response.json();
  return data as User;
};

export const updateUser = async (
  userId: number,
  updateData: UpdateUserDto
): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const data = await response.json();
  return data as User;
};

export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};

export const getUserCatalogAccess = async (
  userId: number
): Promise<number[]> => {
  const response = await fetch(`/api/users/${userId}/catalogs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user catalog access");
  }

  const data = await response.json();
  return data as number[];
};

export const updateUserCatalogAccess = async (
  userId: number,
  catalogIds: number[]
): Promise<void> => {
  const response = await fetch(`/api/users/${userId}/catalogs`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ catalog_ids: catalogIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user catalog access");
  }
};

export const getCatalogUsers = async (catalogId: string): Promise<number[]> => {
  const response = await fetch(`/api/catalogs/${catalogId}/access`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch catalog users");
  }

  const data = await response.json();
  return data as number[];
};

export const updateCatalogUsers = async (
  catalogId: string,
  userIds: number[]
): Promise<void> => {
  const response = await fetch(`/api/catalogs/${catalogId}/access`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ user_ids: userIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to update catalog users");
  }
};

export const fetchIsOwner = async (
  username: string | null
): Promise<boolean> => {
  if (!username) return false;
  const response = await fetch(`/api/users/${username}/is-owner`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to check user ownership");
  }

  const data = await response.json();
  return data;
};
