import React from 'react'

function App() {
  const handleTestClick = () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'notify', 
        message: 'React component is running!' 
      } 
    }, '*')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1>ChartDreamer</h1>
      <p>Create beautiful data visualizations in Figma</p>
      <button 
        onClick={handleTestClick}
        style={{
          padding: '8px 16px',
          backgroundColor: '#18A0FB',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Test React Component
      </button>
    </div>
  )
}

export default App 