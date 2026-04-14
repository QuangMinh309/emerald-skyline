/**
 * Centralized logging utility with prefix support
 * Use this instead of console.log for better debugging
 */

export const logger = {
  /**
   * Info level logs
   */
  info: (prefix: string, message: string, data?: any) => {
    if (data) {
      console.log(`[${prefix}] ${message}:`, data);
    } else {
      console.log(`[${prefix}] ${message}`);
    }
  },

  /**
   * Warning level logs
   */
  warn: (prefix: string, message: string, data?: any) => {
    if (data) {
      console.warn(`⚠️  [${prefix}] ${message}:`, data);
    } else {
      console.warn(`⚠️  [${prefix}] ${message}`);
    }
  },

  /**
   * Error level logs
   */
  error: (prefix: string, message: string, error?: any) => {
    if (error) {
      console.error(`❌ [${prefix}] ${message}:`, error);
    } else {
      console.error(`❌ [${prefix}] ${message}`);
    }
  },

  /**
   * Success logs
   */
  success: (prefix: string, message: string, data?: any) => {
    if (data) {
      console.log(`✅ [${prefix}] ${message}:`, data);
    } else {
      console.log(`✅ [${prefix}] ${message}`);
    }
  },

  /**
   * Debug logs (only in development)
   */
  debug: (prefix: string, message: string, data?: any) => {
    if (__DEV__) {
      if (data) {
        console.log(`🔍 [${prefix}] ${message}:`, data);
      } else {
        console.log(`🔍 [${prefix}] ${message}`);
      }
    }
  },
};
