"use client";

export async function signedCloudinaryUpload({
  file,
  folder = "APM/admin",
  resourceType = "image",
}: {
  file: File;
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
}): Promise<{ secureUrl: string; publicId: string }> {
  const sigRes = await fetch("/api/admin/media/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });
  if (!sigRes.ok) throw new Error("Failed to get upload signature");
  const sig = await sigRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType || resourceType}/upload`;
  const upRes = await fetch(endpoint, { method: "POST", body: form });
  const up = await upRes.json();
  if (!upRes.ok || !up.secure_url) {
    throw new Error(up?.error?.message || "Upload failed");
  }
  return { secureUrl: up.secure_url, publicId: up.public_id };
}

