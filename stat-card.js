let previousStats = {};

document.addEventListener('DOMContentLoaded', () => {
    // Hardcode a player and game for verification
    const playerName = "Nikola Jokic";
    const gameDate = "2024-05-19"; // A date with a known game for this player

    document.getElementById('player-name').textContent = playerName;

    // Fetch data immediately and then every 30 seconds
    fetchGameAndPlayerStats(237, gameDate); // Hardcoded player ID for Nikola Jokic
    setInterval(() => fetchGameAndPlayerStats(237, gameDate), 30000);
});

async function fetchGameAndPlayerStats(playerId, gameDate) {
    try {
        const statsResponse = await fetch(`https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&dates[]=${gameDate}`);
        const statsData = await statsResponse.json();
        const playerStats = statsData.data[0];

        if (playerStats) {
            const game = playerStats.game;
            document.getElementById('game-details').textContent = `${game.home_team.full_name} vs ${game.visitor_team.full_name}`;
            displayPlayerStats(playerStats, [], playerStats.team.abbreviation);
            previousStats = playerStats;
        } else {
            document.getElementById('basic-stats').textContent = 'No stats available for this player in this game.';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('game-details').textContent = `Failed to load game data: ${error.message}`;
    }
}

function displayPlayerStats(stats, allGameStats, teamAbbreviation) {
    const container = document.getElementById('basic-stats');
    container.innerHTML = `
        <div class="card">${getStatHTML('Points', stats.pts, previousStats.pts)}</div>
        <div class="card">${getStatHTML('Rebounds', stats.reb, previousStats.reb)}</div>
        <div class="card">${getStatHTML('Assists', stats.ast, previousStats.ast)}</div>
        <div class="card">${getStatHTML('Steals', stats.stl, previousStats.stl)}</div>
        <div class="card">${getStatHTML('Blocks', stats.blk, previousStats.blk)}</div>
        <div class="card">${getStatHTML('Turnovers', stats.turnover, previousStats.turnover)}</div>
        <div class="card"><span>Minutes: ${stats.min}</span></div>
        <div class="card"><span>FG: ${stats.fgm}/${stats.fga} (${stats.fg_pct}%)</span></div>
        <div class="card"><span>3PT: ${stats.fg3m}/${stats.fg3a} (${stats.fg3_pct}%)</span></div>
        <div class="card"><span>FT: ${stats.ftm}/${stats.fta} (${stats.ft_pct}%)</span></div>
    `;
    calculateAndDisplayAdvancedMetrics(stats, allGameStats, teamAbbreviation);
}

function getStatHTML(label, currentValue, previousValue) {
    let trendClass = '';
    if (previousValue !== undefined) {
        if (currentValue > previousValue) {
            trendClass = 'trend-up';
        } else if (currentValue < previousValue) {
            trendClass = 'trend-down';
        }
    }
    return `<span class="${trendClass}">${label}: ${currentValue}</span>`;
}

function calculateAndDisplayAdvancedMetrics(playerStats, allGameStats, teamAbbreviation) {
    const { pts, fga, fta, fg3m, turnover } = playerStats;

    // Calculate TS% and eFG%
    const ts_pct = fga + 0.44 * fta > 0 ? (pts / (2 * (fga + 0.44 * fta)) * 100).toFixed(2) : 0;
    const efg_pct = fga > 0 ? ((playerStats.fgm + 0.5 * fg3m) / fga * 100).toFixed(2) : 0;

    // USG% calculation is omitted in this simplified version.

    const container = document.getElementById('advanced-metrics');
    container.innerHTML = `
        <div class="card"><span>TS%: ${ts_pct}%</span></div>
        <div class="card"><span>eFG%: ${efg_pct}%</span></div>
    `;
}
