const express = require('express');
const { mintBookNft, transferBook } = require('./block');
const { v4: uuidv4 } = require('uuid') ;
const db = require('../db/models');
const { up } = require('../db/migrations/20210929034305-create-book');

const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
  res.status(200).json(await db.Book.findAll());
});

// Create new book
router.post("/", async (req, res) => {
  const uuid = uuidv4(); // Ideally let the contract return the tokenId
  const tokenId = BigInt(`0x${uuid.replace(/-/g, '')}`).toString();
  const address = req.headers['x-from-address'];

  const book = await db.Book.create({
    title: req.body.title,
    isbn: req.body.isbn,
    author: req.body.author,
    address: address,
    tokenId:tokenId,
    status: 'Initialized'
  });

  res.status(201).json(book);

  mintBookNft(address, book)
})

// Transfer book
router.post("/:id/transfer", async (req, res) => {
  const book = await db.Book.findOne({ where: { id: req.params.id }});
  const owner = req.headers['x-from-address'];
  const updated = await transferBook(book, owner, req.body.to);
  res.status(200).json(updated);
})

module.exports = router;
