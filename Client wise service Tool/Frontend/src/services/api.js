import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const api = axios.create({ baseURL: BASE, timeout: 30000 });

export const fetchReconciliation = async (filters = {}) => {
  const params = {};
  if (filters.mobileNumber) params.mobileNumber = filters.mobileNumber;
  if (filters.statusFilter) params.statusFilter = filters.statusFilter;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const { data } = await api.get('/api/reconciliation', { params });
  return data.data;
};

export const fetchDashboard = async (filters = {}) => {
  const params = {};
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const { data } = await api.get('/api/dashboard', { params });
  return data.data; // { summary, serviceBreakdown }
};

export const exportReconciliation = async (filters = {}) => {
  const params = {};
  if (filters.mobileNumber) params.mobileNumber = filters.mobileNumber;
  if (filters.statusFilter) params.statusFilter = filters.statusFilter;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const response = await api.get('/api/reconciliation/export', {
    params,
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reconciliation_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ✅ NEW API (this fixes your issue)
export const insertRecords = async (payload) => {
  const { data } = await api.post('/api/insert/records', payload);
  return data;
};