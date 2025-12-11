import { useEffect, useState } from "react";
import "./playerStatCard.css";

const GameStatsTab = ({ data }) => (
  <div className="psc-grid">
    <StatItem label="FG%" value={data.fg_pct} />
    <StatItem label="3P%" value={data.fg3_pct} />
    <StatItem label="FT%" value={data.ft_pct} />
  </div>
);

const AdvancedStatsTab = ({ data }) => (
  <div className="psc-grid">
    <StatItem label="Pace" value={data.pace} />
    <StatItem label="Usage" value={data.usage_rate} />
    <StatItem label="TS%" value={data.true_shooting_pct} />
    <StatItem label="eFG%" value={data.effective_fg_pct} />
  </div>
);

const FantasyTab = ({ playerId }) => <div>Fantasy Breakdown Content</div>;
const SeasonTab = ({ data }) => <div>Season Averages Content</div>;

const StatItem = ({ label, value }) => (
  <div className="psc-grid-item">
    <span className="psc-grid-label">{label}</span>
    <span className="psc-grid-value">{value}</span>
  </div>
);

export default function PlayerStatCard({ playerId, gameId }) {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("game");

  useEffect(() => {
    fetch(`http://localhost:3000/nba/players/${playerId}/games/${gameId}/stat-card`)
      .then(res => res.json())
      .then(setData);
  }, [playerId, gameId]);

  useEffect(() => {
    // Live polling for updates every 20 seconds
    const interval = setInterval(() => {
      fetch(`http://localhost:3000/nba/players/${playerId}/games/${gameId}/stat-card`)
        .then(res => res.json())
        .then(updateWithAnimation);
    }, 20000);

    return () => clearInterval(interval);
  }, [playerId, gameId]);

  const [flashStat, setFlashStat] = useState(null);

  useEffect(() => {
    if (flashStat) {
      const el = document.getElementById(`psc-${flashStat}`);
      el.classList.add("flash");
      setTimeout(() => {
        el.classList.remove("flash");
        setFlashStat(null);
      }, 1200);
    }
  }, [flashStat]);

  function updateWithAnimation(newData) {
    if (!data) {
      setData(newData);
      return;
    }

    const statsToCompare = ["pts", "reb", "ast", "stl", "blk", "tov"];
    statsToCompare.forEach(stat => {
      if (newData.latestGame[stat] !== data.latestGame[stat]) {
        setFlashStat(stat);
      }
    });

    setData(newData);
  }

  if (!data) return <div className="psc-loading">Loading player...</div>;

  const { player, latestGame, advanced } = data;

  return (
    <div className="player-card-container">
      {/* HEADER */}
      <div className="psc-header">
        <img className="psc-photo" src={player.image} alt={player.name} />

        <div className="psc-info">
          <h2>{player.name}</h2>
          <p>{player.team} • {player.position}</p>
          <p className="psc-status">{latestGame.status}</p>
        </div>
      </div>

      {/* MAIN STATS */}
      <div className="psc-main-stats">
        {renderMainStat("PTS", latestGame.pts)}
        {renderMainStat("REB", latestGame.reb)}
        {renderMainStat("AST", latestGame.ast)}
        {renderMainStat("STL", latestGame.stl)}
        {renderMainStat("BLK", latestGame.blk)}
        {renderMainStat("TOV", latestGame.tov)}
        {renderMainStat("MIN", latestGame.minutes)}
      </div>

      {/* TABS */}
      <div className="psc-tabs">
        <button onClick={() => setActiveTab("game")} className={activeTab === "game" ? "active" : ""}>Game Stats</button>
        <button onClick={() => setActiveTab("adv")} className={activeTab === "adv" ? "active" : ""}>Advanced</button>
        <button onClick={() => setActiveTab("fantasy")} className={activeTab === "fantasy" ? "active" : ""}>Fantasy</button>
        <button onClick={() => setActiveTab("season")} className={activeTab === "season" ? "active" : ""}>Season</button>
      </div>

      <div className="psc-tab-content">
        {activeTab === "game" && <GameStatsTab data={latestGame} />}
        {activeTab === "adv" && <AdvancedStatsTab data={advanced} />}
        {activeTab === "fantasy" && <FantasyTab playerId={playerId} />}
        {activeTab === "season" && <SeasonTab data={data.seasonTotals} />}
      </div>
    </div>
  );
}

function renderMainStat(label, value) {
  return (
    <div className={`psc-stat`} id={`psc-${label.toLowerCase()}`}>
      <span className="psc-stat-label">{label}</span>
      <span className="psc-stat-value">{value}</span>
    </div>
  );
}
