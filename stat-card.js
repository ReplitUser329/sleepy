let previousStats = {};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const playerId = params.get('playerId');
    const playerName = params.get('playerName');
    const playerPosition = params.get('playerPosition');
    const playerTeam = params.get('playerTeam');

    document.getElementById('player-name').textContent = playerName;
    document.getElementById('player-details').textContent = `${playerPosition} | ${playerTeam}`;
    document.getElementById('player-photo').src = `https://sleepercdn.com/content/nba/players/${playerId}.jpg`;

    if (playerId) {
        fetchLatestGameStats(playerId);
        fetchSeasonAverages(playerId);
        setInterval(() => fetchLatestGameStats(playerId), 30000);
    }
});

async function fetchLatestGameStats(playerId) {
    try {
        const statsResponse = await fetch(`/api/players/${playerId}/stats`);
        const statsData = await statsResponse.json();
        const playerStats = statsData[0];

        if (playerStats) {
            const game = playerStats.game;
            document.getElementById('game-details').textContent = `${game.home_team.full_name} vs ${game.visitor_team.full_name} | Status: ${game.status}`;
            displayPlayerStats(playerStats);
            previousStats = playerStats;
        } else {
            document.getElementById('basic-stats').textContent = 'No recent stats available for this player.';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('game-details').textContent = `Failed to load game data: ${error.message}`;
    }
}

function displayPlayerStats(stats) {
    const container = document.getElementById('basic-stats');
    container.innerHTML = `
        ${getStatHTML('Points', stats.pts, previousStats.pts, 'Total points scored')}
        ${getStatHTML('Rebounds', stats.reb, previousStats.reb, 'Total rebounds')}
        ${getStatHTML('Assists', stats.ast, previousStats.ast, 'Total assists')}
        ${getStatHTML('Steals', stats.stl, previousStats.stl, 'Total steals')}
        ${getStatHTML('Blocks', stats.blk, previousStats.blk, 'Total blocks')}
        ${getStatHTML('Turnovers', stats.turnover, previousStats.turnover, 'Total turnovers')}
    `;

    const gameStatsContainer = document.getElementById('game-stats');
    gameStatsContainer.innerHTML = `
        <div class="grid">
            <div class="card"><span>Minutes: ${stats.min}</span></div>
            <div class="card"><span>FG: ${stats.fgm}/${stats.fga} (${(stats.fg_pct * 100).toFixed(1)}%)</span></div>
            <div class="card"><span>3PT: ${stats.fg3m}/${stats.fg3a} (${(stats.fg3_pct * 100).toFixed(1)}%)</span></div>
            <div class="card"><span>FT: ${stats.ftm}/${stats.fta} (${(stats.ft_pct * 100).toFixed(1)}%)</span></div>
        </div>
    `;

    calculateAndDisplayAdvancedMetrics(stats);
    calculateAndDisplayFantasyPoints(stats);
}

function getStatHTML(label, currentValue, previousValue, tooltipText) {
    let updatedClass = '';
    if (previousValue !== undefined && currentValue !== previousValue) {
        updatedClass = 'updated';
    }

    const statHtml = `
        <div class="card tooltip">
            <span class="stat-value ${updatedClass}">${currentValue}</span>
            <span>${label}</span>
            <span class="tooltiptext">${tooltipText}</span>
        </div>
    `;

    if (updatedClass) {
        setTimeout(() => {
            const statElement = document.querySelector(`.stat-value.${updatedClass}`);
            if (statElement) {
                statElement.classList.remove('updated');
            }
        }, 1000);
    }
    return statHtml;
}

function calculateAndDisplayAdvancedMetrics(playerStats) {
    const { pts, fga, fta, fg3m } = playerStats;
    const ts_pct = fga + 0.44 * fta > 0 ? (pts / (2 * (fga + 0.44 * fta)) * 100).toFixed(2) : 0;
    const efg_pct = fga > 0 ? ((playerStats.fgm + 0.5 * fg3m) / fga * 100).toFixed(2) : 0;

    const container = document.getElementById('advanced-metrics');
    container.innerHTML = `
        <div class="grid">
            <div class="card"><span>TS%: ${ts_pct}%</span></div>
            <div class="card"><span>eFG%: ${efg_pct}%</span></div>
        </div>
    `;
}

function calculateAndDisplayFantasyPoints(stats) {
    const { pts, reb, ast, stl, blk, turnover } = stats;
    const fantasyPoints = (pts * 1) + (reb * 1.2) + (ast * 1.5) + (stl * 3) + (blk * 3) - (turnover * 2);

    const container = document.getElementById('fantasy-breakdown');
    container.innerHTML = `
        <h3>Total Fantasy Points: ${fantasyPoints.toFixed(2)}</h3>
        <p>Based on a standard scoring system: +1 for points, +1.2 for rebounds, +1.5 for assists, +3 for steals and blocks, -2 for turnovers.</p>
    `;
}

async function fetchSeasonAverages(playerId) {
    try {
        const response = await fetch(`/api/players/${playerId}/season_averages`);
        const data = await response.json();
        const seasonAverages = data.data[0];

        const container = document.getElementById('season-averages');
        if (seasonAverages) {
            container.innerHTML = `
                <div class="grid">
                    <div class="card"><span>Games Played: ${seasonAverages.games_played}</span></div>
                    <div class="card"><span>PTS: ${seasonAverages.pts}</span></div>
                    <div class="card"><span>REB: ${seasonAverages.reb}</span></div>
                    <div class="card"><span>AST: ${seasonAverages.ast}</span></div>
                    <div class="card"><span>STL: ${seasonAverages.stl}</span></div>
                    <div class="card"><span>BLK: ${seasonAverages.blk}</span></div>
                    <div class="card"><span>Turnovers: ${seasonAverages.turnover}</span></div>
                    <div class="card"><span>Minutes: ${seasonAverages.min}</span></div>
                </div>
            `;
        } else {
            container.innerHTML = `<p>No season averages available for this player.</p>`;
        }
    } catch (error) {
        console.error('Error fetching season averages:', error);
        document.getElementById('season-averages').innerHTML = `<p>Failed to load season averages.</p>`;
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
        tabcontent[i].style.opacity = 0;
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    const activeTab = document.getElementById(tabName);
    activeTab.style.display = "block";
    setTimeout(() => {
        activeTab.style.opacity = 1;
        activeTab.classList.add("active");
    }, 10);

    evt.currentTarget.className += " active";
}
