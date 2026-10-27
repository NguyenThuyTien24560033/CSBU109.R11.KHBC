const { pool, setupDatabaseAndSeedData } = require('./mysql_demo');

async function question4() {
  try {
    await setupDatabaseAndSeedData(pool);

    console.log('\n=== QUESTION 4: GROUP BY & HAVING ===');

    const sql = `
      SELECT 
        category_id,
        COUNT(*) AS item_count,
        SUM(price * quantity) AS total_inventory_value
      FROM items
      GROUP BY category_id
      HAVING total_inventory_value > 10000000
    `;

    const [rows] = await pool.execute(sql);

    console.log('Categories with total inventory value > 10,000,000 VND:');
    console.log(rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

question4();