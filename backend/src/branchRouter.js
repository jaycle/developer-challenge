const express = require('express');
const db = require('../db/models');

const router = express.Router();

// Get all branches
router.get("/", async (req, res) => {
  res.status(200).json(await db.LibraryBranch.findAll());
});

module.exports = router;
