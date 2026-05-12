// API Service for Workzy Backend Integration

import { ENV } from '../config/env';

// Use a safe way to access API URL
const getApiBaseUrl = (): string => {
  // Try to get from window object (can be set by build process)
  if (typeof window !== 'undefined') {
    const windowEnv = (window as any).__ENV__;
    if (windowEnv?.REACT_APP_API_URL) {
      return windowEnv.REACT_APP_API_URL;
    }
  }
  
  // Use configuration fallback
  return ENV.API_URL;
};

const API_BASE_URL = getApiBaseUrl();

// Mock data when the API is unreachable (never used for /auth — real credentials only)
const SMART_FALLBACK = true;

/** Auth, messaging, and profile mutations must hit the real API (no mock fallback). */
function requiresRealBackend(endpoint: string, options: RequestInit = {}): boolean {
  if (endpoint.startsWith('/auth')) return true;
  if (endpoint.startsWith('/messages')) return true;
  if (endpoint.startsWith('/users/lookup')) return true;
  const method = (options.method || 'GET').toUpperCase();
  if (endpoint === '/users/profile' && method === 'PUT') return true;
  if (endpoint === '/users/avatar' && method === 'POST') return true;
  return false;
}

// API Response Types
interface ApiResponse<T = any> {
  message: string;
  data?: T;
  user?: any;
  users?: any;
  jobs?: any;
  job?: any;
  freelancers?: any;
  proposals?: any;
  projects?: any;
  conversations?: any;
  notifications?: any;
  token?: string;
  stats?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth token management
let authToken = '';

// Initialize token safely
const getStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

// Initialize token on module load (client-side only)
if (typeof window !== 'undefined') {
  authToken = getStoredToken();
}

const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('authToken', token);
  }
};

const removeAuthToken = () => {
  authToken = '';
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('authToken');
  }
};

// HTTP request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  
  const defaultHeaders: HeadersInit = isFormData ? {} : {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      let msg = (errorData as { message?: string }).message || `HTTP error! status: ${response.status}`;
      const details = (errorData as { details?: { message?: string }[] }).details;
      if (Array.isArray(details) && details.length > 0 && details[0]?.message) {
        msg = details[0].message;
      }
      throw new Error(msg);
    }

    return await response.json();
  } catch (error) {
    if (requiresRealBackend(endpoint, options)) {
      console.error('API request failed:', error);
      throw error instanceof Error ? error : new Error('Authentication failed');
    }
    if (SMART_FALLBACK) {
      console.warn('Backend unavailable, using mock data:', error);
      return getMockResponse<T>(endpoint, options);
    }
    console.error('API Request Error:', error);
    throw error instanceof Error ? error : new Error('Request failed');
  }
}

// Mock response generator for development (auth is never mocked — see apiRequest)
function getMockResponse<T>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
  const method = options.method || 'GET';

  // Mock jobs responses
  if (endpoint.startsWith('/jobs')) {
    if (method === 'POST' && endpoint === '/jobs') {
      // Mock job creation
      const mockJob = {
        id: 'mock-job-' + Date.now(),
        title: 'Mock Job',
        description: 'This is a mock job created in development mode',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      
      return {
        message: 'Job created successfully',
        job: mockJob
      } as ApiResponse<T>;
    }
    
    if (method === 'GET' && endpoint === '/jobs/user/posted') {
      return {
        message: 'Jobs retrieved successfully',
        jobs: []
      } as ApiResponse<T>;
    }
    
    if (method === 'GET') {
      return {
        message: 'Jobs retrieved successfully',
        jobs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      } as ApiResponse<T>;
    }
  }
  
  // Mock projects responses
  if (endpoint.startsWith('/projects')) {
    if (endpoint === '/projects/user') {
      return {
        message: 'Projects retrieved successfully',
        projects: []
      } as ApiResponse<T>;
    }
    
    if (endpoint === '/projects/stats/overview') {
      return {
        message: 'Stats retrieved successfully',
        stats: {
          totalEarnings: 0,
          activeProjects: 0,
          completedProjects: 0
        }
      } as ApiResponse<T>;
    }
  }
  
  // Mock notifications responses
  if (endpoint.startsWith('/notifications')) {
    return {
      message: 'Notifications retrieved successfully',
      notifications: []
    } as ApiResponse<T>;
  }
  
  // Default mock response
  return {
    message: 'Mock response',
    data: [] as any
  } as ApiResponse<T>;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'FREELANCER' | 'CLIENT';
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.user && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.user && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  logout: () => {
    removeAuthToken();
  },
};

