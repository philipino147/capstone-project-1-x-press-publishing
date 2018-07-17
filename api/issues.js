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


module.exports = issuesRouter;
