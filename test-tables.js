const mysql = require('mysql2/promise');

async function testTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'dev',
        password: 'erp',
        database: 'erp'
    });

    try {
        console.log('Testing table existence...');
        
        // Check if the new tables exist
        const [removeTable] = await connection.execute('SHOW TABLES LIKE "ericsson_boq_remove_materials"');
        const [surplusTable] = await connection.execute('SHOW TABLES LIKE "ericsson_boq_surplus_materials"');
        
        console.log('Remove materials table exists:', removeTable.length > 0);
        console.log('Surplus materials table exists:', surplusTable.length > 0);
        
        // Check table structure
        if (removeTable.length > 0) {
            const [removeColumns] = await connection.execute('DESCRIBE ericsson_boq_remove_materials');
            console.log('Remove materials table columns:', removeColumns.map(col => col.Field));
        }
        
        if (surplusTable.length > 0) {
            const [surplusColumns] = await connection.execute('DESCRIBE ericsson_boq_surplus_materials');
            console.log('Surplus materials table columns:', surplusColumns.map(col => col.Field));
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

testTables(); 