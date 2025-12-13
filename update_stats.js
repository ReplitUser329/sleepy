const { writeData, readData } = require('./db/utils');
const axios = require('axios');
const { fetchPlayers } = require('./services/data-fetchers/sleeper');

async function updateAllStats() {
  console.log('Starting stats update...');

  try {
    // 1. Fetch players
    const players = await fetchPlayers();
    await writeData('players.json', players);
    console.log(`Found ${players.length} players.`);

    let allStats = [];
    const batchSize = 20;
    for (let i = 0; i < players.length; i += batchSize) {
        const batch = players.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1}...`);
        const batchPromises = batch.map(player =>
            axios.get(`https://www.balldontlie.io/api/v1/stats?player_ids[]=${player.player_id}&per_page=1`)
                .then(response => response.data.data[0])
                .catch(error => {
                    console.error(`Error fetching stats for player ${player.player_id}:`, error.message);
                    return null;
                })
        );

        const batchResults = await Promise.all(batchPromises);
        allStats.push(...batchResults.filter(result => result !== null));

        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await writeData('stats.json', allStats);
    console.log('Successfully fetched and saved game stats.');

    console.log('Stats update complete.');

  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

updateAllStats();
