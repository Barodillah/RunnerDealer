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
    const response = await fetch(`${API_BASE_URL}/aktivasi.php`, {
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

/**
 * Check health status
 * @returns {Promise<Object>}
 */
export const checkHealth = async () => {
  try {
    // using no-cache to get real time status
    const response = await fetch(`${API_BASE_URL}/health.php`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Not ok');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Check customer for autofill
 * @param {Object} data {username, email, telp}
 * @returns {Promise<Object>}
 */
export const checkCustomer = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/check_customer.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Not ok');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Dealer endpoints
 */
const dealerFetch = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return await response.json();
};

export const getDealerSummary = () => dealerFetch(`${API_BASE_URL}/dealer.php?action=summary`);
export const getDealerCustomers = (page = 1, limit = 10, search = '') => 
  dealerFetch(`${API_BASE_URL}/dealer.php?action=customers&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
export const getDealerTickets = (page = 1, limit = 10, search = '') => 
  dealerFetch(`${API_BASE_URL}/dealer.php?action=tickets&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
export const getDealerVehicles = (page = 1, limit = 10, search = '') => 
  dealerFetch(`${API_BASE_URL}/dealer.php?action=vehicles&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
export const getDealerCustomerDetail = (id) => dealerFetch(`${API_BASE_URL}/dealer.php?action=customer_detail&id=${id}`);
