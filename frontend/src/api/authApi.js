import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/auth';

/**
 * Register a new user.
 * @param {{ displayName: string, email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export const registerUser = (data) =>
  axios.post(`${BASE_URL}/register`, data).then((res) => res.data);

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginUser = (data) =>
  axios.post(`${BASE_URL}/login`, data).then((res) => res.data);
