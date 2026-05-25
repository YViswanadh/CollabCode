import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/feedback';

/**
 * Submit user rating and comments feedback.
 * @param {{ rating: number, comments: string }} data
 * @param {string} token - The user JWT auth token
 * @returns {Promise<object>}
 */
export const submitFeedback = (data, token) =>
  axios
    .post(BASE_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
