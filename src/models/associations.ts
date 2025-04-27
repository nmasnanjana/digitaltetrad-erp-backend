import User from "./user";
import Team from "./team";
import TeamAssignment from "./teamAssignment";

// Relationships
User.hasMany(Team, { foreignKey: 'leader_id' });
Team.belongsTo(User, { foreignKey: 'leader_id' });
User.belongsToMany(Team, { through: TeamAssignment, foreignKey: 'user_id' });
Team.belongsToMany(User, { through: TeamAssignment, foreignKey: 'team_id' });

