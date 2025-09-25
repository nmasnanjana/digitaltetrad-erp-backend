# Database Migration Guide

## ⚠️ Important: Data Preservation

**NEVER use `sequelize.sync({ force: true })` in production or when you have important data!**

The `force: true` option drops and recreates all tables, **losing all existing data**.

## ✅ Safe Migration Approaches

### 1. **Individual Model Sync (Recommended for New Tables)**

For adding new tables without affecting existing data:

```typescript
// Create a script like: src/scripts/add-new-table.ts
import sequelize from '../config/dbConfig';
import NewModel from '../models/newModel';

async function addNewTable() {
    try {
        await sequelize.authenticate();
        
        // Check if table already exists
        const tableExists = await sequelize.getQueryInterface().showAllTables()
            .then(tables => tables.includes('new_table_name'));
        
        if (tableExists) {
            console.log('Table already exists. Skipping creation.');
            return;
        }
        
        // Create only the new table
        await NewModel.sync();
        console.log('New table created successfully!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}
```

### 2. **Sequelize CLI Migrations (Best Practice)**

For production environments, always use Sequelize CLI migrations:

```bash
# Generate migration
npx sequelize-cli migration:generate --name create-new-table

# Run migrations
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Rollback last migration
npx sequelize-cli db:migrate:undo
```

### 3. **Safe Sync for Development**

If you must use sync in development:

```typescript
// Safe sync - only creates missing tables
await sequelize.sync(); // Without force: true

// Or with alter option (modifies existing tables)
await sequelize.sync({ alter: true });
```

## 🚨 Migration Best Practices

### 1. **Always Backup Before Migrations**
```bash
mysqldump -h 127.0.0.1 -P 3307 -udev -pdev erp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. **Test Migrations on Development First**
- Test all migrations on a copy of production data
- Verify data integrity after migrations
- Test rollback procedures

### 3. **Use Descriptive Migration Names**
```bash
npx sequelize-cli migration:generate --name add-user-email-verification
npx sequelize-cli migration:generate --name update-product-price-column
```

### 4. **Handle Migration Conflicts**
If you get "Duplicate key" errors:
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Mark migrations as completed manually (if tables already exist)
mysql -e "INSERT INTO SequelizeMeta (name) VALUES ('migration-file-name.js');"
```

## 🔧 Common Migration Scenarios

### Adding a New Table
```typescript
// Migration file
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('new_table', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // ... other columns
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('new_table');
  }
};
```

### Adding a Column
```typescript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('existing_table', 'new_column', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('existing_table', 'new_column');
  }
};
```

### Modifying a Column
```typescript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('existing_table', 'column_name', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('existing_table', 'column_name', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
```

## 🛠️ Recovery from Data Loss

If you accidentally used `force: true` and lost data:

1. **Check for backups**
2. **Restore from backup**
3. **Re-run migrations properly**
4. **Re-seed essential data**

## 📝 Summary

- ✅ Use individual model sync for new tables
- ✅ Use Sequelize CLI migrations for production
- ✅ Always backup before migrations
- ✅ Test migrations thoroughly
- ❌ Never use `force: true` with important data
- ❌ Never run migrations without testing first
