// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText, message: response.statusText };
    }
    
    // Extract error message from various possible formats
    const errorMessage = errorData.message || errorData.error || errorData.errors?.[0]?.msg || response.statusText;
    const apiError = new ApiError(response.status, errorMessage);
    
    // Attach full error data for better debugging
    (apiError as any).errorData = errorData;
    
    throw apiError;
  }
  return response.json();
}

// Helper function to create fetch with auth headers
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export const api = {
  // Students
  students: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/students`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/students/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
    getByClass: (className: string) => fetchWithAuth(`${API_BASE_URL}/students/class/${encodeURIComponent(className)}`).then(handleResponse),
  },

  // Teachers
  teachers: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/teachers`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/teachers/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Subjects
  subjects: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/subjects`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/subjects/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Classes
  classes: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/classes`).then(handleResponse),
    getById: (id: string) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Grades (using classes endpoint with grade filter)
  grades: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/classes`).then(handleResponse),
    getById: (id: string) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetchWithAuth(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Admissions
  admissions: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/admissions`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/admissions/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/admissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/admissions/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
    getByStatus: (status: string) => fetchWithAuth(`${API_BASE_URL}/admissions/status/${status}`).then(handleResponse),
  },

  // Exams
  exams: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/exams`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/exams/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/exams`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/exams/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/exams/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Exam Results
  examResults: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/exams/results/all`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/exams/results/${id}`).then(handleResponse),
    getByExamId: (examId: string | number) => fetchWithAuth(`${API_BASE_URL}/exams/results/exam/${examId}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/exams/results`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/exams/results/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/exams/results/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Assignments
  assignments: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/assignments`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/${id}`).then(handleResponse),
    getByClass: (className: string) => fetchWithAuth(`${API_BASE_URL}/assignments/class/${encodeURIComponent(className)}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/assignments/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Assignment Submissions
  assignmentSubmissions: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/all`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/${id}`).then(handleResponse),
    getByAssignmentId: (assignmentId: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/assignment/${assignmentId}`).then(handleResponse),
    getByStudentId: (studentId: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/student/${studentId}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/assignments/submissions/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Fees
  fees: {
    gradeFees: {
      getAll: () => fetchWithAuth(`${API_BASE_URL}/fees`).then(handleResponse),
      getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/fees/${id}`).then(handleResponse),
      getByGrade: (grade: string) => fetchWithAuth(`${API_BASE_URL}/fees/grade/${encodeURIComponent(grade)}`).then(handleResponse),
      create: (data: any) => fetchWithAuth(`${API_BASE_URL}/fees`, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(handleResponse),
      update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/fees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then(handleResponse),
      delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/fees/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    },
    collections: {
      getAll: () => fetchWithAuth(`${API_BASE_URL}/fee-collections`).then(handleResponse),
      getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/fee-collections/${id}`).then(handleResponse),
      getByStudentId: (studentId: string) => fetchWithAuth(`${API_BASE_URL}/fee-collections?studentId=${studentId}`).then(handleResponse),
      create: (data: any) => fetchWithAuth(`${API_BASE_URL}/fee-collections`, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(handleResponse),
      update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/fee-collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then(handleResponse),
      delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/fee-collections/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    },
  },

  // Transactions
  transactions: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/transactions`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/transactions/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Expenses
  expenses: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/accounts/expenses`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/accounts/expenses/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/accounts/expenses`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/accounts/expenses/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/accounts/expenses/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Payroll
  payroll: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/accounts/payroll`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/accounts/payroll/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/accounts/payroll`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/accounts/payroll/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/accounts/payroll/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Attendance
  attendance: {
    getAll: (params?: { date?: string; class?: string; studentId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.date) queryParams.append('date', params.date);
      if (params?.class) queryParams.append('class', params.class);
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      const query = queryParams.toString();
      return fetchWithAuth(`${API_BASE_URL}/attendance${query ? `?${query}` : ''}`).then(handleResponse);
    },
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/attendance/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    createBulk: (records: any[]) => fetchWithAuth(`${API_BASE_URL}/attendance/bulk`, {
      method: 'POST',
      
      body: JSON.stringify({ records }),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/attendance/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Users
  users: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/users`).then(handleResponse),
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/users/${id}`).then(handleResponse),
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/users`, {
      method: 'POST',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },

  // Master Data
  masterData: {
    getAll: (params?: { type?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      const queryString = queryParams.toString();
      return fetchWithAuth(`${API_BASE_URL}/master-data${queryString ? `?${queryString}` : ''}`).then(handleResponse);
    },
    getById: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/master-data/${id}`).then(handleResponse),
    getByCode: (code: string, type?: string) => {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      const queryString = queryParams.toString();
      return fetchWithAuth(`${API_BASE_URL}/master-data/code/${code}${queryString ? `?${queryString}` : ''}`).then(handleResponse);
    },
    create: (data: any) => fetchWithAuth(`${API_BASE_URL}/master-data`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string | number, data: any) => fetchWithAuth(`${API_BASE_URL}/master-data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string | number) => fetchWithAuth(`${API_BASE_URL}/master-data/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
};

export { ApiError };
export default api;
