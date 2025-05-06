import User from "./user";
import Team from "./team";
import TeamAssignment from "./teamAssignment";
import Job from "./job";
import Customer from "./customer";
import Expense from "./expense";
import ExpenseType from "./expenseType";
import PurchaseOrder from "./purchaseOrder";
import QcComment from "./qcComment";

// Core Team-User relationships
User.belongsToMany(Team, { through: TeamAssignment, foreignKey: 'user_id', otherKey: 'team_id', as: 'teams' });
Team.belongsToMany(User, { through: TeamAssignment, foreignKey: 'team_id', otherKey: 'user_id', as: 'members' });

// Team leadership
Team.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });

// Job relationships
Job.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Job.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Expense relationships
Expense.belongsTo(ExpenseType, { foreignKey: 'expenses_type_id', as: 'expenseType' });
Expense.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Expense.belongsTo(User, { foreignKey: 'edited_by', as: 'editor' });

// Purchase Order relationships
PurchaseOrder.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// QC Comment relationships
QcComment.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
QcComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export setup in case needed
export const setupAssociations = () => {};
