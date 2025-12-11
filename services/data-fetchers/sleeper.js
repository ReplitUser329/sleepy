const fetch = require('node-fetch');

async function fetchPlayers() {
  const res = await fetch('https://api.sleeper.app/v1/players/nba');
  const data = await res.json();
  return Object.values(data).filter(p => p.first_name && p.last_name).sort((a, b) => a.last_name.localeCompare(b.last_name));
}

module.exports = {
  fetchPlayers,
};
