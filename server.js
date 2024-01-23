
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5500;

// Enable CORS
app.use(cors());

// SQLite database setup
const db = new sqlite3.Database('cats.db');

// Create a cats table
db.run(`
  CREATE TABLE IF NOT EXISTS cats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating cats table:', err);
  } else {
    // Insert sample cat data
    const insertSampleCats = db.prepare(`
  INSERT INTO cats (name, description, imageUrl) VALUES (?, ?, ?)
`);
const sampleCats = [
  ['Whiskers', 'A playful Siamese cat', 'https://www.bluecross.org.uk/sites/default/files/assets/images/124044lpr.jpg'],
  ['Mittens', 'A fluffy Persian cat', 'https://static.boredpanda.com/blog/wp-content/uploads/2018/04/5acb63d83493f__700-png.jpg'],
  ['Fluffy', 'A majestic Maine Coon cat', 'https://www.argospetinsurance.co.uk/assets/uploads/2017/12/cat-pet-animal-domestic-104827.jpeg'],
  ['Shadow', 'A mysterious Black Shorthair cat', 'https://img-aws.ehowcdn.com/600x600p/photos.demandstudios.com/getty/article/165/76/87490163.jpg'],
  ['Cleo', 'An elegant Egyptian Mau cat','https://wallpapers.com/images/hd/funny-cats-pictures-uu9qufqc5zq8l7el.jpg'],
  [ 'Leo', 'A brave Lion Cut cat','https://media.gettyimages.com/id/173240099/photo/surprise-kitty-cute-black-cat-screaming.jpg'],
  ['Bella','A sweet Calico cat','https://static.boredpanda.com/blog/wp-content/uploads/2014/02/funny-wet-cats-coverimage.jpg']
];

    sampleCats.forEach(cat => insertSampleCats.run(cat));

    // Ensure that the sample cat data is inserted before starting the server
    insertSampleCats.finalize(() => {
      // Endpoint to get random cats
      app.get('/api/random-cats', (req, res) => {
        const count = req.query.count || 3; // Default to 3 random cats
        const query = `SELECT * FROM cats ORDER BY RANDOM() LIMIT ${count}`;
        db.all(query, (err, cats) => {
          if (err) {
            console.error('Error fetching random cats:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json(cats);
          }
        });
      });

      // Start the server
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    });
  }
});

// Handle graceful shutdown - close SQLite database
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err.message);
    } else {
      console.log('SQLite database closed.');
      process.exit(0);
    }
  });
});

