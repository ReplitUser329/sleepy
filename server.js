const express = require("express");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const BDL_BASE = "https://www.balldontlie.io/api/v1";
// No API key needed for the public v1 endpoints

let seenPlays = new Set();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

async function fetchPlays(gameId) {
  try {
    // The prompt mentions a /plays endpoint, which is not standard in v1.
    // However, we will use it as specified. If this were a real project,
    // we'd need to confirm the API capabilities.
    const res = await axios.get(`${BDL_BASE}/plays`, {
      params: { game_ids: [gameId] }
    });
    return res.data.data;
  } catch (error) {
    // console.error(`Error fetching plays for gameId ${gameId}:`, error.message);
    // Gracefully fail if the endpoint doesn't exist or there's an error.
    return [];
  }
}

function mapShotToZone(play) {
  const desc = play.description?.toLowerCase() || "";
  // shot_distance is not available in the standard `plays` object, this is an assumption
  const dist = play.shot_distance || 0;

  if (desc.includes("dunk") || dist < 3) return "rim";
  if (dist < 8) return "paint";
  if (dist < 16) return "midrange";
  if (dist >= 22 && desc.includes("corner")) return "corner3";
  if (dist >= 22) return "arc3";
  return "unknown";
}

async function pollGame(gameId, playerId) {
    const plays = await fetchPlays(gameId);

    if (!plays || plays.length === 0) {
        return;
    }

    for (const play of plays.reverse()) { // Process chronologically
        if (seenPlays.has(play.id)) continue;

        // Check if the play is a shot attempt by a specific player
        if (play.player?.id === playerId && play.shot_value !== null) {
            seenPlays.add(play.id);

            const shot = {
                id: play.id,
                game_id: gameId,
                player_id: playerId,
                zone: mapShotToZone(play),
                made: play.shot_made, // API uses shot_made
                points: play.shot_made ? play.shot_value : 0,
                quarter: play.period,
                clock: play.time_remaining
            };

            io.emit("shot", shot);
            // TODO: insert into DB
        }
    }
}

// Example gameId and player ID from the prompt.
// Note: This is a fictional gameId for demonstration.
setInterval(() => {
  pollGame(123456, 132); // gameId=123456, playerId=132 (Luka Dončić)
}, 3000);

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
