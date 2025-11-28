// Configure your Django backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Types
export interface Candidate {
  id: string;
  name: string;
  party: string;
  image?: string;
  description?: string;
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
    apiRequest<Candidate[]>("/candidates/"),

  submitVote: (candidateId: string) =>
    apiRequest<VoteReceipt>("/vote/", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
    }),

  getResults: () =>
    apiRequest<VoteResult[]>("/results/"),
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
