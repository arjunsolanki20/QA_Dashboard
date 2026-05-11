import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchReconciliation } from '../services/api';

const AUTO_REFRESH_MS = 30_000;

export function useReconciliation(filters) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const timerRef = useRef(null);
  const countRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReconciliation(filters);
      setData(result);
      setLastFetch(new Date());
      setCountdown(AUTO_REFRESH_MS / 1000);
    } catch (e) {
      setError(e.message ?? 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, AUTO_REFRESH_MS);
    countRef.current = setInterval(() =>
      setCountdown(c => (c <= 1 ? AUTO_REFRESH_MS / 1000 : c - 1)), 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countRef.current);
    };
  }, [load]);

  return { data, loading, error, lastFetch, countdown, refresh: load };
}
