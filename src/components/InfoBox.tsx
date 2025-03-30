import React from 'react';

interface InfoBoxProps {
  title: string;
  content: string;
  isFactual?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, content, isFactual = false }) => {
  return (
    <div className={`info-box ${isFactual ? 'factual' : ''}`}>
      <div className={`info-icon ${isFactual ? 'factual' : ''}`}>i</div>
      <div className="info-content">
        <h2 className={isFactual ? 'factual' : ''}>{title}</h2>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default InfoBox; 