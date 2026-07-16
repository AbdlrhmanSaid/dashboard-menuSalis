import axios from "@/lib/axios";

export interface HistoryItem {
  _id: string;
  action: string;
  user: string;
  target: string;
  type: "product" | "branch";
  createdAt: string;
  updatedAt: string;
}

export interface AddHistoryRequest {
  action: string;
  user: string;
  target: string;
  type: "product" | "branch";
}

export const historyService = {
  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await axios.get("/history");
    return response.data;
  },

  addHistory: async (data: AddHistoryRequest): Promise<HistoryItem> => {
    const response = await axios.post("/history", data);
    return response.data.history;
  },

  clearHistory: async (): Promise<void> => {
    await axios.delete("/history");
  },
};
