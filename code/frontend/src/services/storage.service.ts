import axiosInstance from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StorageUploadResponse {
  objectKey: string;
  url: string;
  contentType: string;
  size: number;
}

export const uploadProductImage = async (file: File): Promise<StorageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<ApiResponse<StorageUploadResponse>>(
    "/storage/products/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};