// User API
export const userAPI = {
  lookupByEmail: async (email: string) => {
    const q = encodeURIComponent(email.trim());
    return apiRequest(`/users/lookup?email=${q}`);
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getUserProfile: async (userId: string) => {
    return apiRequest(`/users/${userId}`);
  },

  searchFreelancers: async (params: {
    query?: string;
    skills?: string;
    minRate?: string;
    maxRate?: string;
    experienceLevel?: string;
    location?: string;
    page?: string;
    limit?: string;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    return apiRequest(`/users/search/freelancers?${searchParams.toString()}`);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiRequest('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
};

// Jobs API
export const jobsAPI = {
  createJob: async (jobData: {
    title: string;
    description: string;
    requirements: string;
    skills: string[];
    category: string;
    budgetType: 'FIXED' | 'HOURLY';
    fixedBudget?: number;
    hourlyRate?: number;
    duration: string;
    experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
    isUrgent?: boolean;
  }) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  getAllJobs: async (params: {
    query?: string;
    category?: string;
    budgetType?: string;
    minBudget?: string;
    maxBudget?: string;
    experienceLevel?: string;
    skills?: string;
    isUrgent?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    return apiRequest(`/jobs?${searchParams.toString()}`);
  },

  getJobById: async (jobId: string) => {
    return apiRequest(`/jobs/${jobId}`);
  },

  updateJob: async (jobId: string, jobData: any) => {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  deleteJob: async (jobId: string) => {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  getUserPostedJobs: async () => {
    return apiRequest('/jobs/user/posted');
  },
};

// Proposals API
export const proposalsAPI = {
  createProposal: async (proposalData: {
    jobId: string;
    coverLetter: string;
    proposedBudget: number;
    timeline: string;
  }) => {
    return apiRequest('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  },

  getJobProposals: async (jobId: string) => {
    return apiRequest(`/proposals/job/${jobId}`);
  },

  getUserProposals: async () => {
    return apiRequest('/proposals/user/sent');
  },

  acceptProposal: async (proposalId: string) => {
    return apiRequest(`/proposals/${proposalId}/accept`, {
      method: 'POST',
    });
  },

  rejectProposal: async (proposalId: string) => {
    return apiRequest(`/proposals/${proposalId}/reject`, {
      method: 'POST',
    });
  },

  getProposalById: async (proposalId: string) => {
    return apiRequest(`/proposals/${proposalId}`);
  },
};

// Projects API
export const projectsAPI = {
  getUserProjects: async () => {
    return apiRequest('/projects/user');
  },

  getProjectById: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}`);
  },

  updateProjectStatus: async (projectId: string, status: string) => {
    return apiRequest(`/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  signAgreement: async (projectId: string, terms?: string) => {
    return apiRequest(`/projects/${projectId}/sign-agreement`, {
      method: 'POST',
      body: JSON.stringify({ terms }),
    });
  },

  releaseEscrow: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/release-escrow`, {
      method: 'POST',
    });
  },

  getProjectStats: async () => {
    return apiRequest('/projects/stats/overview');
  },
};

// Messages API
export const messagesAPI = {
  sendMessage: async (messageData: {
    receiverId?: string;
    receiverEmail?: string;
    recipientName?: string;
    content: string;
  }) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  getConversations: async () => {
    return apiRequest('/messages/conversations');
  },

  getConversationMessages: async (conversationId: string, page = 1, limit = 50) => {
    return apiRequest(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
  },

  getUnreadCount: async () => {
    return apiRequest('/messages/unread/count');
  },

  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('attachment', file);
    
    return apiRequest('/messages/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: async (paymentData: {
    projectId: string;
    amount: number;
  }) => {
    return apiRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  confirmPayment: async (confirmData: {
    paymentIntentId: string;
    projectId: string;
  }) => {
    return apiRequest('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(confirmData),
    });
  },

  getPaymentHistory: async (page = 1, limit = 20) => {
    return apiRequest(`/payments/history?page=${page}&limit=${limit}`);
  },

  getPaymentStats: async () => {
    return apiRequest('/payments/stats');
  },
};

// Reviews API
export const reviewsAPI = {
  createReview: async (reviewData: {
    projectId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    isPublic?: boolean;
  }) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getUserReviews: async (userId: string, page = 1, limit = 10) => {
    return apiRequest(`/reviews/user/${userId}?page=${page}&limit=${limit}`);
  },

  getGivenReviews: async (page = 1, limit = 10) => {
    return apiRequest(`/reviews/given?page=${page}&limit=${limit}`);
  },

  getProjectReviews: async (projectId: string) => {
    return apiRequest(`/reviews/project/${projectId}`);
  },

  getReviewStats: async (userId: string) => {
    return apiRequest(`/reviews/stats/${userId}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (page = 1, limit = 20, isRead?: boolean) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (isRead !== undefined) params.append('isRead', isRead.toString());
    
    return apiRequest(`/notifications?${params.toString()}`);
  },

  getUnreadCount: async () => {
    return apiRequest('/notifications/unread/count');
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  deleteNotification: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Export auth token utilities
export { setAuthToken, removeAuthToken };

// Export all APIs
export default {
  auth: authAPI,
  users: userAPI,
  jobs: jobsAPI,
  proposals: proposalsAPI,
  projects: projectsAPI,
  messages: messagesAPI,
  payments: paymentsAPI,
  reviews: reviewsAPI,
  notifications: notificationsAPI,
};
