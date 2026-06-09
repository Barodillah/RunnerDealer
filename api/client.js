/**
 * Frontend API Service
 * Endpoint: https://csdwindo.com/runner/api
 */

export const API_BASE_URL = 'https://csdwindo.com/runner/api';

/**
 * Submit data aktivasi ke backend PHP Native
 * 
 * @param {Object} formData Data formulir aktivasi
 * @returns {Promise<Object>} Response dari server
 */
export const submitAktivasi = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/aktivasi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saat menghubungi API backend:', error);
    throw error;
  }
};
