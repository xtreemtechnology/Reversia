import { useState, useCallback, useEffect } from "react";
import * as activityService from "../services/activityService";

/**
 * useActivity - Main activity tracking hook
 *
 * Manages activity logs and exercise tracking
 *
 * Usage:
 *   const { logs, isLoading, error, logActivity } = useActivity(userId);
 */
export function useActivity(userId) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadActivityLogs();
    }
  }, [userId]);

  const loadActivityLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual activity logs loading
      // const data = await activityService.getActivityLogs(userId);
      // setLogs(data);
    } catch (err) {
      setError(err.message || "Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const logActivity = useCallback(async (activityData) => {
    try {
      const logged = await activityService.logActivityEntry(activityData);
      setLogs((prev) => [logged, ...prev]);
      return logged;
    } catch (err) {
      setError(err.message || "Failed to log activity");
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
    loadActivityLogs,
    logActivity,
    clearError,
  };
}

export default useActivity;
