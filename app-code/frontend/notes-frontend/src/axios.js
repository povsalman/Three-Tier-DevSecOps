// src/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://api.3devsecops.tech',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default instance;
