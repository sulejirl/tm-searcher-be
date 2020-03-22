const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./app/routes');


app.all('*', function (req, res, next) {
  var origin = req.get('origin');
  res.header('Access-Control-Allow-Origin', origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'PUT,PATCH, POST, GET, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());
app.use('/', routes);


if (!module.parent) {
  app.listen(port, () => {
    console.log('Magic happens on port ' + port);
  });
}
