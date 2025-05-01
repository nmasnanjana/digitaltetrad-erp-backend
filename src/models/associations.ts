import User from "./user";
import Team from "./team";
import TeamAssignment from "./teamAssignment";
import Job from "./job";
import Customer from "./customer";

// Relationships
User.hasMany(Team, { foreignKey: 'leader_id' });
Team.belongsTo(User, { foreignKey: 'leader_id' });
User.belongsToMany(Team, { through: TeamAssignment, foreignKey: 'user_id' });
Team.belongsToMany(User, { through: TeamAssignment, foreignKey: 'team_id' });

// Job relationships
Job.belongsTo(Team, {
    foreignKey: 'team_id',
    as: 'team'
});

Job.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
});

Team.hasMany(Job, {
    foreignKey: 'team_id',
    as: 'jobs'
});

Customer.hasMany(Job, {
    foreignKey: 'customer_id',
    as: 'jobs'
});

export const setupAssociations = () => {
    // Team associations
    Team.belongsTo(User, {
        foreignKey: 'leader_id',
        as: 'leader'
    });

    // User associations
    User.hasMany(Team, {
        foreignKey: 'leader_id',
        as: 'ledTeams'
    });
};

