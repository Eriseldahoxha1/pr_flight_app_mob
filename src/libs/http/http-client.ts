import { AxiosError, AxiosResponse, create } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { deleteItemAsync } from 'expo-secure-store'
import type { AppStore } from '../../store'
import { logout } from '../../store/authSlice'

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim()

const instance = create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let store: AppStore

export const connectHttpClient = (appStore: AppStore) => {
  store = appStore
}

let invalidatingSession: Promise<void> | undefined

instance.interceptors.request.use(
  config => {
    const token = store.getState().auth.accessToken
    const isLoginRequest = config.url === 'login' || config.url === '/login'

    if (isLoginRequest) {
      config.headers.delete('Authorization')
    } else if (token && !config.headers.has('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const token = store.getState().auth.accessToken
    const authorization = error.config?.headers.get('Authorization')

    if (error.response?.status === 401 && token && authorization === `Bearer ${token}`) {
      // Concurrent failures share cleanup; stale requests cannot clear a newer session.
      if (!invalidatingSession) {
        invalidatingSession = deleteItemAsync('session')
          .catch(() => {
            console.warn('Could not remove the saved session')
          })
          .finally(() => {
            if (store.getState().auth.accessToken === token) {
              store.dispatch(logout())
            }
            invalidatingSession = undefined
          })
      }

      await invalidatingSession
    }

    return Promise.reject(error)
  },
)

export class HttpClient {
  static instance = instance

  static async get<T>(url: string, params?: unknown, options?: AxiosRequestConfig) {
    const response = await this.instance.get<T>(url, {
      ...options,
      params,
    })
    return response.data
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await this.instance.post<T>(url, data, options)

    return response.data
  }

  static async put<T>(url: string, data: unknown) {
    const response = await this.instance.put<T>(url, data)

    return response.data
  }

  static async patch<T>(url: string, data: unknown) {
    const response = await this.instance.patch<T>(url, data)

    return response.data
  }

  static async delete<T>(url: string) {
    const response = await this.instance.delete<T>(url)

    return response.data
  }
}
