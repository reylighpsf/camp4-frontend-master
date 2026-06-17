import { useState } from "react";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import useActivityManagement from "@/features/admin/pages/components/activities/hooks/useActivityManagement";
import { confirmAction } from "@/utils/sweetAlert";

export default function ActivityManagement() {
  const {
    activities,
    loading,
    error,
    actionMessage,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useActivityManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const openModal = (activity = null) => {
    if (activity) {
      setEditingId(activity.id);
      setFormData({ name: activity.name, description: activity.description || "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingId 
      ? await handleUpdate(editingId, formData)
      : await handleCreate(formData);
    
    if (result.success) setIsModalOpen(false);
  };

  const onDelete = async (id) => {
    const confirmed = await confirmAction("Delete this activity?", "You won't be able to revert this!");
    if (confirmed) await handleDelete(id);
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      <AdminSidebar active="activities" />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gym Activity Management</h1>
          <button 
            onClick={() => openModal()}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add New Activity
          </button>
        </div>

        {error && <div className="bg-red-500/20 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
        {actionMessage && <div className="bg-green-500/20 text-green-500 p-4 rounded-lg mb-6">{actionMessage}</div>}

        <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-sm">Activity Name</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm">Description</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-neutral-400">Loading activities...</td></tr>
              ) : activities.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-neutral-400">No activities found</td></tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-neutral-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{activity.name}</td>
                    <td className="px-6 py-4 text-neutral-400">{activity.description || "-"}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(activity)}
                        className="text-blue-400 hover:text-blue-300 px-2 py-1"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(activity.id)}
                        className="text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Activity" : "Create New Activity"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none h-24"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 px-6 py-2 rounded-lg font-medium"
                >
                  {editingId ? "Save Changes" : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
