const express = require('express');
const seriesRouter = express();
const sqlite3 = require('sqlite3');
const errorHandler = require('errorhandler');

const issuesRouter = require('./issues.js');
seriesRouter.use('/:seriesId/issues', issuesRouter);

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/',(req,res,next) =>{
  db.all('SELECT * FROM Series', (err,row) =>{
    if (err){
      //Logs any error to the console if there is one
      //then exits function
      console.log(err);
      return;
    }
    else{
      //If selection is valid, returns all series in a
      //JSON object as a property of the response body
      res.status(200).json({series:row});
    }
  })
})

seriesRouter.post('/', (req, res, next) => {
const newSeries = req.body.series;
  const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
  const values =   {
    $name: newSeries.name,
    $description: newSeries.description};
      db.run(sql,values,
      function(err) {
        if (err) {
          console.log(err);
          return res.sendStatus(400);
        }
      db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
        (err, row) => {
          if (!row) {
            return res.sendStatus(400);
            }
          res.status(201).send({ series: row });
        });
      })
    });

seriesRouter.param("seriesId",(req,res,next,seriesId) =>{
  const idSeries = seriesId;
  const sql = 'SELECT * FROM Series where Series.id=$seriesId';
  const values = {$seriesId: idSeries};
  db.get(sql,values, function (err,row) {
    if (err){
      //Logs any error to the console if there is one
      console.log(err);
      return;
    }
    else if(row === undefined){
      return res.sendStatus(404);
    }
     //Execute if no errors in sqlite query
      //Calls next middleware function
      //Attaches series object with row properties
      //to our req.body
      req.params.seriesId = idSeries;

      //Note that if this was req.body, it would overwrite our req.body in a
      //PUT request to 'series/:id'
      //The tests call for our object to be appended to res.body
      //but it can also be attached to another key in the req or res Objects
      //that are not in use
      res.body = {series:row};
      next();
  })
})

seriesRouter.get('/:seriesId',(req,res,next) =>{
  res.status(200).json(res.body);
})

seriesRouter.put('/:seriesId',(req,res,next) =>{
  const newSeries = req.body.series;
  const name = newSeries.name;
  const description = newSeries.description;

  if (!newSeries.name || !newSeries.description){
      console.log("BAD Update");
      return res.status(400).send();
    }
  else{
    //The SQL standard says that strings must use 'single quotes',
    //and identifiers (such as table and column names), when quoted, must use "double quotes".
    //For compatibility with MySQL, SQLite also allows to use single quotes for identifiers
    //and double quotes for strings, but only when the context makes the meaning unambiguous.
    //To avoid issues, just try to stick to the standard...
    const sql = 'UPDATE "Series" SET "name" = $name, "description" = $description WHERE Series.id = $id';

    const values = {
      $id: req.params.seriesId,
      $name: name,
      $description: description
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        //Note that the our previously declared 'values' Object cannot be used in
        //our db.get statement as the json Object must ONLY contain values used in our
        //SQLite query in order to function appropriately
        db.get('SELECT * FROM Series WHERE Series.id = $id', {$id: req.params.seriesId}, (error, updatedSeries) => {
          return res.status(200).json({series: updatedSeries});
        });
      }
    });
  }
})

seriesRouter.delete('/:seriesId',(req,res,next) =>{
  db.get('SELECT * FROM ISSUE WHERE series_id = $seriesId',{$seriesId:req.params.seriesId},function(error,row){
    if(error){
      console.log(err);
      return;
    }
    else if(row){
      return res.sendStatus(400);
    }

  const sql = 'DELETE FROM Series WHERE Series.id = $id';
  const values = {$id: req.params.seriesId};
  db.run(sql, values, function(error) {
    if (error) {
      console.log(error);
      return;
    } else {
      db.get('SELECT * FROM Series WHERE Series.id = $id',{$id : req.params.seriesId}, (error, deletedSeries) => {
        if(error){
          console.log(error);
        }
        return res.status(204).send();
      });
    }
  });
})
})


module.exports = seriesRouter;
