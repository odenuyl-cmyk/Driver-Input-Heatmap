import React from 'react';

const Header = () => {
  return (
    <header className="header-container">
      <div className="logo-container">
        <img src="src/assets/CMRLogoWhite.png" alt="CMR Logo" className="logo" />
        <span className="title">DRIVER INPUT HEATMAP</span>
      </div>

      <nav className="nav-buttons">
        <button className="header-btn">Import</button>
        <button className="header-btn">Export</button>
      </nav>
    </header>
  );
};

export default Header;
