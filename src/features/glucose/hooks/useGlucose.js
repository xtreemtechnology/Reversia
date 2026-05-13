import { useState, useCallback, useEffect } from "react";
import * as glucoseService from "../services/glucoseService";

/**
 * useGlucose - Main glucose tracking hook
 *
 * Manages glucose logs and monitoring data
 *
 * Usage:
 *   const { logs, isLoading, error, logGlucose } = useGlucose(userId);
 */
export function useGlucose(userId) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadGlucoseLogs();
    }
  }, [userId]);

  const loadGlucoseLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual glucose logs loading
      // const data = await glucoseService.getGlucoseLogs(userId);
      // setLogs(data);
    } catch (err) {
      setError(err.message || "Failed to load glucose logs");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const logGlucose = useCallback(async (glucoseData) => {
    try {
      const logged = await glucoseService.logGlucoseEntry(glucoseData);
      setLogs((prev) => [logged, ...prev]);
      return logged;
    } catch (err) {
      setError(err.message || "Failed to log glucose");
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    logs,
    isLoading,
    error,
    loadGlucoseLogs,
    logGlucose,
    clearError,
  };
}

export default useGlucose;
