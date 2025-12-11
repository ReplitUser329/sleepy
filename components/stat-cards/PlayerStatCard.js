// Note: The following functions are simplified for demonstration and will be moved
// to their respective files in the utils/stats-calculations/ directory.

/**
 * Calculates True Shooting Percentage (TS%).
 */
function calculateTS(pts, fga, fta) {
  if (fga === 0 && fta === 0) return 0;
  return (pts / (2 * (fga + 0.44 * fta)) * 100).toFixed(1);
}

/**
 * Calculates Effective Field Goal Percentage (eFG%).
 */
function calculateEFG(fgm, tpm, fga) {
  if (fga === 0) return 0;
  return ((fgm + 0.5 * tpm) / fga * 100).toFixed(1);
}


async function renderPlayerStatCard(player, container) {
  // Fetch the stat card HTML
  const res = await fetch('components/stat-cards/PlayerStatCard.html');
  const html = await res.text();
  container.innerHTML = html;

  // Populate the stat card with player data
  document.getElementById('player-name').textContent = `${player.first_name} ${player.last_name}`;
  document.getElementById('player-team-pos').textContent = `${player.team || 'N/A'} - ${player.position || 'N/A'}`;
  document.getElementById('player-image').src = `https://sleepercdn.com/content/nba/players/thumb/${player.player_id}.jpg`;

  // Fetch and display recent game stats from our new API
  const statsRes = await fetch(`/api/players/${player.player_id}/stats`);
  const playerStats = await statsRes.json();

  const recentGameContainer = document.getElementById('recent-game-stats');
  const advancedStatsContainer = document.getElementById('advanced-stats');
  const gameLogContainer = document.getElementById('game-log');

  recentGameContainer.innerHTML = '';
  advancedStatsContainer.innerHTML = '';
  gameLogContainer.innerHTML = '';

  if (playerStats.length > 0) {
    // Render Recent Game Stats
    const recentGame = playerStats[0];
    for (const [stat, value] of Object.entries(recentGame)) {
      if (stat === 'player_id') continue;
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<div class="stat-label">${stat.toUpperCase()}</div><div class="stat-value">${value}</div>`;
      recentGameContainer.appendChild(div);
    }

    // Render Advanced Stats
    const advancedStats = {
      'TS%': calculateTS(recentGame.pts, recentGame.fga || 10, recentGame.fta || 5),
      'eFG%': calculateEFG(recentGame.fgm || 8, recentGame.fg3m || 2, recentGame.fga || 15),
    };
    for (const [stat, value] of Object.entries(advancedStats)) {
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<div class="stat-label">${stat}</div><div class="stat-value">${value}%</div>`;
      advancedStatsContainer.appendChild(div);
    }

    // Render Game Log (as a simple list for now)
    const gameLogList = document.createElement('ul');
    playerStats.forEach(game => {
      const listItem = document.createElement('li');
      listItem.textContent = `Game: ${game.game_id || 'N/A'} - PTS: ${game.pts}, REB: ${game.reb}, AST: ${game.ast}`;
      gameLogList.appendChild(listItem);
    });
    gameLogContainer.appendChild(gameLogList);

  } else {
    recentGameContainer.innerHTML = '<p>No recent game stats available.</p>';
  }
}

// Override the showPlayerDetails function to use the new stat card
async function showPlayerDetails(player) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const content = document.getElementById('modal-content');

  title.textContent = `${player.first_name} ${player.last_name}`;
  content.innerHTML = ''; // Clear previous content

  await renderPlayerStatCard(player, content);

  modal.style.display = 'block';
}
