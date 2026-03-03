import React, { useRef, useState } from 'react';
import { state } from './state';

const Header = () => {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.mdf')) {
      setImportStatus('Select an .mdf file.');
      event.target.value = '';
      return;
    }

    try {
      setImportStatus('Importing...');
      const formData = new FormData();
      formData.append('mdf', file);

      const response = await fetch('/api/import-mdf', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Import failed.');
      }

      const lapFiles = payload.lapFiles || [];
      if (lapFiles.length === 0) {
        throw new Error('No laps detected in imported MDF.');
      }

      state.laps = lapFiles;
      state.counter = 1;
      state.mode = 1;
      state.lapCompare = [0, Math.min(1, lapFiles.length - 1)];
      state.version += 1;

      setImportStatus(`Imported ${lapFiles.length} lap(s).`);
    } catch (error) {
      setImportStatus(error.message || 'Import failed.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <img src="src/assets/CMRLogoWhite.png" alt="CMR Logo" className="logo" />
        <span className="title">DRIVER INPUT HEATMAP</span>
      </div>

      <nav className="nav-buttons">
        <button className="header-btn" onClick={handleImportClick}>Import</button>
        <button className="header-btn">Export</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {importStatus ? <span className="import-status">{importStatus}</span> : null}
      </nav>
    </header>
  );
};

export default Header;
