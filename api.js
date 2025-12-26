// WebSite/src/services/api.js
// Enhanced API client with retry logic and better error handling

import { auth } from '../firebase';
import logger from '../utils/logger';
import { getApiUrl } from '../utils/validateEnv';

export const API_BASE_URL = getApiUrl();

// get firebase auth token
export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    return await user.getIdToken(false);
  } catch (error) {
    logger.error('Failed to get auth token:', error);
    // try force refresh
    try {
      return await user.getIdToken(true);
    } catch (refreshError) {
      logger.error('Token refresh failed:', refreshError);
      throw new Error('Authentication expired. Please log in again.');
    }
  }
};

// retry logic for network errors
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error, attempt) => {
  if (attempt >= 3) return false;
  
  // retry on network errors
  if (error.message.includes('Failed to fetch') || 
      error.message.includes('Network request failed')) {
    return true;
  }
  
  // retry on 5xx errors (server errors)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  return false;
};

// main API client with retry
export const apiClient = async (endpoint, options = {}, retryCount = 0) => {
  try {
    const token = await getAuthToken();
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    logger.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    
    // handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        (typeof data === 'object' && data.message) || 
        data || 
        `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.data = data;
      
      throw error;
    }

    logger.log(`API Success: ${endpoint}`, data);
    return data;

  } catch (error) {
    logger.error(`API Error: ${endpoint}`, error);
    
    // retry on transient failures
    if (shouldRetry(error, retryCount)) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // exponential backoff
      logger.log(`Retrying request after ${delay}ms (attempt ${retryCount + 1}/3)`);
      await sleep(delay);
      return apiClient(endpoint, options, retryCount + 1);
    }
    
    throw error;
  }
};

// file upload helper
export const uploadFile = async (endpoint, formData, onProgress = null) => {
  try {
    const token = await getAuthToken();
    
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // don't set Content-Type for FormData - browser sets it with boundary
      },
      body: formData,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    logger.log(`File Upload: ${url}`);

    // create xhr for progress tracking if callback provided
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'));
        });
        
        xhr.open('POST', url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    }

    // fallback to fetch
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    logger.log('Upload successful', data);
    return data;

  } catch (error) {
    logger.error('Upload error:', error);
    throw error;
  }
};

// helper for GET requests
export const get = (endpoint) => apiClient(endpoint, { method: 'GET' });

// helper for POST requests
export const post = (endpoint, body) => 
  apiClient(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(body) 
  });

// helper for PUT requests
export const put = (endpoint, body) => 
  apiClient(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(body) 
  });

// helper for PATCH requests
export const patch = (endpoint, body) => 
  apiClient(endpoint, { 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  });

// helper for DELETE requests
export const del = (endpoint) => 
  apiClient(endpoint, { method: 'DELETE' });