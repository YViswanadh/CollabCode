import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/admin';

/**
 * Fetch overall admin system statistics.
 * @param {string} token - User JWT auth token
 * @returns {Promise<object>}
 */
export const fetchMetrics = (token) =>
  axios
    .get(`${BASE_URL}/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

/**
 * Fetch list of all user feedbacks.
 * @param {string} token - User JWT auth token
 * @returns {Promise<object>}
 */
export const fetchFeedbacks = (token) =>
  axios
    .get(`${BASE_URL}/feedbacks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

/**
 * Fetch list of all registered users.
 * @param {string} token - User JWT auth token
 * @returns {Promise<object>}
 */
export const fetchUsers = (token) =>
  axios
    .get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

/**
 * Delete a specific user feedback.
 * @param {string} id - Feedback document ObjectId
 * @param {string} token - User JWT auth token
 * @returns {Promise<object>}
 */
export const deleteFeedback = (id, token) =>
  axios
    .delete(`${BASE_URL}/feedbacks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

/**
 * Delete a specific user account.
 * @param {string} id - User document ObjectId
 * @param {string} token - User JWT auth token
 * @returns {Promise<object>}
 */
export const deleteUser = (id, token) =>
  axios
    .delete(`${BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);
