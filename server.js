const express = require('express');
const path = require('path');
const { readData } = require('./db/utils');
const axios = require('axios');
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

// API endpoint for top performers
app.get('/api/top-performers', async (req, res) => {
    const stats = await readData('stats.json');
    const topPlayers = stats.filter(s => s.pts).sort((a,b) => b.pts - a.pts).slice(0, 5);
    res.json(topPlayers);
});

// API endpoint for games
app.get('/api/games', async (req, res) => {
    const response = await axios.get('https://api.sleeper.app/v1/state/nba');
    res.json(response.data.nba_games);
});

// API endpoint for news
app.get('/api/news', async (req, res) => {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=sports&q=NBA&apiKey=${process.env.NEWS_API_KEY}&pageSize=6`);
    res.json(response.data);
});

// API endpoint for season averages
app.get('/api/players/:id/season_averages', async (req, res) => {
    const response = await axios.get(`https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${req.params.id}`);
    res.json(response.data);
});

// API endpoint for game stats
app.get('/api/players/stats/game', async (req, res) => {
    const stats = await readData('stats.json');
    res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
