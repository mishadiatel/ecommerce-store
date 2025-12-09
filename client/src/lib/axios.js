import axios from 'axios';

export const projectApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROJECT_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})