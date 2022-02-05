var express = require("express");
var router = express.Router();

/* GET users listing. */
let words = [];

router.get("/", function (req, res, next) {
  res.send(words);
});

router.post("/", function (req, res) {
  try {
    words.push(req.body);
  } catch (err) {
    res.send(err);
  }
  res.send(Object.keys(req.body)[0]);
  //res.send(req.body);
});
module.exports = router;
