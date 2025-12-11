const { fetchPlayers } = require('./services/data-fetchers/sleeper');
const { writeData } = require('./db/utils');

async function updateAllStats() {
  console.log('Starting stats update...');

  try {
    // 1. Fetch players
    const players = await fetchPlayers();
    await writeData('players.json', players);
    console.log('Successfully fetched and saved players.');

    // 2. Fetch game stats (using mock data for now)
    const gameStats = [
      { "player_id": "1432", "pts": 25, "reb": 10, "ast": 5 },
      { "player_id": "1846", "pts": 30, "reb": 5, "ast": 8 }
    ];
    await writeData('stats.json', gameStats);
    console.log('Successfully saved mock game stats.');

    console.log('Stats update complete.');

  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

updateAllStats();
