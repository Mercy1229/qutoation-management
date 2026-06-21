import axios from "axios";

// const API_BASE = "https://quotation-management-be.onrender.com";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export interface EventService {
  service: string;
  cameras: number;
}

export interface EventItem {
  eventName: string;
  venueName: string;
  venueLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  crowdStrength: number | string;
  services: EventService[];
}

export interface VideoDeliverable {
  name: string;
  qty: number;
  eventName: string;
}

export interface PhotoDeliverable {
  name: string;
  qty: number;
  photosCount: number | string;
  eventName: string;
}

export interface CustomerData {
  customerName: string;
  eventType: string;
  packageName: string;
  eventDate: string;
  location?: string;
  brideName?: string;
  groomName?: string;
  events?: EventItem[];
  videoDeliverables?: VideoDeliverable[];
  photoDeliverables?: PhotoDeliverable[];
  totalPackage?: number;
  discount?: number;
  discount_percentage?: number;
  total: number;
  advancePaid?: number;
  notes?: string;
  imageUrl?: string;
}

export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  const resp = await axios.post(`${API_BASE}/api/upload-image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data; // { url: "/uploads/xxx.jpg" }
}

export async function saveCustomer(data: CustomerData) {
  const resp = await axios.post(`${API_BASE}/api/customers`, data);
  return resp.data;
}

export async function fetchCustomers() {
  const resp = await axios.get(`${API_BASE}/api/customers`);
  return resp.data;
}
export async function fetchCustomerById(id: string) {
  const resp = await axios.get(`${API_BASE}/api/customers/${id}`);
  return resp.data;
}

export async function previewQuotation(data: CustomerData) {
  const resp = await axios.post(`${API_BASE}/api/preview-quotation`, { data }, {
    responseType: "text",
    validateStatus: () => true,
  });

  const contentType = resp.headers["content-type"] || "";
  if (resp.status >= 400 || !contentType.includes("text/html")) {
    throw new Error(`Preview failed (HTTP ${resp.status})`);
  }

  return resp.data;
}

export async function updateCustomer(id: string, data: Partial<CustomerData>) {
  const resp = await axios.put(`${API_BASE}/api/customers/${id}`, data);
  return resp.data;
}

export async function deleteCustomer(id: string) {
  const resp = await axios.delete(`${API_BASE}/api/customers/${id}`);
  return resp.data;
}

export async function generatePdf(data: CustomerData) {
  const resp = await axios.post(`${API_BASE}/api/generate-pdf`, { data }, {
    responseType: "blob",
    validateStatus: () => true,
  });

  const contentType = resp.headers["content-type"] || "";
  if (resp.status >= 400 || !contentType.includes("application/pdf")) {
    let message = `PDF generation failed (HTTP ${resp.status})`;

    try {
      const raw = await resp.data.text();
      const parsed = JSON.parse(raw);
      if (parsed?.error) {
        message = parsed.error;
      }
    } catch {
      // Keep fallback message when payload is not JSON.
    }

    throw new Error(message);
  }

  return resp.data;
}
