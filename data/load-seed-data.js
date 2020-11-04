const client = require('../lib/client');
// import our seed data:
const shielas = require('./shiela.js');
const categories = require('./category.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    await Promise.all(
      categories.map(category => {
        return client.query(`
                    INSERT INTO category (category)
                    VALUES ($1)
                    RETURNING *
                `,
        [category.category]);
      })
    );
  
    const user = users[0].rows[0];

    await Promise.all(
      shielas.map(shiela => {
        return client.query(`
                    INSERT INTO shielas (user_id, alias, name, alive, category_id, year)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [user.id, shiela.alias, shiela.name, shiela.alive, shiela.category_id, shiela.year]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
