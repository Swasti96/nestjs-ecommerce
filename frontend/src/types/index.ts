export interface User {
  id: number;
  email: string;
  roles: { id: number; name: string }[];
}

export interface Product {
  id: number;
  title: string;
  code: string;
  isActive: boolean;
  description?: string;
  variationType: string;
  categoryId: number;
  merchantId: number;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  productVariationId: number;
  countryCode: string;
  quantity: number;
  updatedAt: string;
  productVariation?: {
    id: number;
    sizeCode: string;
    colorName: string;
  };
}

export interface LoginResponse {
  accessToken: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  errors: string[];
}