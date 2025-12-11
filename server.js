const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Placeholder function to mock fetching player game data
async function getPlayerGameStatCard(playerId, gameId) {
  // In a real application, you would fetch this data from a database or a third-party API
  return {
    player: {
      id: playerId,
      name: "Luka Dončić",
      team: "DAL",
      position: "G-F",
      image: "https://sleepercdn.com/content/nba/players/4882.webp"
    },
    latestGame: {
      id: gameId,
      status: "LIVE — Q3 5:11",
      pts: 28,
      reb: 9,
      ast: 12,
      stl: 2,
      blk: 1,
      tov: 4,
      minutes: "34:12",
      fg_pct: 0.55,
      fg3_pct: 0.40,
      ft_pct: 0.90
    },
    advanced: {
      pace: 98.5,
      usage_rate: 0.35,
      true_shooting_pct: 0.65,
      effective_fg_pct: 0.60
    },
    seasonTotals: {
      pts_avg: 33.9,
      reb_avg: 9.2,
      ast_avg: 9.8
    }
  };
}

app.get("/nba/players/:id/games/:gameId/stat-card", async (req, res) => {
  const { id, gameId } = req.params;
  const data = await getPlayerGameStatCard(id, gameId);
  return res.json(data);
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
