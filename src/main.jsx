import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import RealEstateLeadGenerator from './App.jsx';
import GreenTreeCRM from './FullCRM.jsx';

function Root() {
  const [view, setView] = useState('full');

  const tabStyle = (active) => ({
    padding: '6px 14px',
    background: active ? '#16a34a' : '#374151',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, padding: 10, background: '#111827', justifyContent: 'center' }}>
        <button style={tabStyle(view === 'full')} onClick={() => setView('full')}>Full CRM</button>
        <button style={tabStyle(view === 'simple')} onClick={() => setView('simple')}>Lead Generator</button>
      </div>
      {view === 'full' ? <GreenTreeCRM /> : <RealEstateLeadGenerator />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
