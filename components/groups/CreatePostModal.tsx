import { useState } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    postType: string;
    title: string;
    description: string;
    location: string;
    budget: string;
  }) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    postType: "requirement",
    title: "",
    description: "",
    location: "",
    budget: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter post title");
      return;
    }

    onSubmit(formData);

    setFormData({
      postType: "requirement",
      title: "",
      description: "",
      location: "",
      budget: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Create <span className="text-blue-600">Post</span>
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* GRID (same as Buyer/User) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* POST TYPE */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Post Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.postType}
                onChange={(e) =>
                  setFormData({ ...formData, postType: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="requirement">Requirement</option>
                <option value="offer">Offer</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {/* TITLE */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Looking for 2BHK in Vastrapur"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Write details here..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LOCATION + BUDGET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Vastrapur, Ahmedabad"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Budget (₹)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                placeholder="5000000"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-indigo-700 transition"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
