import { useState, useEffect, useCallback } from 'react';

// Global cache for dashboard data
let dashboardCache = {
  context: null,
  conversations: [],
  stats: null,
  analytics: null
};

let cacheTimestamps = {
  context: null,
  conversations: null,
  stats: null,
  analytics: null
};

const CACHE_DURATION = 30000; // 30 seconds

export const useDashboardData = () => {
  const [data, setData] = useState(dashboardCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDataFresh = useCallback((key) => {
    const timestamp = cacheTimestamps[key];
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
  }, []);

  const fetchContext = useCallback(async () => {
    if (isDataFresh('context')) return dashboardCache.context;
    
    try {
      const response = await fetch('/api/context');
      if (!response.ok) throw new Error('Error fetching context');
      const contextData = await response.json();
      
      dashboardCache.context = contextData;
      cacheTimestamps.context = Date.now();
      return contextData;
    } catch (err) {
      throw new Error(`Context error: ${err.message}`);
    }
  }, [isDataFresh]);

  const fetchConversations = useCallback(async () => {
    if (isDataFresh('conversations')) return dashboardCache.conversations;
    
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) throw new Error('Error fetching conversations');
      const conversationsData = await response.json();
      
      dashboardCache.conversations = conversationsData;
      cacheTimestamps.conversations = Date.now();
      return conversationsData;
    } catch (err) {
      throw new Error(`Conversations error: ${err.message}`);
    }
  }, [isDataFresh]);

  const fetchStats = useCallback(async () => {
    if (isDataFresh('stats')) return dashboardCache.stats;
    
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Error fetching stats');
      const statsData = await response.json();
      
      dashboardCache.stats = statsData;
      cacheTimestamps.stats = Date.now();
      return statsData;
    } catch (err) {
      throw new Error(`Stats error: ${err.message}`);
    }
  }, [isDataFresh]);

  const fetchAnalytics = useCallback(async () => {
    if (isDataFresh('analytics')) return dashboardCache.analytics;
    
    try {
      const response = await fetch('/api/crm/contacts/analytics/summary');
      if (!response.ok) throw new Error('Error fetching analytics');
      const analyticsData = await response.json();
      
      dashboardCache.analytics = analyticsData;
      cacheTimestamps.analytics = Date.now();
      return analyticsData;
    } catch (err) {
      throw new Error(`Analytics error: ${err.message}`);
    }
  }, [isDataFresh]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [context, conversations, stats, analytics] = await Promise.all([
        fetchContext(),
        fetchConversations(),
        fetchStats(),
        fetchAnalytics()
      ]);

      const newData = {
        context,
        conversations,
        stats,
        analytics
      };

      dashboardCache = newData;
      setData(newData);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchContext, fetchConversations, fetchStats, fetchAnalytics]);

  const refreshSingleEndpoint = useCallback(async (endpoint) => {
    setLoading(true);
    try {
      let newValue;
      switch (endpoint) {
        case 'context':
          newValue = await fetchContext();
          break;
        case 'conversations':
          newValue = await fetchConversations();
          break;
        case 'stats':
          newValue = await fetchStats();
          break;
        case 'analytics':
          newValue = await fetchAnalytics();
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
      
      setData(prev => ({ ...prev, [endpoint]: newValue }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchContext, fetchConversations, fetchStats, fetchAnalytics]);

  useEffect(() => {
    // Only fetch if we don't have fresh cached data
    const needsRefresh = Object.keys(cacheTimestamps).some(key => !isDataFresh(key));
    
    if (needsRefresh) {
      refreshData();
    } else {
      // Use cached data
      setData(dashboardCache);
    }
  }, [refreshData, isDataFresh]);

  return {
    data,
    loading,
    error,
    refreshData,
    refreshSingleEndpoint
  };
};

export default useDashboardData;
