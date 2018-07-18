const issuesRouter =  require('express').Router({mergeParams:true});;
const sqlite3 = require('sqlite3');
const errorHandler = require('errorhandler');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/',(req,res,next) =>{
  db.all('SELECT * FROM Issue where series_id = $seriesId',{$seriesId:req.params.seriesId}, (err,row) =>{
    if (err){
      //Logs any error to the console if there is one
      //then extis function
      console.log(err);
      return;
    }
    else{
      //If selection is valid, returns all issues in a
      //JSON object as a property of the response body
      res.status(200).json({issues:row});
    }
  })
})

issuesRouter.post('/', (req, res, next) => {
            const newIssues = req.body.issue;
            if (!newIssues.name || !newIssues.issueNumber ||
                !newIssues.publicationDate || !newIssues.artistId) {
                console.log("INVALID ISSUE");
                return res.status(400).send();
            }

            db.get('SELECT * FROM Artist WHERE Artist.id = $artistId',
            {$artistId: newIssues.artistId},
            (err, row) => {
                if (err) {
                    console.log(err);
                }
                if (row = undefined) {
                    console.log('BAD ARTIST ID');
                    return res.status(400).send();
                }
                const sql = 'INSERT INTO Issue (name, issue_number,publication_date,artist_id,series_id) VALUES ($name, $issueNumber,$pubDate,$artistId,$seriesId)';
                const values = {
                    $name: newIssues.name,
                    $issueNumber: newIssues.issueNumber,
                    $pubDate: newIssues.publicationDate,
                    $artistId: newIssues.artistId,
                    $seriesId: req.params.seriesId
                };

                db.run(sql, values, function(err) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(400);
                    }
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, function(err, row) {
                        if (!row) {
                            return res.sendStatus(400);
                        } else {
                            res.status(201).send({issue: row});
                        };
                    })
                });
            });
});

issuesRouter.param("issuesId",(req,res,next,issuesId) =>{
  const idIssues = issuesId;
  const sql = 'SELECT * FROM Issue where Issue.id=$issuesId';
  const values = {$issuesId: idIssues};
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

      //Attaches the issueId to our request parameters
      req.params.issuesId = idIssues;

      //Note that if this was req.body, it would overwrite our req.body in a
      //PUT request to 'issues/:id'
      //The tests call for our object to be appended to res.body
      //but it can also be attached to another key in the req or res Objects
      //that are not in use
      res.body = {issue:row};
      next();
  })
})

issuesRouter.put('/:issuesId',(req,res,next) =>{
  const newIssue = req.body.issue;

  const name = newIssue.name;


  if (!newIssue.name || !newIssue.issueNumber ||
      !newIssue.publicationDate || !newIssue.artistId){
      console.log("BAD Update");
      return res.status(400).send();
    }
  else{
    //The SQL standard says that strings must use 'single quotes',
    //and identifiers (such as table and column names), when quoted, must use "double quotes".
    //For compatibility with MySQL, SQLite also allows to use single quotes for identifiers
    //and double quotes for strings, but only when the context makes the meaning unambiguous.
    //To avoid issues, just try to stick to the standard...
    const sql = 'UPDATE "Issue" SET "name" = $name, issue_number = $issueNumber, publication_date = $pubDate, artist_id = $artistId, series_id = $seriesId WHERE Issue.id = $id';

    const values = {
      $id: req.params.issuesId,
      $name: newIssue.name,
      $issueNumber: newIssue.issueNumber,
      $pubDate: newIssue.publicationDate,
      $artistId: newIssue.artistId,
      $seriesId: req.params.seriesId
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        //Note that the our previously declared 'values' Object cannot be used in
        //our db.get statement as the json Object must ONLY contain values used in our
        //SQLite query in order to function appropriately
        db.get('SELECT * FROM Issue WHERE Issue.id = $id', {$id: req.params.issuesId}, (error, updatedIssues) => {
          return res.status(200).json({issue: updatedIssues});
        });
      }
    });
  }
})

issuesRouter.delete('/:issuesId',(req,res,next) =>{
  const sql = 'DELETE FROM Issue WHERE Issue.id = $id';
  const values = {$id: req.params.issuesId};
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get('SELECT * FROM Issue WHERE Issue.id = $id',{$id : req.params.issuesId}, (error, deletedIssue) => {
        if(error){
          console.log(error);
        }
        return res.status(204).send();
      });
    }
  });
})


module.exports = issuesRouter;
