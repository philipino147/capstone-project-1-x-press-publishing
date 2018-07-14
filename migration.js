const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



db.serialize(() =>{
  db.run('DROP TABLE IF EXISTS Artist', error => {
    if (error) {
      throw error;
    }
  });

  db.run(`CREATE TABLE Artist (
	  id INTEGER NOT NULL,
	  name TEXT NOT NULL,
	  date_of_birth	TEXT NOT NULL,
	  biography	TEXT NOT NULL,
	  is_currently_employed	INTEGER DEFAULT 1,
	  PRIMARY KEY(id)
    );`);

  db.run('DROP TABLE IF EXISTS Series', error => {
    if (error) {
      throw error;
    }
  });

  db.run(`CREATE TABLE Series (
    id	INTEGER NOT NULL,
    name	TEXT NOT NULL,
    description	TEXT NOT NULL,
    PRIMARY KEY(id)
    );`);

    db.run('DROP TABLE IF EXISTS Issue', error => {
      if (error) {
        throw error;
      }
    });

  db.run(`CREATE TABLE Issue (
    id	INTEGER NOT NULL,
    name	TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    publication_date TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (artist_id) references Artist(id),
    FOREIGN KEY (series_id) references Series(id)
  );`);

});
