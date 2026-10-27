const readline = require('readline');
const { pool, setupDatabaseAndSeedData } = require('./mysql_demo');

async function searchProductsByKeyword(pool, keyword) {
  const sql = `
    SELECT * FROM items 
    WHERE item_name LIKE ?
  `;
  
  const searchPattern = `%${keyword}%`;
  const [rows] = await pool.execute(sql, [searchPattern]);
  return rows;
}

function promptUser(queryText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(queryText, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function question2() {
  try {
    await setupDatabaseAndSeedData(pool);

    console.log('\n=== QUESTION 2: WILDCARD / LIKE SEARCH ===');

    const keyword = await promptUser('Enter search keyword (e.g., Wireless, Gaming): ');

    console.log(`\n--- Search results for keyword "${keyword}": ---`);
    const searchResults = await searchProductsByKeyword(pool, keyword);
    console.log(searchResults);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

question2();