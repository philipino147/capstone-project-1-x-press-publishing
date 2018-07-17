const express = require('express');
const apiRouter = express();

const artistRouter = require('./artists.js');
apiRouter.use('/artists', artistRouter);

const seriesRouter = require('./series.js');
apiRouter.use('/series', seriesRouter);
//apiRouter.get('/artists',(req,res,send) =>{
//  res.sendStatus(200);
//});


module.exports = apiRouter;
