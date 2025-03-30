import React, { useState } from 'react';
import { runAnalysis, checkBackendHealth } from '../api';

interface SearchBarProps {
  onSiteData: (data: any) => void;
  onError: (error: string, isConnectionError?: boolean) => void;
  onLoading: (loading: boolean) => void;
  onUrlChange?: (url: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSiteData,
  onError,
  onLoading,
  onUrlChange,
}) => {
  const [url, setUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const handleCheck = async () => {
    if (!url.trim()) return;

    // Add http:// prefix if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    console.log(`[UI] Starting analysis for URL: ${processedUrl}`);
    
    onLoading(true);
    onError('');
    
    // Update parent component with the URL
    if (onUrlChange) {
      onUrlChange(processedUrl);
    }

    // First check if the backend is up
    try {
      console.log(`[UI] Checking backend health`);
      const isBackendHealthy = await checkBackendHealth();
      if (!isBackendHealthy) {
        console.error(`[UI] Backend health check failed`);
        throw new Error('Backend server is not responding - connection error');
      }
      
      // If health check passes, proceed with analysis
      try {
        console.log(`[UI] Backend is healthy, sending analysis request`);
        console.time('[UI] Analysis request time');
        
        const data = await runAnalysis(processedUrl);
        
        console.timeEnd('[UI] Analysis request time');
        console.log(`[UI] Analysis complete, received data:`, data);
        
        console.log('[UI] About to call onSiteData with response data');
        onSiteData(data);
        console.log('[UI] Called onSiteData');
        onLoading(false);
        setRetryCount(0); // Reset retry count on success
      } catch (analysisError) {
        console.error('[UI] Error analyzing site:', analysisError);
        const errorMessage = analysisError instanceof Error ? analysisError.message : 'Error analyzing URL';
        
        // Check if it's a connection error
        const isConnectionError = 
          errorMessage.includes('connect') || 
          errorMessage.includes('connection') || 
          errorMessage.includes('backend') ||
          errorMessage.includes('server');
        
        onError(`Error analyzing URL: ${errorMessage}`, isConnectionError);
        onLoading(false);
      }
    } catch (error) {
      console.error('[UI] Backend health check failed:', error);
      
      // This is definitely a connection error
      const errorMessage = error instanceof Error ? error.message : 'Backend connection error';
      
      if (retryCount < 2) {
        // Try again with a delay
        setRetryCount(prev => prev + 1);
        console.log(`[UI] Retrying connection (attempt ${retryCount + 1}/3)`);
        onError(`Connection issue. Retrying (${retryCount + 1}/3)...`, true);
        
        setTimeout(() => {
          handleCheck();
        }, 2000); // Wait 2 seconds before retrying
      } else {
        // Give up after 3 attempts
        console.error(`[UI] All retry attempts failed`);
        onError(`${errorMessage} Please ensure the server is running on port 5006.`, true);
        setRetryCount(0);
        onLoading(false);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && url.trim()) {
      handleCheck();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    // Optionally update the parent component on every change
    // if (onUrlChange) {
    //   onUrlChange(newUrl);
    // }
  };

  return (
    <div className="search-container-wrapper">
      <div className="search-container">
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter website URL (e.g., example.com)"
          className="url-input"
        />
        <button
          onClick={handleCheck}
          className="check-button"
          disabled={!url.trim()}
        >
          Check
        </button>
      </div>
    </div>
  );
}; 