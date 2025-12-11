const express = require('express');
const path = require('path');
const { readData } = require('./db/utils');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint for all players
app.get('/api/players', async (req, res) => {
  const players = await readData('players.json');
  res.json(players);
});

// API endpoint for a specific player's stats
app.get('/api/players/:id/stats', async (req, res) => {
  const stats = await readData('stats.json');
  const playerStats = stats.filter(s => s.player_id === req.params.id);
  res.json(playerStats);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
