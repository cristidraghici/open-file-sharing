import React from 'react';

export const SkipNavigation: React.FC = () => {
  return (
    <nav aria-label="Skip navigation" className="skip-navigation">
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
    </nav>
  );
};
