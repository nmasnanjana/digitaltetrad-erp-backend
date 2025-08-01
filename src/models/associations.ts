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
HuaweiPo.hasOne(HuaweiInvoice, { foreignKey: 'huawei_po_id', as: 'huaweiInvoice' });

// Export setup in case needed
export const setupAssociations = () => {};

export { User, Role, Inventory, Permission, RolePermission };
