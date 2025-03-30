import React, { useState, useEffect } from 'react';
import './App.css';
import Logo from './components/Logo';
import { SearchBar } from './components/SearchBar';
import ClaimBox from './components/ClaimBox';
import InfoBox from './components/InfoBox';
import { ClaimType, AnalysisResult, checkBackendHealth } from './api';

// Add this body class update function at the top, before the App function
const updateBodyClass = (isDisconnected: boolean) => {
  if (isDisconnected) {
    document.body.classList.add('backend-disconnected');
  } else {
    document.body.classList.remove('backend-disconnected');
  }
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteChecked, setSiteChecked] = useState(false);
  const [isReputable, setIsReputable] = useState(false);
  const [skepticalClaimsData, setSkepticalClaimsData] = useState<ClaimType[]>([]);
  const [factualClaimsData, setFactualClaimsData] = useState<ClaimType[]>([]);
  const [currentSkepticalClaimIndex, setCurrentSkepticalClaimIndex] = useState(0);
  const [currentFactualClaimIndex, setCurrentFactualClaimIndex] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [showSkepticalClaims, setShowSkepticalClaims] = useState(true);
  const [showFactualClaims, setShowFactualClaims] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  
  // Update body class when backend connection state changes
  useEffect(() => {
    updateBodyClass(!backendConnected);
  }, [backendConnected]);
  
  // Initialize with a health check - default is disconnected until proven otherwise
  useEffect(() => {
    // Start disconnected by default
    setBackendConnected(false);
    
    // Perform the health check
    async function checkBackendConnection() {
      setIsCheckingBackend(true);
      try {
        // Use the improved health check function that tries multiple endpoints
        const isHealthy = await checkBackendHealth();
        
        if (isHealthy) {
          console.log('Backend connection successful');
          setBackendConnected(true);
          setError('');
        } else {
          throw new Error('Backend health check failed');
        }
      } catch (error) {
        console.error('Backend connection check failed:', error);
        setBackendConnected(false);
        setError('Unable to connect to the server. Please make sure the backend is running.');
      } finally {
        setIsCheckingBackend(false);
      }
    }
    
    // Set a short delay before checking to ensure React has time to render the initial state
    setTimeout(() => {
      checkBackendConnection();
    }, 300);
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('backend-disconnected');
    };
  }, []);

  const handleSiteData = (data: AnalysisResult) => {
    setIsLoading(false);
    setAnalysisData(data);
    // Set site as reputable if impartiality is above 70%
    const impartialityValue = parseInt(data.impartiality.replace('%', ''));
    setIsReputable(impartialityValue >= 70);
    setSiteChecked(true);
    
    // Convert false/misleading and factual/true information to claim format
    if (data.falseMisleadingInformation && data.falseMisleadingInformation.length > 0) {
      const misleadingClaims = data.falseMisleadingInformation.map(([text, source, explanation]) => ({
        text,
        highlight: source,
        explanation,
        isFactual: false
      }));
      setSkepticalClaimsData(misleadingClaims);
      setCurrentSkepticalClaimIndex(0);
    }
    
    if (data.factualTrueInformation && data.factualTrueInformation.length > 0) {
      const factualClaims = data.factualTrueInformation.map(([text, source, explanation]) => ({
        text,
        highlight: source,
        explanation,
        isFactual: true
      }));
      setFactualClaimsData(factualClaims);
      setCurrentFactualClaimIndex(0);
    }
  };
  
  const nextSkepticalClaim = () => {
    setCurrentSkepticalClaimIndex(prev => 
      prev < skepticalClaimsData.length - 1 ? prev + 1 : prev
    );
  };
  
  const prevSkepticalClaim = () => {
    setCurrentSkepticalClaimIndex(prev => 
      prev > 0 ? prev - 1 : prev
    );
  };
  
  const nextFactualClaim = () => {
    setCurrentFactualClaimIndex(prev => 
      prev < factualClaimsData.length - 1 ? prev + 1 : prev
    );
  };
  
  const prevFactualClaim = () => {
    setCurrentFactualClaimIndex(prev => 
      prev > 0 ? prev - 1 : prev
    );
  };
  
  const toggleSkepticalClaims = () => {
    setShowSkepticalClaims(prev => !prev);
  };
  
  const toggleFactualClaims = () => {
    setShowFactualClaims(prev => !prev);
  };
  
  const currentSkepticalClaim = skepticalClaimsData[currentSkepticalClaimIndex];
  const currentFactualClaim = factualClaimsData[currentFactualClaimIndex];
  
  const renderSkepticalClaimsSection = () => {
    if (!currentSkepticalClaim) return null;
    
    return (
      <div className="claims-section skeptical">
        <div className="claims-header">
          <h3>Skeptical Claims</h3>
          <button 
            className="toggle-button"
            onClick={toggleSkepticalClaims}
          >
            {showSkepticalClaims ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showSkepticalClaims && (
          <div className="claims-content">
            <ClaimBox 
              text={currentSkepticalClaim.text} 
              highlight={currentSkepticalClaim.highlight || ''} 
              explanation={currentSkepticalClaim.explanation || 'This claim lacks proper evidence or makes misleading assertions that could lead to incorrect conclusions.'}
            />
            
            <div className="navigation-controls">
              <button 
                className="nav-button" 
                onClick={prevSkepticalClaim}
                disabled={currentSkepticalClaimIndex === 0}
              >
                Previous
              </button>
              <span className="nav-indicator">
                {currentSkepticalClaimIndex + 1} / {skepticalClaimsData.length}
              </span>
              <button 
                className="nav-button" 
                onClick={nextSkepticalClaim}
                disabled={currentSkepticalClaimIndex === skepticalClaimsData.length - 1}
              >
                Next
              </button>
            </div>
            
            <InfoBox 
              title="What are skeptical claims?"
              content="These are claims that question the credibility or accuracy of information on the site."
              isFactual={false}
            />
          </div>
        )}
      </div>
    );
  };
  
  const renderFactualClaimsSection = () => {
    if (!currentFactualClaim) return null;
    
    return (
      <div className="claims-section factual">
        <div className="claims-header">
          <h3>Factual Claims</h3>
          <button 
            className="toggle-button"
            onClick={toggleFactualClaims}
          >
            {showFactualClaims ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showFactualClaims && (
          <div className="claims-content">
            <ClaimBox 
              text={currentFactualClaim.text} 
              highlight={currentFactualClaim.highlight || ''} 
              explanation={currentFactualClaim.explanation || 'This claim is supported by factual evidence and represents accurate information from credible sources.'}
              isFactual={true}
            />
            
            <div className="navigation-controls">
              <button 
                className="nav-button factual" 
                onClick={prevFactualClaim}
                disabled={currentFactualClaimIndex === 0}
              >
                Previous
              </button>
              <span className="nav-indicator">
                {currentFactualClaimIndex + 1} / {factualClaimsData.length}
              </span>
              <button 
                className="nav-button factual" 
                onClick={nextFactualClaim}
                disabled={currentFactualClaimIndex === factualClaimsData.length - 1}
              >
                Next
              </button>
            </div>
            
            <InfoBox 
              title="What are factual claims?"
              content="These are claims that present factual information backed by evidence or reliable sources."
              isFactual={true}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPoliticalBiasSection = () => {
    if (!analysisData) return null;
    
    const { axis } = analysisData;
    
    return (
      <div className="political-bias-section">
        <h3>Political Bias Analysis</h3>
        
        <div className="bias-container">
          <div className="bias-row">
            <span className="bias-label">Progressive</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar progressive"
                style={{ width: axis.progressiveConservativeBias.progressive }}
              ></div>
            </div>
            <span className="bias-value">{axis.progressiveConservativeBias.progressive}</span>
          </div>
          
          <div className="bias-row">
            <span className="bias-label">Conservative</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar conservative"
                style={{ width: axis.progressiveConservativeBias.conservative }}
              ></div>
            </div>
            <span className="bias-value">{axis.progressiveConservativeBias.conservative}</span>
          </div>
          
          <div className="bias-row">
            <span className="bias-label">Authoritarian</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar authoritarian"
                style={{ width: axis.authoritarianLibertarianBias.authoritarian }}
              ></div>
            </div>
            <span className="bias-value">{axis.authoritarianLibertarianBias.authoritarian}</span>
          </div>
          
          <div className="bias-row">
            <span className="bias-label">Libertarian</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar libertarian"
                style={{ width: axis.authoritarianLibertarianBias.libertarian }}
              ></div>
            </div>
            <span className="bias-value">{axis.authoritarianLibertarianBias.libertarian}</span>
          </div>
          
          <div className="bias-row">
            <span className="bias-label">Communist</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar communist"
                style={{ width: axis.communistCapitalistBias.communist }}
              ></div>
            </div>
            <span className="bias-value">{axis.communistCapitalistBias.communist}</span>
          </div>
          
          <div className="bias-row">
            <span className="bias-label">Capitalist</span>
            <div className="bias-bar-container">
              <div 
                className="bias-bar capitalist"
                style={{ width: axis.communistCapitalistBias.capitalist }}
              ></div>
            </div>
            <span className="bias-value">{axis.communistCapitalistBias.capitalist}</span>
          </div>
        </div>
        
        <div className="impartiality-score">
          <h4>Impartiality Score: {analysisData.impartiality}</h4>
        </div>
        
        <div className="justification">
          <h4>Analysis Justification:</h4>
          <p>{analysisData.justification}</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <Logo />
        <div className="backend-status">
          {isCheckingBackend ? (
            <span className="api-indicator checking">
              <i className="status-icon">⌛</i> Checking connection...
            </span>
          ) : backendConnected ? (
            <span className="api-indicator connected">
              <i className="status-icon">✓</i> Backend Connected
            </span>
          ) : (
            <span className="api-indicator disconnected">
              <i className="status-icon">✗</i> Backend Disconnected
            </span>
          )}
        </div>
      </header>
      <div className="divider"></div>
      
      <main>
        <div className="container">
          <h1>Reputable Site Checker</h1>
          <p className="subtitle">Enter a website to check if it's reputable</p>
          
          {isCheckingBackend ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Checking backend connection...</p>
            </div>
          ) : !backendConnected ? (
            <div className="error-message">
              <h2>Server Connection Error</h2>
              <p>The application requires a connection to the backend server to function.</p>
              <p>Please ensure the server is running and refresh the page.</p>
              <div className="server-instructions">
                <h3>To start the server:</h3>
                <ol>
                  <li>Open a terminal</li>
                  <li>Navigate to the server directory: <code>cd reputable-site-checker/server</code></li>
                  <li>Run the server: <code>npm run dev</code> or <code>./start.sh</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <SearchBar 
                onSiteData={handleSiteData} 
                onError={(errorMsg, isConnectionError = false) => {
                  setError(errorMsg);
                  // Only set the backend as disconnected if it's specifically a connection error
                  if (isConnectionError) {
                    setBackendConnected(false);
                  }
                }} 
                onLoading={setIsLoading} 
              />
              
              {error && (
                <div className="error-message">{error}</div>
              )}
              
              {isLoading && (
                <div className="loading-container">
                  <div className="loader"></div>
                  <p>Analyzing website content...</p>
                </div>
              )}
              
              {!isLoading && siteChecked && (
                <>
                  <div className="section-divider"></div>
                  <h2>{isReputable ? 'This site appears reputable' : 'This site may not be reputable'}</h2>
                  
                  {analysisData && (
                    <div className="site-analysis-container">
                      <div className="article-info">
                        <h3>Article Link:</h3>
                        <a href={analysisData.articleLink} target="_blank" rel="noopener noreferrer">
                          {analysisData.articleLink}
                        </a>
                      </div>
                      
                      {renderPoliticalBiasSection()}
                      
                      <div className="claims-container">
                        {siteChecked && (
                          <div className="claims-row">
                            {renderFactualClaimsSection()}
                            {renderSkepticalClaimsSection()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Reputable Site Checker</p>
      </footer>
    </div>
  );
}

export default App;
