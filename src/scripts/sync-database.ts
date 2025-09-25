import sequelize from '../config/dbConfig';
import { setupAssociations } from '../models/associations';

// Import all models to ensure they're registered
import '../models/user';
import '../models/role';
import '../models/permission';
import '../models/rolePermission';
import '../models/team';
import '../models/teamAssignment';
import '../models/customer';
import '../models/job';
import '../models/expense';
import '../models/expenseType';
import '../models/operationType';
import '../models/inventory';
import '../models/purchaseOrder';
import '../models/qcComment';
import '../models/huaweiPo';
import '../models/huaweiInvoice';
import '../models/ericssonBoq';
import '../models/ericssonBoqItem';
import '../models/ericssonBoqRemoveMaterial';
import '../models/ericssonBoqSurplusMaterial';
import '../models/ericssonRateCard';
import '../models/zteRateCard';
import '../models/ericssonInvoice';
import '../models/settings';

async function syncDatabase() {
    try {
        console.log('🔄 Starting database synchronization...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Set up model associations
        setupAssociations();
        console.log('✅ Model associations set up successfully.');
        
        // Sync database with models (safe mode - only creates missing tables)
        console.log('🔄 Syncing database with models...');
        console.log('⚠️  WARNING: This will only create missing tables. Existing data will be preserved.');
        await sequelize.sync();
        console.log('✅ Database synchronized successfully!');
        
        console.log('🎉 All tables created successfully based on your current models!');
        
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the sync
syncDatabase()
    .then(() => {
        console.log('✅ Database sync completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Database sync failed:', error);
        process.exit(1);
    });
