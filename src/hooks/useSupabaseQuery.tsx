/**
 * Supabase Query Hook
 * 
 * Provides a consistent interface for Supabase queries with error handling,
 * loading states, and debugging. Reduces boilerplate across components.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/hooks/useDebug';

interface QueryOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useSupabaseQuery = (componentName: string = 'Unknown') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();
  const debug = useDebug({ component: `useSupabaseQuery-${componentName}` });

  /**
   * Execute a Supabase query with consistent error handling and logging
   */
  const executeQuery = useCallback(async <T = any>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: QueryOptions = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred'
    } = options;

    debug.logEntry('executeQuery', { options });
    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      const { data, error: queryError } = await queryFn();
      const endTime = performance.now();

      debug.log(`Query completed in ${(endTime - startTime).toFixed(2)}ms`, { 
        hasData: !!data, 
        hasError: !!queryError 
      });

      if (queryError) {
        debug.logError('Query returned error', queryError);
        setError(queryError);
        
        if (showErrorToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
        
        onError?.(queryError);
        return null;
      }

      debug.logSuccess('Query successful', { dataLength: Array.isArray(data) ? data?.length : 'single' });
      
      if (showSuccessToast) {
        toast({
          title: "Success",
          description: successMessage
        });
      }
      
      onSuccess?.(data);
      return data;

    } catch (error) {
      debug.logError('Query execution failed', error);
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
      debug.logExit('executeQuery');
    }
  }, [debug, toast]);

  /**
   * Fetch records from a table with user filtering
   */
  const fetchUserRecords = useCallback(async <T = any>(
    tableName: string,
    userId: string,
    options: {
      select?: string;
      orderBy?: { column: string; ascending?: boolean };
      filters?: Record<string, any>;
    } = {}
  ): Promise<T[] | null> => {
    const { select = '*', orderBy, filters = {} } = options;
    
    return executeQuery(async () => {
      let query = (supabase as any)
        .from(tableName)
        .select(select)
        .eq('user_id', userId);

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      return query;
    }, {
      errorMessage: `Failed to load ${tableName}`,
      showErrorToast: true
    });
  }, [executeQuery]);

  /**
   * Insert a new record
   */
  const insertRecord = useCallback(async <T = any>(
    tableName: string,
    data: any,
    options: Omit<QueryOptions, 'onSuccess'> & {
      onSuccess?: (data: T) => void;
    } = {}
  ): Promise<T | null> => {
    return executeQuery(async () => {
      return (supabase as any)
        .from(tableName)
        .insert([data])
        .select()
        .single();
    }, {
      ...options,
      showSuccessToast: true,
      successMessage: options.successMessage || `${tableName.slice(0, -1)} created successfully`,
      errorMessage: options.errorMessage || `Failed to create ${tableName.slice(0, -1)}`
    });
  }, [executeQuery]);

  /**
   * Update a record
   */
  const updateRecord = useCallback(async <T = any>(
    tableName: string,
    id: string,
    data: any,
    options: QueryOptions = {}
  ): Promise<T | null> => {
    return executeQuery(async () => {
      return (supabase as any)
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
    }, {
      ...options,
      showSuccessToast: true,
      successMessage: options.successMessage || `${tableName.slice(0, -1)} updated successfully`,
      errorMessage: options.errorMessage || `Failed to update ${tableName.slice(0, -1)}`
    });
  }, [executeQuery]);

  /**
   * Delete a record
   */
  const deleteRecord = useCallback(async (
    tableName: string,
    id: string,
    options: QueryOptions = {}
  ): Promise<boolean> => {
    const result = await executeQuery(async () => {
      return (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', id);
    }, {
      ...options,
      showSuccessToast: true,
      successMessage: options.successMessage || `${tableName.slice(0, -1)} deleted successfully`,
      errorMessage: options.errorMessage || `Failed to delete ${tableName.slice(0, -1)}`
    });

    return result !== null;
  }, [executeQuery]);

  return {
    loading,
    error,
    executeQuery,
    fetchUserRecords,
    insertRecord,
    updateRecord,
    deleteRecord
  };
};