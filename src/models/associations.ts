import User from "./user";
import Team from "./team";
import TeamAssignment from "./teamAssignment";
import Job from "./job";
import Customer from "./customer";
import Expense from "./expense";
import ExpenseType from "./expenseType";
import PurchaseOrder from "./purchaseOrder";
import QcComment from "./qcComment";
import OperationType from "./operationType";
import Role from "./role";
import Inventory from "./inventory";
import Permission from "./permission";
import RolePermission from "./rolePermission";
import HuaweiPo from "./huaweiPo";
import HuaweiInvoice from "./huaweiInvoice";
import EricssonRateCard from "./ericssonRateCard";
import EricssonInvoice from "./ericssonInvoice";

// Role-User relationship
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Role-Permission relationship
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });

// Core Team-User relationships
User.belongsToMany(Team, { through: TeamAssignment, foreignKey: 'user_id', otherKey: 'team_id', as: 'teams' });
Team.belongsToMany(User, { through: TeamAssignment, foreignKey: 'team_id', otherKey: 'user_id', as: 'members' });
Team.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
User.hasMany(Team, { foreignKey: 'leader_id', as: 'ledTeams' });

// Job relationships
Job.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Job.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Team.hasMany(Job, { foreignKey: 'team_id', as: 'jobs' });
Customer.hasMany(Job, { foreignKey: 'customer_id', as: 'jobs' });

// Inventory relationships
Inventory.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Inventory, { foreignKey: 'jobId', as: 'inventory' });

// Expense relationships
Expense.belongsTo(ExpenseType, { foreignKey: 'expenses_type_id', as: 'expenseType' });
Expense.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Expense.belongsTo(OperationType, { foreignKey: 'operation_type_id', as: 'operationType' });
Expense.belongsTo(User, { foreignKey: 'edited_by', as: 'editor' });
Expense.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
User.hasMany(Expense, { foreignKey: 'reviewed_by', as: 'reviewedExpenses' });

// Purchase Order relationships
PurchaseOrder.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Job.hasMany(PurchaseOrder, { foreignKey: 'job_id', as: 'purchaseOrders' });
User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'createdPurchaseOrders' });

// QC Comment relationships
QcComment.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
QcComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Job.hasMany(QcComment, { foreignKey: 'job_id', as: 'qcComments' });
User.hasMany(QcComment, { foreignKey: 'user_id', as: 'qcComments' });

// Huawei PO relationships - TEMPORARILY DISABLED
HuaweiPo.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
HuaweiPo.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
HuaweiPo.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
Job.hasMany(HuaweiPo, { foreignKey: 'job_id', as: 'huaweiPos' });
Customer.hasMany(HuaweiPo, { foreignKey: 'customer_id', as: 'huaweiPos' });
User.hasMany(HuaweiPo, { foreignKey: 'uploaded_by', as: 'uploadedHuaweiPos' });

// Huawei Invoice relationships
HuaweiInvoice.belongsTo(HuaweiPo, { foreignKey: 'huawei_po_id', as: 'huaweiPo' });
HuaweiPo.hasMany(HuaweiInvoice, { foreignKey: 'huawei_po_id', as: 'huaweiInvoices' });

// Ericsson Rate Card relationships
EricssonRateCard.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(EricssonRateCard, { foreignKey: 'uploaded_by', as: 'uploadedEricssonRateCards' });

// Ericsson BOQ relationships
import EricssonBoq from "./ericssonBoq";
import EricssonBoqItem from "./ericssonBoqItem";
import EricssonBoqRemoveMaterial from "./ericssonBoqRemoveMaterial";
import EricssonBoqSurplusMaterial from "./ericssonBoqSurplusMaterial";

// Ericsson Invoice relationships
EricssonInvoice.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(EricssonInvoice, { foreignKey: 'created_by', as: 'createdEricssonInvoices' });

EricssonInvoice.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Job.hasMany(EricssonInvoice, { foreignKey: 'job_id', as: 'ericssonInvoices' });

EricssonBoq.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(EricssonBoq, { foreignKey: 'uploaded_by', as: 'uploadedEricssonBoqs' });

EricssonBoqItem.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(EricssonBoqItem, { foreignKey: 'uploaded_by', as: 'uploadedEricssonBoqItems' });

EricssonBoqRemoveMaterial.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(EricssonBoqRemoveMaterial, { foreignKey: 'uploaded_by', as: 'uploadedEricssonBoqRemoveMaterials' });

EricssonBoqSurplusMaterial.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(EricssonBoqSurplusMaterial, { foreignKey: 'uploaded_by', as: 'uploadedEricssonBoqSurplusMaterials' });

// BOQ relationships
EricssonBoq.hasMany(EricssonBoqItem, { foreignKey: 'boq_id', as: 'items' });
EricssonBoqItem.belongsTo(EricssonBoq, { foreignKey: 'boq_id', as: 'boq' });

EricssonBoq.hasMany(EricssonBoqRemoveMaterial, { foreignKey: 'boq_id', as: 'removeMaterials' });
EricssonBoqRemoveMaterial.belongsTo(EricssonBoq, { foreignKey: 'boq_id', as: 'boq' });

EricssonBoq.hasMany(EricssonBoqSurplusMaterial, { foreignKey: 'boq_id', as: 'surplusMaterials' });
EricssonBoqSurplusMaterial.belongsTo(EricssonBoq, { foreignKey: 'boq_id', as: 'boq' });

// Rate card relationship with BOQ items
EricssonBoqItem.belongsTo(EricssonRateCard, { foreignKey: 'rate_card_id', as: 'rateCard' });
EricssonRateCard.hasMany(EricssonBoqItem, { foreignKey: 'rate_card_id', as: 'boqItems' });

// Export setup in case needed
export const setupAssociations = () => {
    // This function is called to ensure all associations are properly set up
    // The associations are already defined above, this is just a placeholder
    // to ensure the file is imported and associations are loaded
};

export { User, Role, Inventory, Permission, RolePermission };
