import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type { 
  LoginCredentials, 
  LoginResponse, 
  Product, 
  ProductGroup, 
  Review, 
  CreateReviewPayload,
  ApiResponse,
  Admin
} from '../types'

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://coffeecamp.ru/api/',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include credentials
api.interceptors.request.use((config) => {
  // Set withCredentials to true to include cookies in cross-site requests
  config.withCredentials = true
  return config
})

// Error handling helper
function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error)
    }
  }
  throw error instanceof Error ? error : new Error('An unknown error occurred')
}

// Auth services
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>('/login', credentials, {
      withCredentials: true // Ensure cookies are included
    })
    return data
  } catch (error) {
    return handleError(error)
  }
}

export async function checkAuthStatus(): Promise<{ authenticated: boolean; admin: Admin | null }> {
  try {
    const { data } = await api.get<{ authenticated: boolean; admin: Admin }>('/check-auth', {
      withCredentials: true
    })
    return data
  } catch (error) {
    return { authenticated: false, admin: null }
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/logout', {}, { withCredentials: true })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Product services
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await api.get<ApiResponse<{ products: Product[] }>>('/products')
    return data.products || []
  } catch (error) {
    return handleError(error)
  }
}

export async function createProduct(productData: FormData): Promise<Product> {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    const { data } = await api.post<ApiResponse<{ product: Product }>>('/products', productData, config)
    return data.product
  } catch (error) {
    return handleError(error)
  }
}

export async function updateProduct(id: number, productData: FormData): Promise<Product> {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    const { data } = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, productData, config)
    return data.product
  } catch (error) {
    return handleError(error)
  }
}

// Product Group services
export async function getProductGroups(): Promise<ProductGroup[]> {
  try {
    const { data } = await api.get<ApiResponse<{ productGroups: ProductGroup[] }>>('/product-groups')
    return data.productGroups || []
  } catch (error) {
    return handleError(error)
  }
}

export async function createProductGroup(groupData: Partial<ProductGroup>): Promise<ProductGroup> {
  try {
    const { data } = await api.post<ApiResponse<{ productGroup: ProductGroup }>>('/product-groups', groupData)
    return data.productGroup
  } catch (error) {
    return handleError(error)
  }
}

export async function updateProductGroup(id: number, groupData: Partial<ProductGroup>): Promise<ProductGroup> {
  try {
    const { data } = await api.put<ApiResponse<{ productGroup: ProductGroup }>>(`/product-groups/${id}`, groupData)
    return data.productGroup
  } catch (error) {
    return handleError(error)
  }
}

// Review services
export async function getReviews(): Promise<Review[]> {
  try {
    const { data } = await api.get<ApiResponse<{ reviews: Review[] }>>('/reviews')
    return data.reviews || []
  } catch (error) {
    return handleError(error)
  }
}

export async function createReview(reviewData: CreateReviewPayload): Promise<Review> {
  try {
    const { data } = await api.post<ApiResponse<{ review: Review }>>('/reviews', reviewData)
    return data.review
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteReview(id: number): Promise<void> {
  try {
    await api.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`)
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await api.delete<ApiResponse<{ message: string }>>(`/products/${id}`)
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteProductGroup(id: number): Promise<void> {
  try {
    await api.delete<ApiResponse<{ message: string }>>(`/product-groups/${id}`)
  } catch (error) {
    return handleError(error)
  }
}