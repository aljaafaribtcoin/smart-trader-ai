import { ApiResponse, ApiError } from '@/types';
import { API_CONFIG, ERROR_MESSAGES } from '../constants';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await this.handleError(response);
      return {
        data: null,
        error,
        status: response.status,
      };
    }

    try {
      const data = await response.json();
      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'PARSE_ERROR',
          message: 'فشل تحليل استجابة الخادم',
        },
        status: response.status,
      };
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        code: errorData.code || `HTTP_${response.status}`,
        message: errorData.message || this.getErrorMessage(response.status),
        details: errorData.details,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: this.getErrorMessage(response.status),
      };
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN;
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      // Add authentication headers here when needed
      // 'Authorization': `Bearer ${token}`
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.baseURL);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            data: null,
            error: {
              code: 'TIMEOUT',
              message: ERROR_MESSAGES.TIMEOUT,
            },
            status: 408,
          };
        }
        return {
          data: null,
          error: {
            code: 'NETWORK_ERROR',
            message: ERROR_MESSAGES.NETWORK_ERROR,
          },
          status: 0,
        };
      }
      return {
        data: null,
        error: {
          code: 'UNKNOWN',
          message: ERROR_MESSAGES.UNKNOWN,
        },
        status: 0,
      };
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            code: 'TIMEOUT',
            message: ERROR_MESSAGES.TIMEOUT,
          },
          status: 408,
        };
      }
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: ERROR_MESSAGES.NETWORK_ERROR,
        },
        status: 0,
      };
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            code: 'TIMEOUT',
            message: ERROR_MESSAGES.TIMEOUT,
          },
          status: 408,
        };
      }
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: ERROR_MESSAGES.NETWORK_ERROR,
        },
        status: 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            code: 'TIMEOUT',
            message: ERROR_MESSAGES.TIMEOUT,
          },
          status: 408,
        };
      }
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: ERROR_MESSAGES.NETWORK_ERROR,
        },
        status: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
