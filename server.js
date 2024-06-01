const express = require('express');
const path = require('path');
const session = require('express-session');
const { User, SavedRecipe, sequelize } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware
    next();
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/login');
  }
};

// Route to serve the login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Route to handle user authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database by username and password
    const user = await User.findOne({ where: { username, password } });

    if (user) {
      // Authentication successful, store user data in session and redirect to main page
      req.session.user = user;
      res.redirect('/main');
    } else {
      // Authentication failed, redirect back to the login page with an error message
      res.redirect('/login?error=1');
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.redirect('/login?error=1');
  }
});

// Route to save a recipe for the current user
app.post('/save-recipe', isAuthenticated, async (req, res) => {
  const recipeId = req.body.recipeId; // Retrieve recipeId from form parameter
  const username = req.session.user.username; // Get the current user's username

  try {
    // Check if the user exists in the User table
    const user = await User.findOne({ where: { username } });
    if (!user) {
      // If the user doesn't exist, return an error response
      console.error('User not found with username:', username);
      return res.sendStatus(404); // User not found
    }

    // Save the recipe for the user
    await SavedRecipe.create({ recipeId, username });
    res.sendStatus(200); // Send success status
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.sendStatus(500); // Send error status
  }
});

// Route to serve the main search page after successful login
app.get('/main', isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/script.js', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'js', 'script.js'));
});

// Route to serve the user list page
app.get('/userList', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'admin') {
    User.findAll({ attributes: ['username', 'password'] })
      .then(users => {
        res.render('userList', { users });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        res.redirect('/main');
      });
  } else {
    res.redirect('/main');
  }
});


app.get('/users', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'admin') {
    User.findAll({ attributes: ['username', 'password'] })
      .then(users => {
        res.json(users);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' }); // Send error response
      });
  } else {
    res.status(403).json({ error: 'Forbidden' }); // Send forbidden response if user is not admin
  }
});

// Modify the server-side route to handle DELETE requests for user deletion
app.delete('/users/:username', isAuthenticated, (req, res) => {
  const username = req.params.username;

  // Check if the current user is an admin or the user to be deleted is not the admin
  if (req.session.user.role === 'admin' || username !== 'admin') {
    // Delete the user from the database based on the username
    User.destroy({ where: { username } })
      .then(() => {
        res.sendStatus(200); // Send success status
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        res.sendStatus(500); // Send error status
      });
  } else {
    res.status(403).json({ error: 'Forbidden' }); // Send forbidden response if user is trying to delete admin
  }
});


app.get('/savedRecipes', isAuthenticated, (req, res) => {
  res.render('savedRecipes', { user: req.session.user });
});

// Route to view saved recipes
app.get('/saved-recipes', isAuthenticated, async (req, res) => {
  try {
    // Fetch saved recipes for the current user from the database
    const savedRecipes = await SavedRecipe.findAll({
      where: { username: req.session.user.username },
      attributes: ['recipeId'] // Only select the recipeId attribute
    });

    // Extract recipe IDs from the savedRecipes array
    const recipeIds = savedRecipes.map(savedRecipe => savedRecipe.recipeId);

    // Send the recipe IDs as JSON response
    res.json(recipeIds);
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.sendStatus(500); // Send error status
  }
});


// Route to handle user registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Create a new guest user and save it to the database
    await User.create({ username, password, role: 'guest' });
    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.redirect('/login?error=2');
  }
});

// Route to serve the recipe details page
app.get('/recipeDetails/:recipeId', isAuthenticated, (req, res) => {
  // Retrieve the recipeId from the URL parameters
  const recipeId = req.params.recipeId;

   res.render('recipeDetails', { recipeId });
});

// Initialize the database and pre-made user accounts
sequelize
  .sync({ force: true }) // Use { force: true } only for development to drop tables and recreate them
  .then(async () => {
    // Create pre-made user accounts (guest and admin)
    await User.bulkCreate([
      { username: 'guest', password: 'guest', role: 'guest' },
      { username: 'admin', password: 'admin', role: 'admin' }
    ]);

    console.log('Database synchronized and pre-made user accounts created successfully.');
  })
  .catch(error => {
    console.error('Error synchronizing database:', error);
  });

// Route to redirect any other requests to the login page if not authenticated
app.use((req, res, next) => {
  if (!req.session || !req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
