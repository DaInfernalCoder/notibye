/**
 * Debug Utility Hook
 * 
 * Provides consistent logging and debugging utilities across the application.
 * Automatically includes component context and timestamp for better debugging.
 */

import { useCallback } from 'react';

interface DebugConfig {
  enabled?: boolean;
  component?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export const useDebug = (config: DebugConfig = {}) => {
  const { 
    enabled = true, 
    component = 'Unknown', 
    level = 'info' 
  } = config;

  /**
   * Log a message with component context and timestamp
   */
  const log = useCallback((message: string, data?: any, logLevel: 'info' | 'warn' | 'error' | 'debug' = level) => {
    if (!enabled) return;

    const timestamp = new Date().toISOString();
    const prefix = `🔍 [${component}] ${timestamp}:`;

    switch (logLevel) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'debug':
        console.debug(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  }, [enabled, component, level]);

  /**
   * Log function entry with parameters
   */
  const logEntry = useCallback((functionName: string, params?: any) => {
    log(`→ Entering ${functionName}`, params, 'debug');
  }, [log]);

  /**
   * Log function exit with result
   */
  const logExit = useCallback((functionName: string, result?: any) => {
    log(`← Exiting ${functionName}`, result, 'debug');
  }, [log]);

  /**
   * Log an error with full context
   */
  const logError = useCallback((message: string, error: any, context?: any) => {
    log(`❌ ${message}`, { error, context }, 'error');
  }, [log]);

  /**
   * Log a warning
   */
  const logWarning = useCallback((message: string, data?: any) => {
    log(`⚠️ ${message}`, data, 'warn');
  }, [log]);

  /**
   * Log a success operation
   */
  const logSuccess = useCallback((message: string, data?: any) => {
    log(`✅ ${message}`, data, 'info');
  }, [log]);

  /**
   * Time a function execution
   */
  const timeFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: any[]) => {
      const startTime = performance.now();
      logEntry(functionName, args);
      
      try {
        const result = fn(...args);
        const endTime = performance.now();
        log(`⏱️ ${functionName} completed in ${(endTime - startTime).toFixed(2)}ms`, { result });
        logExit(functionName, result);
        return result;
      } catch (error) {
        const endTime = performance.now();
        logError(`${functionName} failed after ${(endTime - startTime).toFixed(2)}ms`, error);
        throw error;
      }
    }) as T;
  }, [log, logEntry, logExit, logError]);

  return {
    log,
    logEntry,
    logExit,
    logError,
    logWarning,
    logSuccess,
    timeFunction,
  };
};