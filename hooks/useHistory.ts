import { useState, useEffect } from "react";
import { historyService, HistoryItem } from "@/services/historyService";

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب السجل");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await historyService.clearHistory();
      setHistory([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء مسح السجل");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    clearHistory,
  };
};
