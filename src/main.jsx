import React from 'react';
import ReactDOM from 'react-dom/client';
import PlayerStatCard from './components/stat-cards/PlayerStatCard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlayerStatCard playerId="4882" gameId="12345" />
  </React.StrictMode>,
);
