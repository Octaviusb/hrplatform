const API_BASE_URL = 'http://localhost:4001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private organizationId: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
    this.organizationId = localStorage.getItem('organizationId');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(this.organizationId && { 'X-Organization-Id': this.organizationId }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let message = `API Error: ${response.status}`;
        try {
          const body = await response.json();
          if (body && (body.error || body.message)) {
            message = body.error || body.message;
          }
        } catch {}
        throw new Error(message);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en http://localhost:4001');
      }
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token to localStorage');
    }
  }

  clearToken() {
    this.token = null;
    this.organizationId = null;
    localStorage.removeItem('token');
    localStorage.removeItem('organizationId');
  }

  getOrganizationId(): string | null {
    return this.organizationId;
  }

  setOrganizationId(organizationId: string | null) {
    this.organizationId = organizationId;
    try {
      if (organizationId) {
        localStorage.setItem('organizationId', organizationId);
      } else {
        localStorage.removeItem('organizationId');
      }
    } catch (error) {
      console.error('Error updating organizationId in localStorage');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await this.request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(response.token);
      return response;
    } catch (error) {
      console.error('Error en API login');
      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async me() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Employees bulk upload (multipart/form-data)
  async uploadEmployees(file: File) {
    const form = new FormData();
    form.append('file', file);
    
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    if (this.organizationId) headers['X-Organization-Id'] = this.organizationId;
    
    try {
      const response = await fetch(`${this.baseURL}/employees/bulk-upload`, {
        method: 'POST',
        body: form,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en http://localhost:4001');
      }
      throw error;
    }
  }

  // Organizations endpoints
  async getOrganizations() {
    return this.request<any[]>('/organizations');
  }

  async createOrganization(data: any) {
    return this.request<any>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id: string, data: any) {
    return this.request<any>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string) {
    return this.request<any>(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  async assignUserToOrganization(organizationId: string, userId: string) {
    return this.request<any>(`/organizations/${organizationId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getUsers() {
    return this.request<any[]>('/users');
  }

  // Employees endpoints
  async getEmployees() {
    return this.request<any[]>('/employees');
  }

  async createEmployee(data: any) {
    return this.request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Psychometric tests endpoints
  async getPsychometricTests() {
    return this.request<any[]>('/psychometric-tests');
  }

  async createPsychometricTest(data: any) {
    return this.request<any>('/psychometric-tests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMyTestAssignments() {
    return this.request<any[]>('/psychometric-tests/assignments/my');
  }

  async startTest(assignmentId: string) {
    return this.request<any>(`/psychometric-tests/assignments/${assignmentId}/start`, {
      method: 'POST'
    });
  }

  async submitTest(assignmentId: string, answers: any[]) {
    return this.request<any>(`/psychometric-tests/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async assignTest(testId: string, employeeIds: string[]) {
    return this.request<any>(`/psychometric-tests/${testId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeIds })
    });
  }

  async getTestAssignments(testId: string) {
    return this.request<any[]>(`/psychometric-tests/${testId}/assignments`);
  }

  // Observations endpoints
  async getObservations() {
    return this.request<any[]>('/observations');
  }

  async createObservation(data: any) {
    return this.request<any>('/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Interviews endpoints
  async getInterviews() {
    return this.request<any[]>('/interviews');
  }

  async createInterview(data: any) {
    return this.request<any>('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeInterview(id: string, outcome: string) {
    return this.request<any>(`/interviews/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ outcome }),
    });
  }

  // Vacations endpoints
  async getVacations() {
    return this.request<any[]>('/vacations');
  }

  async createVacation(data: any) {
    return this.request<any>('/vacations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Attendance endpoints
  async getAttendance(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request<any[]>(`/attendance${query}`);
  }

  async createAttendance(data: any) {
    return this.request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSummary() {
    return this.request<any>('/attendance/summary');
  }

  // Competencies endpoints
  async getCompetencies() {
    return this.request<any[]>('/competencies');
  }

  async createCompetency(data: any) {
    return this.request<any>('/competencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompetency(id: string, data: any) {
    return this.request<any>(`/competencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompetency(id: string) {
    return this.request<any>(`/competencies/${id}`, {
      method: 'DELETE',
    });
  }

  // Benefits endpoints
  async getBenefits() {
    return this.request<any[]>('/benefits');
  }

  async createBenefit(data: any) {
    return this.request<any>('/benefits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBenefit(id: string, data: any) {
    return this.request<any>(`/benefits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBenefit(id: string) {
    return this.request<any>(`/benefits/${id}`, {
      method: 'DELETE',
    });
  }

  // Payroll endpoints
  async getPayrolls() {
    return this.request<any[]>('/payroll');
  }

  async createPayroll(data: any) {
    return this.request<any>('/payroll', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePayroll(id: string, data: any) {
    return this.request<any>(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePayroll(id: string) {
    return this.request<any>(`/payroll/${id}`, {
      method: 'DELETE'
    });
  }

  // Generic CRUD methods
  async get(endpoint: string) {
    if (!endpoint.startsWith('/')) {
      throw new Error('Invalid endpoint');
    }
    return this.request<any>(endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.request<any>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data: any) {
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request<any>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);