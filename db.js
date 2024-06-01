
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: (msg) => {
    if (msg.startsWith('Executing (default): ERROR')) {
      console.error(msg);
    }
  }
});


// Define User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('guest', 'admin'),
    allowNull: false,
    defaultValue: 'guest'
  }
});

// Define SavedRecipe model
const SavedRecipe = sequelize.define('SavedRecipe', {
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: false // Disable auto-increment for the primary key
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User, // Reference the User model
      key: 'username' // Use the username column of the User model
    }
  }
});


// Define associations
User.hasMany(SavedRecipe, { foreignKey: 'username' });
SavedRecipe.belongsTo(User, { foreignKey: 'username' });

// Sync models with database
(async () => {
  try {
    await sequelize.sync();
    console.log('Models synchronized with database.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
})();

module.exports = { sequelize, User, SavedRecipe };
