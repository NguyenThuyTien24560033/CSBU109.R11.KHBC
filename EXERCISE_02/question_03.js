const { pool, setupDatabaseAndSeedData } = require('./mysql_demo');

async function question3() {
  try {
    await setupDatabaseAndSeedData(pool);

    console.log('\n=== QUESTION 3: AGGREGATE FUNCTIONS ===');

    const sql = `
      SELECT 
        SUM(quantity) AS total_stock_quantity,
        AVG(price) AS average_price,
        COUNT(*) AS total_number_of_items
      FROM items
    `;

    const [rows] = await pool.execute(sql);

    console.log('Overall aggregate statistics for items table:');
    console.log(rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

question3();