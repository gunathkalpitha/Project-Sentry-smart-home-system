const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Environmental routes placeholder" });
});

module.exports = router;
