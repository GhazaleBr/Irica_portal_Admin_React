import api from "./api";

export async function uploadMedia({
  model,
  file,
  title,
  description,
  imageTypeId = 2,
  onUploadProgress,
}) {
  if (!model) {
    throw new Error("مقدار model برای آپلود مشخص نشده است.");
  }

  if (!file) {
    throw new Error("فایل برای آپلود مشخص نشده است.");
  }

  if (!title?.trim()) {
    throw new Error("عنوان بنر الزامی است.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title.trim());

  if (description?.trim()) {
    formData.append("description", description.trim());
  }

  if (file.type.startsWith("image/")) {
    formData.append("imageTypeId", String(imageTypeId));
  }

  const response = await api.post(
    `/api/admin/media/upload/${encodeURIComponent(model)}`,
    formData,
    {
      onUploadProgress: (event) => {
        if (event.total && onUploadProgress) {
          onUploadProgress(
            Math.round((event.loaded / event.total) * 100)
          );
        }
      },
    }
  );

  return response.data;
}
