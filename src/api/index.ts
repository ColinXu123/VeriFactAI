// API client module

export interface ClaimType {
  _id?: string;
  text: string;
  highlight: string;
  info?: string;
  explanation?: string;
  isFactual: boolean;
}

export interface SiteType {
  _id?: string;
  url: string;
  isReputable: boolean;
  domainScore: number;
  lastChecked: string;
  isMockData?: boolean;
}

export interface UrlValidationResult {
  valid: boolean;
  message?: string;
}

export interface BiasAxis {
  progressive: string;
  conservative: string;
}

export interface AuthoritarianAxis {
  authoritarian: string;
  libertarian: string;
}

export interface EconomicAxis {
  communist: string;
  capitalist: string;
}

export interface AnalysisResult {
  _id?: { $oid: string };
  axis: {
    progressiveConservativeBias: BiasAxis;
    authoritarianLibertarianBias: AuthoritarianAxis;
    communistCapitalistBias: EconomicAxis;
  };
  justification: string;
  falseMisleadingInformation: Array<[string, string, string]>;
  factualTrueInformation: Array<[string, string, string]>;
  articleLink: string;
  impartiality: string;
}

export async function validateUrl(url: string): Promise<UrlValidationResult> {
  try {
    const response = await fetch(`/api/sites/validate?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating URL:', error);
    throw new Error('Failed to connect to the server. Please make sure the server is running.');
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  // Use absolute URLs to ensure we're hitting the backend server, not the React dev server
  const healthEndpoints = [
    'http://localhost:5006/api/health',
    'http://localhost:5006/',
    'http://localhost:5006/api'
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      console.log(`Trying health check at: ${endpoint}`);
      // Use AbortController to time out quickly
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // Much shorter timeout - 1 second
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`Backend health check succeeded at: ${endpoint}`);
        return true;
      }
    } catch (error) {
      console.warn(`Health check failed at ${endpoint}:`, error);
      // Continue to try next endpoint
    }
  }
  
  console.error('All health check endpoints failed');
  return false;
}

export async function runAnalysis(url: string): Promise<AnalysisResult> {
  try {
    console.log(`Starting analysis for URL: ${url}`);
    
    // Check health first
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      console.error('Backend health check failed - server unavailable');
      throw new Error('Backend server is not available. Connection error.');
    }
    
    console.log(`Sending POST request to backend for URL: ${url}`);
    
    // Use POST method to call the backend's run function that sends prompts to Gemini API
    const response = await fetch('http://localhost:5006/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    console.log(`Received response with status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Server returned error status: ${response.status}`);
      throw new Error(`Analysis request failed. Server returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully received data from Gemini API:', data);
    
    // Check if we got the expected data structure
    if (!data.axis || !data.justification) {
      console.error('Response missing expected fields:', data);
      throw new Error('Incomplete response from Gemini API');
    }
    
    return data;
  } catch (error) {
    // Log the full error with stack trace
    console.error('Error in runAnalysis:', error);
    
    // Re-throw the error to be handled by the component
    throw error;
  }
} 