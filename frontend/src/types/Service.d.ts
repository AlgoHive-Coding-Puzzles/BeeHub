export interface Service {
  id: string;
  host: string;
  name: string;
  port: number;
  service_type: "docker" | "local";
  status: "running" | "stopped" | "error";
}
