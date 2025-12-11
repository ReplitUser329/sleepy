/**
 * Calculates an estimated Offensive Rating for a player.
 * This is a simplified version and requires team and opponent data for full accuracy.
 * @param {number} pts - Points scored by the player.
 * @param {number} fga - Field Goals Attempted.
 * @param {number} fta - Free Throws Attempted.
 * @param {number} tov - Turnovers.
 * @returns {number} - Estimated Offensive Rating.
 */
function calculateOffensiveRating(pts, fga, fta, tov) {
  const possessions = fga + 0.44 * fta + tov;
  if (possessions === 0) {
    return 0;
  }
  return (pts / possessions) * 100;
}

/**
 * Calculates an estimated Defensive Rating for a player.
 * Note: Individual Defensive Rating is very difficult to calculate accurately
 * and typically relies on complex play-by-play data. This is a placeholder.
 * For now, we'll return a placeholder value.
 * @returns {number} - Placeholder Defensive Rating.
 */
function calculateDefensiveRating() {
  // A true defensive rating would require much more data.
  // Returning a placeholder for now.
  return 100;
}


/**
 * Calculates Net Rating.
 * @param {number} offRating - Offensive Rating.
 * @param {number} defRating - Defensive Rating.
 * @returns {number} - Net Rating.
 */
function calculateNetRating(offRating, defRating) {
  return offRating - defRating;
}

module.exports = {
  calculateOffensiveRating,
  calculateDefensiveRating,
  calculateNetRating,
};
