/**
 * Token Storage Utility
 * Manages access and refresh tokens in localStorage
 */

export const tokenStorage = {
  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null if not found
   */
  getAccessToken: () => {
    return localStorage.getItem("%accessToken%");
  },

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token or null if not found
   */
  getRefreshToken: () => {
    return localStorage.getItem("%refreshToken%");
  },

  /**
   * Set both access and refresh tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem("%accessToken%", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("%refreshToken%", refreshToken);
    }
  },

  /**
   * Set only access token (used after refresh)
   * @param {string} accessToken - Access token
   */
  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem("%accessToken%", accessToken);
    }
  },

  /**
   * Clear all tokens and user data from localStorage
   */
  clearTokens: () => {
    localStorage.removeItem("%accessToken%");
    localStorage.removeItem("%refreshToken%");
    localStorage.removeItem("%companyId%");
    localStorage.removeItem("projectPermission");
    localStorage.removeItem("requisitionPermission");
    localStorage.removeItem("contractPermission");
    localStorage.removeItem("productPermission");
    localStorage.removeItem("vendorPermission");
    localStorage.removeItem("poPermission");
    localStorage.removeItem("userPermission");
  },

  /**
   * Check if both tokens exist
   * @returns {boolean} True if both tokens exist
   */
  hasTokens: () => {
    return !!(
      localStorage.getItem("%accessToken%") &&
      localStorage.getItem("%refreshToken%")
    );
  },

  /**
   * Check if access token exists
   * @returns {boolean} True if access token exists
   */
  hasAccessToken: () => {
    return !!localStorage.getItem("%accessToken%");
  },

  /**
   * Check if refresh token exists
   * @returns {boolean} True if refresh token exists
   */
  hasRefreshToken: () => {
    return !!localStorage.getItem("%refreshToken%");
  },
};

