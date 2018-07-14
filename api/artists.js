const express = require('express');
const artistRouter = express();
const sqlite3 = require('sqlite3');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

//Note that morgan must be imported into
//any route where it would be used for logging
artistRouter.use(morgan('dev'));

//Sets db as an instance of either the TEST_DATABASE
//if existant or else our sqlite database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.get('/',(req,res,next) =>{
  db.all('SELECT * FROM Artist where Artist.is_currently_employed = 1', (err,row) =>{
    if (err){
      //Logs any error to the console if there is one
      //then extis function
      console.log(err);
      return;
    }
    else{
      //If selection is valid, returns all artists in a
      //JSON object as a property of the response body
      res.status(200).json({artists:row});
    }
  })
})

artistRouter.post('/', (req, res, next) => {
const newArtist = req.body.artist;
  const sql = 'INSERT INTO Artist (name, date_of_birth, biography) VALUES ($name, $date_of_birth, $biography)';
  const values =   {
    $name: newArtist.name,
    $date_of_birth: newArtist.dateOfBirth,
    $biography: newArtist.biography};
      db.run(sql,values,
      function(err) {
        if (err) {
          console.log(err);
          return res.sendStatus(400);
        }
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
        (err, row) => {
          if (!row) {
            return res.sendStatus(400);
            }
          res.status(201).send({ artist: row });
        });
      })
    });

artistRouter.param("id",(req,res,next,id) =>{
  const artistId = id;
  const sql = 'SELECT * FROM Artist where Artist.id=$artistId';
  const values = {$artistId: id};
  db.get(sql,values, function (err,row) {
    if (err){
      //Logs any error to the console if there is one
      //then calls next to continue printing out other
      //existant errors
      console.log(err);
      return;
    }
    else if(row === undefined){
      //console.log("Row Non-Existant");
      return res.sendStatus(404);
    }
     //Execute if no errors in sqlite query
      //Calls next middleware function

      //Attaches artist object with row properties
      //to our req.body
      req.params.id = artistId;
      res.body = {artist:row};
      next();
  })
})

artistRouter.get('/:id',(req,res,next) =>{
  res.status(200).json(res.body);
})

artistRouter.put('/:id',(req,res,next) =>{
/**  db.run(`UPDATE Artist
    SET name = $name
    AND date_of_birth = $DOB
     AND biography = $biography
     AND is_currently_employed = $employed
     where id = $id`),
     {$name: 'name',
       $DOB: 'date',
       $biography: 'bio',
       $employed: 1,
     }
     **/
     res.status(200).send();
})

//This exports our express router to be used in
//other js files
module.exports = artistRouter;
