"use client";

import { useEffect, useRef, useState } from "react";

export default function DocumentSection({
  entityType,
  entityId,
}: {
  entityType: "buyer" | "seller";
  entityId: number;
}) {
  const [docs, setDocs] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    const res = await fetch(
      `/api/documents/list?entity_type=${entityType}&entity_id=${entityId}`
    );
    setDocs(await res.json());
  }

  async function uploadFile(file: File) {
  const raw = localStorage.getItem("loggedUser");
  if (!raw) {
    alert("Not logged in");
    return;
  }

  



  const user = JSON.parse(raw);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType);
  formData.append("entity_id", String(entityId));
  formData.append(
    "tenant_id",
    String(user.tenant_id ?? user.tenantId)
  );
  formData.append("uploaded_by", String(user.id));

  await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  loadDocs();
}

async function deleteDocument(docId: number) {
  if (!confirm("Are you sure you want to delete this document?")) {
    return;
  }

  await fetch(`/api/documents/${docId}`, {
    method: "DELETE",
  });

  loadDocs(); // 🔄 refresh documents list
}


  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-semibold mb-3">Documents</h3>

      <button
        onClick={() => fileRef.current?.click()}
        className="text-sm text-blue-600 underline"
      >
        Upload Document
      </button>

      <input
        type="file"
        ref={fileRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadFile(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {docs.length === 0 ? (
        <p className="text-xs text-gray-400 mt-2">
          No documents uploaded
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {docs.map((d) => (
            <li
  key={d.id}
  className="flex items-center justify-between text-sm"
>
  <div className="flex items-center gap-2">
    📄
    <a
      href={d.file_path}
      target="_blank"
      className="text-blue-600 underline"
    >
      {d.file_name}
    </a>
  </div>

  <button
    onClick={() => deleteDocument(d.id)}
    className="text-red-500 text-xs hover:underline"
  >
    Delete
  </button>
</li>

          ))}
        </ul>
      )}

      
    </div>
  );
} 

