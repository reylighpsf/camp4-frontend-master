import { useCallback, useEffect, useState } from "react";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/features/admin/pages/components/activities/services/activityApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

export default function useActivityManagement() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getActivities();
      setActivities(data?.data || data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch activities"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivityDetail = useCallback(async (id) => {
    try {
      const { data } = await getActivityById(id);
      setSelectedActivity(data?.data || data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch activity"));
    }
  }, []);

  const handleCreate = useCallback(async (formData) => {
    try {
      await createActivity(formData);
      setActionMessage("Activity created successfully");
      await fetchActivities();
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create activity");
      setActionMessage(message);
      return { success: false, error: message };
    }
  }, [fetchActivities]);

  const handleUpdate = useCallback(async (id, formData) => {
    try {
      await updateActivity(id, formData);
      setActionMessage("Activity updated successfully");
      await fetchActivities();
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update activity");
      setActionMessage(message);
      return { success: false, error: message };
    }
  }, [fetchActivities]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteActivity(id);
      setActionMessage("Activity deleted successfully");
      await fetchActivities();
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete activity");
      setActionMessage(message);
      return { success: false, error: message };
    }
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    selectedActivity,
    loading,
    error,
    actionMessage,
    fetchActivities,
    fetchActivityDetail,
    handleCreate,
    handleUpdate,
    handleDelete,
    setActionMessage,
  };
}
