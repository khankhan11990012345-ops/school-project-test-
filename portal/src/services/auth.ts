// Authentication service for frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Store token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Backend expects 'username' field but accepts email as username
    body: JSON.stringify({ username: credentials.email, password: credentials.password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Login failed');
  }

  const data = await response.json();
  
  // Transform backend response { success: true, data: { user, token } } to { token, user, message }
  if (data.data) {
    const token = data.data.token;
    const user = data.data.user;
    setAuthToken(token);
    return {
      message: data.message || 'Login successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  
  // Fallback for old format
  setAuthToken(data.token);
  return data;
};

// Register
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.email.split('@')[0], // Generate username from email
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Registration failed');
  }

  const data = await response.json();
  
  // Transform backend response { success: true, data: { user, token } } to { token, user, message }
  if (data.data) {
    const token = data.data.token;
    const user = data.data.user;
    setAuthToken(token);
    return {
      message: data.message || 'Registration successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  
  // Fallback for old format
  setAuthToken(data.token);
  return data;
};

// Get current user
export const getCurrentUser = async (): Promise<any> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    removeAuthToken();
    throw new Error('Invalid token');
  }

  return response.json();
};

// Logout
export const logout = (): void => {
  removeAuthToken();
};

