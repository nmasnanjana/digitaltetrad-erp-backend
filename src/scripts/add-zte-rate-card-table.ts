import sequelize from '../config/dbConfig';
import ZteRateCard from '../models/zteRateCard';

async function addZteRateCardTable() {
    try {
        console.log('🔄 Adding ZTE Rate Card table...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Check if table already exists
        const tableExists = await sequelize.getQueryInterface().showAllTables()
            .then(tables => tables.includes('zte_rate_cards'));
        
        if (tableExists) {
            console.log('ℹ️  ZTE Rate Card table already exists. Skipping creation.');
            return;
        }
        
        // Create only the ZTE Rate Card table
        await ZteRateCard.sync();
        console.log('✅ ZTE Rate Card table created successfully!');
        
        console.log('🎉 ZTE Rate Card table added without affecting existing data!');
        
    } catch (error) {
        console.error('❌ Error adding ZTE Rate Card table:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the script
addZteRateCardTable()
    .then(() => {
        console.log('✅ ZTE Rate Card table addition completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ ZTE Rate Card table addition failed:', error);
        process.exit(1);
    });
