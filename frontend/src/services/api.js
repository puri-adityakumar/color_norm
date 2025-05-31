import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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