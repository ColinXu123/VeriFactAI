import React from 'react';

interface ClaimBoxProps {
  text: string;
  highlight: string;
  explanation?: string;
  isFactual?: boolean;
}

const ClaimBox: React.FC<ClaimBoxProps> = ({ text, highlight, explanation, isFactual = false }) => {
  // Limit text to 300 characters max
  const limitText = (text: string, limit: number = 300) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };
  
  const limitedText = limitText(text);
  
  // Find the position of the highlight text in the limited text
  const index = limitedText.indexOf(highlight);
  
  return (
    <div className="claim-box">
      <div className="claim-text">
        {index === -1 ? (
          <p>{limitedText}</p>
        ) : (
          <p>
            {limitedText.substring(0, index)}
            <span className="highlight">{highlight}</span>
            {limitedText.substring(index + highlight.length)}
          </p>
        )}
      </div>
      
      {explanation && (
        <div className={`explanation-section ${isFactual ? 'factual' : ''}`}>
          <h4>{isFactual ? 'Why this statement is credible:' : 'Why this statement is misleading:'}</h4>
          <p>{limitText(explanation, 200)}</p>
        </div>
      )}
    </div>
  );
};

export default ClaimBox; 