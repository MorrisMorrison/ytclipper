var express = require('express');
var router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("DIng")
  res.sendFile(path.join(__dirname, '/index.html'));
});

module.exports = router;
