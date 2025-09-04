import React, { useState } from 'react';
import { Button } from '../Button';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface DataProviderProps<T> {
  fetchData: () => Promise<T>;
  children: (state: DataState<T> & { 
    refetch: () => void;
    reset: () => void;
  }) => React.ReactNode;
}

// Render prop pattern - provides data fetching logic
export function DataProvider<T>({ fetchData, children }: DataProviderProps<T>) {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchData();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  React.useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="data-provider" data-testid="data-provider">
      {state.error && (
        <div className="error-banner" data-testid="error-banner" role="alert">
          <p>Error: {state.error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            data-testid="retry-button"
            aria-label="Retry loading data"
          >
            Retry
          </Button>
        </div>
      )}
      
      {children({
        ...state,
        refetch,
        reset
      })}
    </div>
  );
}