const { pool, setupDatabaseAndSeedData } = require('./mysql_demo');

async function question1() {
  try {
    await setupDatabaseAndSeedData(pool);

    console.log('\n--- QUESTION 1: FILTER & SORT ---');
    const sql = `
      SELECT * FROM items 
      WHERE price >= ? AND quantity > ? 
      ORDER BY price DESC
    `;
    const [rows] = await pool.execute(sql, [500000, 0]);
    
    console.log('Products with price >= 500k and quantity > 0:');
    console.log(rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

question1();