const { sequelize } = require('../db/models');
const { User } = require('../db/models');
const bcrypt = require('bcryptjs');

async function initDb() {
    try {
        // Sync all models with the database
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');

        // Create demo user
        const demoUser = await User.create({
            email: 'demo@user.io',
            firstName: 'Demo',
            lastName: 'User',
            username: 'Demo-lition',
            hashedPassword: bcrypt.hashSync('password')
        });
        console.log('Demo user created:', demoUser.toJSON());

        // Create additional test users
        await User.bulkCreate([
            {
                email: 'user1@user.io',
                firstName: 'Fake',
                lastName: 'User1',
                username: 'FakeUser1',
                hashedPassword: bcrypt.hashSync('password2')
            },
            {
                email: 'user2@user.io',
                firstName: 'Fake',
                lastName: 'User2',
                username: 'FakeUser2',
                hashedPassword: bcrypt.hashSync('password3')
            }
        ]);
        console.log('Additional users created');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await sequelize.close();
    }
}

initDb();
