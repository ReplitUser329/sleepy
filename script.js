let allPlayers=[], allTeams={}, standingsSorted=false, allGames=[];

// Fetch players
async function fetchPlayers(){
  const res=await fetch('https://api.sleeper.app/v1/players/nba');
  const data=await res.json();
  allPlayers=Object.values(data).filter(p=>p.first_name&&p.last_name).sort((a,b)=>a.last_name.localeCompare(b.last_name));
  displayPlayers(allPlayers);
}

// Display players
function displayPlayers(players){
  const container=document.getElementById('players');
  container.innerHTML='';
  players.forEach(p=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<span><strong>${p.first_name} ${p.last_name}</strong></span>
                   <span>Team: ${p.team||"N/A"}</span>
                   <span>Position: ${p.position||"N/A"}</span>`;
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
    div.innerHTML=`<span>${team.full_name} (${team.abbr})</span>
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
  if(standingsSorted) teamsArray.sort((a,b)=>(b.wins||0)-(a.wins||0));
  teamsArray.forEach(team=>{
    const div=document.createElement('div');
    div.className='card';
    div.textContent=`${team.full_name} | ${team.wins||0}-${team.losses||0}`;
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

// Show player details modal
async function showPlayerDetails(player){
  const modal=document.getElementById('modal');
  const title=document.getElementById('modal-title');
  const content=document.getElementById('modal-content');
  title.textContent=`${player.first_name} ${player.last_name}`;
  content.innerHTML='Loading stats...';
  try{
    const res=await fetch('https://api.sleeper.app/v1/stats/nba/2025/1');
    const stats=await res.json();
    const playerStats=stats.filter(s=>s.player_id===player.player_id);
    if(playerStats.length===0){ content.innerHTML='<span>No stats available.</span>'; }
    else{
      content.innerHTML='';
      // Create sortable table
      const header=document.createElement('div');
      header.className='table-header';
      header.innerHTML='<span>Date</span><span>PTS</span><span>REB</span><span>AST</span>';
      content.appendChild(header);
      playerStats.forEach(s=>{
        const row=document.createElement('div');
        row.className='table-row';
        row.innerHTML=`<span>${s.game_.id}</span><span>${s.pts||0}</span><span>${s.reb||0}</span><span>${s.ast||0}</span>`;
        content.appendChild(row);
      });
    }
    modal.style.display='block';
  }catch(err){ content.innerHTML='Error loading stats'; console.error(err);}
}

// Show game details modal
async function showGameDetails(game){
  const modal=document.getElementById('modal');
  const title=document.getElementById('modal-title');
  const content=document.getElementById('modal-content');
  title.textContent=`${game.away_team} @ ${game.home_team}`;
  content.innerHTML='Loading player stats...';
  try{
    const res=await fetch('https://api.sleeper.app/v1/stats/nba/2025/1');
    const stats=await res.json();
    const playersInGame=stats.filter(s=>s.team===game.home_team||s.team===game.away_team);
    if(playersInGame.length===0){ content.innerHTML='<span>No stats available.</span>'; }
    else{
      content.innerHTML='';
      const header=document.createElement('div');
      header.className='table-header';
      header.innerHTML='<span>Player</span><span>PTS</span><span>REB</span><span>AST</span>';
      content.appendChild(header);
      playersInGame.forEach(s=>{
        const player=allPlayers.find(p=>p.player_id===s.player_id);
        if(!player) return;
        const row=document.createElement('div');
        row.className='table-row';
        row.innerHTML=`<span>${player.first_name} ${player.last_name}</span><span>${s.pts||0}</span><span>${s.reb||0}</span><span>${s.ast||0}</span>`;
        content.appendChild(row);
      });
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
