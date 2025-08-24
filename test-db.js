const mysql = require('mysql2/promise');

async function testDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'dev',
        password: 'erp',
        database: 'erp'
    });

    try {
        console.log('Testing database connection and tables...');
        
        // List all tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('All tables:', tables.map(row => Object.values(row)[0]));
        
        // Check specific tables
        const [removeTable] = await connection.execute('SHOW TABLES LIKE "ericsson_boq_remove_materials"');
        const [surplusTable] = await connection.execute('SHOW TABLES LIKE "ericsson_boq_surplus_materials"');
        const [oldTable] = await connection.execute('SHOW TABLES LIKE "ericsson_boq_materials"');
        
        console.log('Remove materials table exists:', removeTable.length > 0);
        console.log('Surplus materials table exists:', surplusTable.length > 0);
        console.log('Old materials table exists:', oldTable.length > 0);
        
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await connection.end();
    }
}

testDatabase(); 