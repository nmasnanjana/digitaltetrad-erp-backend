const fs = require('fs');
const path = require('path');

// Model definitions for missing tables
const missingTables = {
  'inventory': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    itemName: { type: 'STRING', allowNull: false },
    quantity: { type: 'INTEGER', allowNull: false },
    unitPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    totalPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'available' },
    returnDate: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'purchase_orders': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    poNumber: { type: 'STRING', allowNull: false, unique: true },
    supplier: { type: 'STRING', allowNull: false },
    totalAmount: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'pending' },
    orderDate: { type: 'DATE', allowNull: false },
    expectedDelivery: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'qc_comments': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    comment: { type: 'TEXT', allowNull: false },
    commentType: { type: 'STRING', allowNull: false },
    severity: { type: 'STRING', defaultValue: 'medium' },
    status: { type: 'STRING', defaultValue: 'open' },
    reportedBy: { type: 'UUID', allowNull: false, references: { model: 'users', key: 'id' } },
    resolvedBy: { type: 'UUID', allowNull: true, references: { model: 'users', key: 'id' } },
    resolvedAt: { type: 'DATE', allowNull: true }
  },
  'huawei_invoices': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    invoiceNumber: { type: 'STRING', allowNull: false, unique: true },
    invoiceDate: { type: 'DATE', allowNull: false },
    totalAmount: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'pending' },
    paymentDate: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'huawei_pos': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    poNumber: { type: 'STRING', allowNull: false, unique: true },
    poDate: { type: 'DATE', allowNull: false },
    totalAmount: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'pending' },
    deliveryDate: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'ericsson_rate_cards': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    rateCardName: { type: 'STRING', allowNull: false },
    effectiveDate: { type: 'DATE', allowNull: false },
    expiryDate: { type: 'DATE', allowNull: true },
    isActive: { type: 'BOOLEAN', defaultValue: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'ericsson_boqs': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    boqNumber: { type: 'STRING', allowNull: false, unique: true },
    boqDate: { type: 'DATE', allowNull: false },
    totalAmount: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'draft' },
    approvedBy: { type: 'UUID', allowNull: true, references: { model: 'users', key: 'id' } },
    approvedAt: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  },
  'ericsson_boq_items': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    boqId: { type: 'UUID', allowNull: false, references: { model: 'ericsson_boqs', key: 'id' } },
    itemCode: { type: 'STRING', allowNull: false },
    itemDescription: { type: 'TEXT', allowNull: false },
    quantity: { type: 'INTEGER', allowNull: false },
    unitPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    totalPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    invoicedPercentage: { type: 'DECIMAL', precision: 5, scale: 2, defaultValue: 0.00 }
  },
  'ericsson_boq_remove_materials': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    boqId: { type: 'UUID', allowNull: false, references: { model: 'ericsson_boqs', key: 'id' } },
    materialCode: { type: 'STRING', allowNull: false },
    materialDescription: { type: 'TEXT', allowNull: false },
    quantity: { type: 'INTEGER', allowNull: false },
    unitPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    totalPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false }
  },
  'ericsson_boq_surplus_materials': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    boqId: { type: 'UUID', allowNull: false, references: { model: 'ericsson_boqs', key: 'id' } },
    materialCode: { type: 'STRING', allowNull: false },
    materialDescription: { type: 'TEXT', allowNull: false },
    quantity: { type: 'INTEGER', allowNull: false },
    unitPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    totalPrice: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false }
  },
  'ericsson_invoices': {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    jobId: { type: 'UUID', allowNull: false, references: { model: 'jobs', key: 'id' } },
    invoiceNumber: { type: 'STRING', allowNull: false, unique: true },
    invoiceDate: { type: 'DATE', allowNull: false },
    totalAmount: { type: 'DECIMAL', precision: 10, scale: 2, allowNull: false },
    status: { type: 'STRING', defaultValue: 'pending' },
    paymentDate: { type: 'DATE', allowNull: true },
    notes: { type: 'TEXT', allowNull: true }
  }
};

function generateMigrationContent(tableName, columns) {
  const upContent = `    await queryInterface.createTable('${tableName}', {
${Object.entries(columns).map(([columnName, config]) => {
  let columnDef = `      ${columnName}: {
        type: Sequelize.${config.type}`;
  
  if (config.primaryKey) columnDef += `,
        primaryKey: true`;
  if (config.defaultValue) {
    if (config.defaultValue === 'UUIDV4') {
      columnDef += `,
        defaultValue: Sequelize.UUIDV4`;
    } else if (config.defaultValue === 'NOW') {
      columnDef += `,
        defaultValue: Sequelize.NOW`;
    } else {
      columnDef += `,
        defaultValue: ${typeof config.defaultValue === 'string' ? `'${config.defaultValue}'` : config.defaultValue}`;
    }
  }
  if (config.allowNull === false) columnDef += `,
        allowNull: false`;
  if (config.unique) columnDef += `,
        unique: true`;
  if (config.references) columnDef += `,
        references: {
          model: '${config.references.model}',
          key: '${config.references.key}'
        }`;
  if (config.precision) columnDef += `,
        precision: ${config.precision}`;
  if (config.scale) columnDef += `,
        scale: ${config.scale}`;
  
  columnDef += `
      }`;
  return columnDef;
}).join(',\n')},
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });`;

  return {
    up: upContent,
    down: `    await queryInterface.dropTable('${tableName}');`
  };
}

// Get all migration files
const migrationsDir = path.join(__dirname, 'src', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));

console.log('Fixing empty migration files...\n');

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file is empty (has template content)
  if (content.includes('Add altering commands here')) {
    // Extract table name from filename
    const tableNameMatch = file.match(/create-(.+)-table\.js$/);
    if (tableNameMatch) {
      const tableName = tableNameMatch[1].replace(/-/g, '_');
      
      if (missingTables[tableName]) {
        const migrationContent = generateMigrationContent(tableName, missingTables[tableName]);
        
        const newContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
${migrationContent.up}
  },

  async down (queryInterface, Sequelize) {
    ${migrationContent.down}
  }
};`;
        
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Fixed: ${file}`);
      } else {
        console.log(`⚠️  No definition found for: ${file}`);
      }
    }
  }
});

console.log('\n🎉 Migration files fixed!');
console.log('\nNext steps:');
console.log('1. Run: npm run db:migrate');
console.log('2. Verify tables: mysql -h 127.0.0.1 -P 3307 -udev -pdev -e "USE erp; SHOW TABLES;"');
