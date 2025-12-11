const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname);

async function readData(filename) {
  const filepath = path.join(DB_PATH, filename);
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

async function writeData(filename, data) {
  const filepath = path.join(DB_PATH, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData,
};
