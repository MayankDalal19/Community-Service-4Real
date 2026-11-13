import api from "./api";
import axios from "axios";

export const reportsService = {
  // Get all analytics and charts data
  getSummary: () => api.get("/reports/summary"),

  // Download raw CSV export for a specific module
  downloadCsv: async (moduleName) => {
    const token = localStorage.getItem("sahyog_token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await axios.get(`${baseURL}/reports/export/${moduleName}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      responseType: "blob",
    });

    // Create a blob URL and trigger file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sahyog_${moduleName}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
