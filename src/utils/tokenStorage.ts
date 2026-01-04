/**
 * Token Storage Utility
 * Manages access and refresh tokens in localStorage
 */

export const tokenStorage = {
  /**
   * Get access token from localStorage
   * @returns Access token or null if not found
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem("%accessToken%");
  },

  /**
   * Get refresh token from localStorage
   * @returns Refresh token or null if not found
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem("%refreshToken%");
  },

  /**
   * Set both access and refresh tokens
   * @param accessToken - Access token
   * @param refreshToken - Refresh token
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (accessToken) {
      localStorage.setItem("%accessToken%", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("%refreshToken%", refreshToken);
    }
  },

  /**
   * Set only access token (used after refresh)
   * @param accessToken - Access token
   */
  setAccessToken: (accessToken: string): void => {
    if (accessToken) {
      localStorage.setItem("%accessToken%", accessToken);
    }
  },

  /**
   * Clear all tokens and user data from localStorage
   */
  clearTokens: (): void => {
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
   * @returns True if both tokens exist
   */
  hasTokens: (): boolean => {
    return !!(
      localStorage.getItem("%accessToken%") &&
      localStorage.getItem("%refreshToken%")
    );
  },

  /**
   * Check if access token exists
   * @returns True if access token exists
   */
  hasAccessToken: (): boolean => {
    return !!localStorage.getItem("%accessToken%");
  },

  /**
   * Check if refresh token exists
   * @returns True if refresh token exists
   */
  hasRefreshToken: (): boolean => {
    return !!localStorage.getItem("%refreshToken%");
  },
};
