/**
 * Calculates True Shooting Percentage (TS%).
 * @param {number} pts - Points.
 * @param {number} fga - Field Goals Attempted.
 * @param {number} fta - Free Throws Attempted.
 * @returns {number} - True Shooting Percentage.
 */
function calculateTS(pts, fga, fta) {
  if (fga === 0 && fta === 0) {
    return 0;
  }
  return pts / (2 * (fga + 0.44 * fta));
}

/**
 * Calculates Effective Field Goal Percentage (eFG%).
 * @param {number} fgm - Field Goals Made.
 * @param {number} tpm - Three Pointers Made.
 * @param {number} fga - Field Goals Attempted.
 * @returns {number} - Effective Field Goal Percentage.
 */
function calculateEFG(fgm, tpm, fga) {
  if (fga === 0) {
    return 0;
  }
  return (fgm + 0.5 * tpm) / fga;
}

module.exports = {
  calculateTS,
  calculateEFG,
};
