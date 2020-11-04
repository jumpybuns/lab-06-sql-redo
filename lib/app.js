const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/shielas', async(req, res) => {
  try {
    const data = await client.query('SELECT * from shielas');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

app.get('/shielas/:id', async(req, res) => {
  try {
    const shielaId = req.params.id;
  
    const data = await client.query(`
        SELECT * FROM shielas 
        WHERE shielas.id=$1 
    `, [shielaId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shielas/', async(req, res) => {
  try {
    // we get all the song data from the POST body (i.e., from the form in react)
    const newName = req.body.name;
    const newCategory = req.body.category;
    const newYear = req.body.year;
    const newAlive = req.body.alive;
    const newUser_Id = req.body.user_id;
    const newAlias = req.body.alias;


  
    // use an insert statement to make a new song
    const data = await client.query(`
      INSERT INTO shielas (name, category, year, alive, user_id, alias)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, 
    [newName, newCategory, newYear, newAlive, newUser_Id, newAlias]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/shielas/:id', async(req, res) => {
  try {
    const newName = req.body.name;
    const newCategory = req.body.category;
    const newYear = req.body.year;
    const newAlias = req.body.alias;
    const newAlive = req.body.alive;
    const newUser_Id = req.body.user_id;

    const data = await client.query(`
      UPDATE shielas
      SET name = $1, 
      category = $2,
      year = $3,
      alias = $4,
      alive = $5,
      user_id = $6
      WHERE shielas.id = $7
      RETURNING *
    `, 
    [newName, newCategory, newYear, newAlias, newAlive, newUser_Id, req.params.id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }

});

app.delete('/shielas/:booger', async(req, res) => {
  try {
    const shielaId = req.params.booger;

    const data = await client.query(`
      DELETE from shielas 
      WHERE shielas.id=$1
      RETURNING *
    `, 
    [shielaId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
