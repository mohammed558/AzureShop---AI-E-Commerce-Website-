import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api' });

// ── Products ──────────────────────────────────────────────────────────────────
export const getAllProducts   = ()     => API.get('/products').then(r => r.data);
export const getProduct       = (id)   => API.get(`/products/${id}`).then(r => r.data);
export const searchProducts   = (query) =>
  API.post('/products/search', { query }).then(r => r.data);

// New hybrid search returns: { products, alternatives, expansion }
export const smartSearch = async (query) => {
  const response = await API.post('/products/search', { query });
  return response.data;
};

// ── Image Search (Vision AI) ──────────────────────────────────────────────────
export const imageSearch = (file) => {
  const form = new FormData();
  form.append('image', file);
  return API.post('/products/image-search', form).then(r => r.data);
};

// ── Voice Search (Speech AI) ──────────────────────────────────────────────────
export const voiceSearch = (audioBlob) => {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.wav');
  return API.post('/speech/to-text', form).then(r => r.data);
};

// ── Chat (Azure OpenAI) ───────────────────────────────────────────────────────
export const sendChat = (message, history) =>
  API.post('/chat/message', { message, history }).then(r => r.data);

// ── Recommendations (Personalizer) ───────────────────────────────────────────
export const getRecommendations = (userId, contextFeatures) =>
  API.post('/recommendations', { userId, contextFeatures }).then(r => r.data);

