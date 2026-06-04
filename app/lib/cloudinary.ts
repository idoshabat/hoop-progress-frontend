const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured.");
  }

  return { cloudName, uploadPreset };
}

export function validateProfileImageFile(file: File) {
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Profile photo must be smaller than 10MB.");
  }
}

export async function uploadProfileImageToCloudinary(file: File) {
  validateProfileImageFile(file);

  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "hoopprogress/profile-photos");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload profile photo.");
  }

  const data = await res.json();
  return data.secure_url as string;
}
