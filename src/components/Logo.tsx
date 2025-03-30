import React, { KeyboardEvent } from 'react';

interface LogoProps {
  text?: string;
}

const Logo: React.FC<LogoProps> = ({ text = 'VERIFACT' }) => {
  const handleLogoClick = () => {
    // Reload the page
    window.location.reload();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Trigger click on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scroll on space
      handleLogoClick();
    }
  };

  return (
    <div 
      className="logo" 
      onClick={handleLogoClick} 
      onKeyDown={handleKeyDown}
      role="button" 
      tabIndex={0}
      aria-label="Reload page"
    >
      <span className="logo-text">{text}<span className="logo-dot">.</span>AI</span>
    </div>
  );
};

export default Logo; 