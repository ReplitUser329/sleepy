let allPlayers=[], allTeams={}, standingsSorted=false, allGames=[];

// Fetch players
async function fetchPlayers(){
  const res=await fetch('https://api.sleeper.app/v1/players/nba');
  const data=await res.json();
  const allStarNames = [
    "Luka Dončić", "Stephen Curry", "Victor Wembanyama", "Kevin Durant", "Shai Gilgeous-Alexander",
    "LeBron James", "Giannis Antetokounmpo", "Nikola Jokić", "Joel Embiid", "Jayson Tatum",
    "Damian Lillard", "Donovan Mitchell", "Jaylen Brown", "Tyrese Haliburton", "Bam Adebayo",
    "Julius Randle", "Jalen Brunson", "Trae Young", "Paolo Banchero", "Anthony Edwards",
    "Karl-Anthony Towns", "Kawhi Leonard", "Devin Booker", "Anthony Davis"
  ];
  allPlayers=Object.values(data).filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`;
    return allStarNames.includes(fullName);
  }).sort((a,b)=>a.last_name.localeCompare(b.last_name));

  await fetchLocalPlayerStats(allPlayers);
  displayPlayers(allPlayers);
}

async function fetchLocalPlayerStats(players) {
  for (const player of players) {
    try {
      const res = await fetch(`/api/players/${player.player_id}/stats`);
      const stats = await res.json();
      // Find the stats for the specific date "2025-12-12"
      if (stats && stats.length > 0) {
        const statForDate = stats.find(stat => stat.date === "2025-12-12");
        if (statForDate) {
          player.stats = statForDate;
        }
      }
    } catch (error) {
      console.error(`Error fetching local stats for ${player.first_name} ${player.last_name}:`, error);
    }
  }
}

// Display players
function displayPlayers(players){
  const container=document.getElementById('players');
  container.innerHTML='';
  players.forEach(p=>{
    const div=document.createElement('div');
    div.className='card';
    let statsHTML = '<span>No recent game stats</span>';
    if (p.stats) {
        statsHTML = `<span>PTS: ${p.stats.pts} | REB: ${p.stats.reb} | AST: ${p.stats.ast}</span>`;
    }
    div.innerHTML=`<img src="https://sleepercdn.com/content/nba/players/${p.player_id}.jpg" alt="${p.first_name} ${p.last_name}" class="player-image" onerror="this.style.display='none'">
                   <span><strong>${p.first_name} ${p.last_name}</strong></span>
                   <span>Team: ${p.team||"N/A"}</span>
                   <span>Position: ${p.position||"N/A"}</span>
                   ${statsHTML}`;
    div.addEventListener('click',()=>showPlayerDetails(p));
    container.appendChild(div);
  });
}

// Search players
document.getElementById('search').addEventListener('input', e=>{
  const q=e.target.value.toLowerCase();
  displayPlayers(allPlayers.filter(p=>`${p.first_name} ${p.last_name}`.toLowerCase().includes(q)||
    (p.team&&p.team.toLowerCase().includes(q))||(p.position&&p.position.toLowerCase().includes(q))));
});

// Top performers
async function displayTopPerformers(){
  const res=await fetch('https://api.sleeper.app/v1/stats/nba/2025/1');
  const stats=await res.json();
  const container=document.getElementById('top-performers');
  const topPlayers=stats.filter(s=>s.pts).sort((a,b)=>b.pts-a.pts).slice(0,5);
  container.innerHTML='';
  topPlayers.forEach(stat=>{
    const player=allPlayers.find(p=>p.player_id===stat.player_id);
    if(!player) return;
    const div=document.createElement('div');
    div.className='top-card';
    div.innerHTML=`<span>${player.first_name} ${player.last_name}</span>
                   <span>${player.team}</span>
                   <span>${stat.pts} pts | ${stat.reb} reb | ${stat.ast} ast</span>`;
    container.appendChild(div);
  });
}

// Fetch games
async function fetchGames(){
  const res=await fetch('https://api.sleeper.app/v1/state/nba');
  const data=await res.json();
  allGames=data.nba_games;
  const container=document.getElementById('games');
  container.innerHTML='';
  allGames.slice(-6).forEach(game=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<span>${game.home_team} ${game.home_score}</span>
                   <span>${game.away_team} ${game.away_score}</span>
                   <span>Status: ${game.status}</span>`;
    div.addEventListener('click',()=>showGameDetails(game));
    container.appendChild(div);
  });
}

