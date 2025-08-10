import api from './api';

export const aiAnalysisService = {
  // Get basic reading analysis
  getReadingAnalysis: async () => {
    try {
      console.log('Calling AI analysis endpoint...');
      const response = await api.get('/analysis/reading-analysis');
      console.log('AI analysis API response:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reading analysis:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Get detailed insights
  getDetailedInsights: async () => {
    try {
      const response = await api.get('/analysis/detailed-insights');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch detailed insights:', error);
      throw error;
    }
  }
};
