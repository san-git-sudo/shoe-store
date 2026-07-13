const express = require("express");

const router = express.Router();

const sizeController = require("../controllers/sizeController");

router.get("/", sizeController.getAllSizes);

module.exports = router;