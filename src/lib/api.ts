// Configure your Django backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Types
export interface Candidate {
  id: number;
  name: string;
  bio?: string;
  manifesto?: string;
  image?: string;
  category: number;
}

export interface VoteResult {
  candidate_id: string;
  candidate_name: string;
  party: string;
  votes: number;
  percentage: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    has_voted: boolean;
  };
}

export interface VoteReceipt {
  receipt_id: string;
  candidate_name: string;
  timestamp: string;
  verification_hash: string;
}

export interface Election {
  id: number;
  title: string;
  description?: string;
  is_public: boolean;
  allowed_voters: any[];
  categories: any[];
  status: 'draft' | 'active' | 'ended';
  start_date?: string;
  end_date?: string;
  results_released: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  election: number;
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.detail || "Request failed");
  }

  return response.json();
}

// Auth API
export const authApi = {
  sendOTP: (data: OTPRequest) =>
    apiRequest<{ message: string }>("/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyOTP: (data: OTPVerification) =>
    apiRequest<AuthResponse>("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (credentials: LoginCredentials) =>
    apiRequest<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest<void>("/auth/logout/", {
      method: "POST",
    }),

  getUser: () =>
    apiRequest<AuthResponse["user"]>("/auth/user/"),
};

// Voting API
export const votingApi = {
  getCandidates: () =>
    apiRequest<Candidate[]>("/candidate/"),

  submitVote: (electionId: number, categoryId: number, candidateId: number) =>
    apiRequest<VoteReceipt>("/vote/", {
      method: "POST",
      body: JSON.stringify({
        election_id: electionId,
        category_id: categoryId,
        candidate_id: candidateId
      }),
    }),

  getResults: () =>
    apiRequest<VoteResult[]>("/result/"),
};

// Election API
export const electionApi = {
  getElections: () =>
    apiRequest<Election[]>("/election/"),
};

// Candidate API (separate from voting candidates if needed)
export const candidateApi = {
  getCandidates: () =>
    apiRequest<Candidate[]>("/candidate/"),
};

// Category API
export const categoryApi = {
  getCategories: () =>
    apiRequest<Category[]>("/category/"),
  
  createCategory: (data: Omit<Category, 'id'>) =>
    apiRequest<Category>("/category/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  updateCategory: (id: number, data: Partial<Category>) =>
    apiRequest<Category>(`/category/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  
  deleteCategory: (id: number) =>
    apiRequest<void>(`/category/${id}/`, {
      method: "DELETE",
    }),
};

// Admin API
export const adminApi = {
  createElection: (data: Omit<Election, 'id'>) =>
    apiRequest<Election>("/admin/election/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateElection: (id: number, data: Partial<Election>) =>
    apiRequest<Election>(`/admin/election/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  startElection: (id: number) =>
    apiRequest<Election>(`/admin/election/${id}/start/`, {
      method: "POST",
    }),

  endElection: (id: number) =>
    apiRequest<Election>(`/admin/election/${id}/end/`, {
      method: "POST",
    }),

  releaseResults: (id: number) =>
    apiRequest<Election>(`/admin/election/${id}/release-results/`, {
      method: "POST",
    }),

  createCandidate: (data: Omit<Candidate, 'id'>) =>
    apiRequest<Candidate>("/admin/candidate/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCandidate: (id: number, data: Partial<Candidate>) =>
    apiRequest<Candidate>(`/admin/candidate/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCandidate: (id: number) =>
    apiRequest<void>(`/admin/candidate/${id}/`, {
      method: "DELETE",
    }),

  uploadCandidateImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem("auth_token");
    
    return fetch(`${API_BASE_URL}/admin/candidate/${id}/upload-image/`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    });
  },
};

// Auth helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("auth_token");
};

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
