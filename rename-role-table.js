const mysql = require('mysql2/promise');

async function renameTable() {
  const connection = await mysql.createConnection({
    host: '172.28.229.252',
    user: 'root',
    password: 'pAssw0rd',
    database: 'nkdt'
  });

  try {
    console.log('Connecting to database...');
    
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    console.log('Foreign key checks disabled');
    
    await connection.execute('RENAME TABLE `Role_` TO `Role`');
    console.log('✓ Table renamed: Role_ → Role');
    
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('Foreign key checks enabled');
    
    console.log('✓ Done!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

renameTable();
