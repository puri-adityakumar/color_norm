import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMethods = async () => {
  const response = await api.get('/api/normalization/methods');
  return response.data.methods;
};

export const processImage = async (sourceImage, method, referenceImage = null) => {
  const formData = new FormData();
  formData.append('source_image', sourceImage);
  formData.append('method', method);

  if (referenceImage) {
    formData.append('reference_image', referenceImage);
  }

  const response = await api.post('/api/normalization/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api; 