// Fetch teams
async function fetchTeams(){
  const res=await fetch('https://api.sleeper.app/v1/teams/nba');
  const teams=await res.json();
  allTeams=teams;
  const container=document.getElementById('teams');
  container.innerHTML='';
  Object.values(teams).forEach(team=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<img src="https://sleepercdn.com/content/nba/logos/${team.team_id}.png" alt="${team.full_name}" class="team-logo" onerror="this.style.display='none'">
                   <span>${team.full_name} (${team.abbr})</span>
                   <span>Conf: ${team.conference} | Div: ${team.division}</span>`;
    container.appendChild(div);
  });
  displayStandings();
}

// Standings
function displayStandings(){
  const container=document.getElementById('standings');
  container.innerHTML='';
  let teamsArray=Object.values(allTeams);
  if(standingsSorted) teamsArray.sort((a,b)=>(b.settings.wins||0)-(a.settings.wins||0));
  teamsArray.forEach(team=>{
    const div=document.createElement('div');
    div.className='card';
    div.textContent=`${team.full_name} | ${team.settings.wins||0}-${team.settings.losses||0}`;
    container.appendChild(div);
  });
}

// Toggle standings sort
document.getElementById('sort-standings').addEventListener('click', ()=>{
  standingsSorted=!standingsSorted;
  displayStandings();
});

// Fetch news (replace YOUR_NEWSAPI_KEY)
async function fetchNews(){
  try{
    const res=await fetch('https://newsapi.org/v2/top-headlines?category=sports&q=NBA&apiKey=YOUR_NEWSAPI_KEY&pageSize=6');
    const data=await res.json();
    const container=document.getElementById('news');
    container.innerHTML='';
    data.articles.forEach(article=>{
      const div=document.createElement('div');
      div.className='card';
      div.innerHTML=`<span><strong>${article.title}</strong></span>
                     <span>${article.source.name}</span>
                     <a href="${article.url}" target="_blank" style="color:#ff69b4;">Read</a>`;
      container.appendChild(div);
    });
  }catch(err){ console.error(err);}
}

// Navigate to player stat card
function showPlayerDetails(player) {
    const gameId = 'latest'; // The stat-card.js will handle fetching the latest game
    const playerName = `${player.first_name} ${player.last_name}`;
    window.location.href = `stat-card.html?playerId=${player.player_id}&gameId=${gameId}&playerName=${playerName}&playerPosition=${player.position}&playerTeam=${player.team}`;
}

// Show game details modal
async function showGameDetails(game){
  const modal=document.getElementById('modal');
  const title=document.getElementById('modal-title');
  const content=document.getElementById('modal-content');
  title.textContent=`${game.away_team} @ ${game.home_team}`;
  let gameInfo = `
    <p><strong>Status:</strong> ${game.status}</p>
    <p><strong>Score:</strong> ${game.away_team} ${game.away_score} - ${game.home_team} ${game.home_score}</p>
  `;
  content.innerHTML= gameInfo + 'Loading player stats...';
  try{
    const res=await fetch('https://api.sleeper.app/v1/stats/nba/2025/1');
    const stats=await res.json();
    const playersInGame=stats.filter(s=>s.team===game.home_team||s.team===game.away_team);
    if(playersInGame.length===0){ content.innerHTML= gameInfo + '<span>No stats available.</span>'; }
    else{
      let homePlayers = playersInGame.filter(p => p.team === game.home_team);
      let awayPlayers = playersInGame.filter(p => p.team === game.away_team);
      let statsTable = `
        <h2>${game.home_team}</h2>
        <div class="table-header">
          <span>Player</span><span>PTS</span><span>REB</span><span>AST</span>
        </div>
      `;
      homePlayers.forEach(s=>{
        const player=allPlayers.find(p=>p.player_id===s.player_id);
        if(!player) return;
        statsTable += `
          <div class="table-row">
            <span>${player.first_name} ${player.last_name}</span><span>${s.pts||0}</span><span>${s.reb||0}</span><span>${s.ast||0}</span>
          </div>
        `;
      });
      statsTable += `
        <h2>${game.away_team}</h2>
        <div class="table-header">
          <span>Player</span><span>PTS</span><span>REB</span><span>AST</span>
        </div>
      `;
      awayPlayers.forEach(s=>{
        const player=allPlayers.find(p=>p.player_id===s.player_id);
        if(!player) return;
        statsTable += `
          <div class="table-row">
            <span>${player.first_name} ${player.last_name}</span><span>${s.pts||0}</span><span>${s.reb||0}</span><span>${s.ast||0}</span>
          </div>
        `;
      });
      content.innerHTML = gameInfo + statsTable;
    }
    modal.style.display='block';
  }catch(err){ content.innerHTML='Error loading stats'; console.error(err);}
}

// Close modal
document.getElementById('close-modal').addEventListener('click', ()=>{ document.getElementById('modal').style.display='none'; });

// Initialize
fetchPlayers();
displayTopPerformers();
fetchGames();
fetchTeams();
fetchNews();
