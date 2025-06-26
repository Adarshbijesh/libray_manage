const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let books = [];
let nextId = 1;

app.get('/books', (req, res) => {
    res.json(books);
});

app.post('/books', (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }
    const book = {
        id: nextId++,
        title,
        author,
        isAvailable: true,
        borrower: null,
        issueDate: null
    };
    books.push(book);
    res.status(201).json(book);
});

app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    books.splice(index, 1);
    res.status(204).send();
});

app.post('/books/:id/lend', (req, res) => {
    const id = parseInt(req.params.id);
    const { borrower } = req.body;
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (!book.isAvailable) {
        return res.status(400).json({ error: 'Book is already lent out' });
    }
    if (!borrower) {
        return res.status(400).json({ error: 'Borrower name is required' });
    }
    book.isAvailable = false;
    book.borrower = borrower;
    book.issueDate = new Date();
    res.json(book);
});

app.post('/books/:id/return', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (book.isAvailable) {
        return res.status(400).json({ error: 'Book was not lent out' });
    }
    const currentDate = new Date();
    const issueDate = new Date(book.issueDate);
    const diffTime = Math.abs(currentDate - issueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const allowedDays = 14;
    const finePerDay = 5;
    let fine = 0;
    if (diffDays > allowedDays) {
        fine = (diffDays - allowedDays) * finePerDay;
    }
    book.isAvailable = true;
    book.borrower = null;
    book.issueDate = null;
    res.json({ message: 'Book returned', fine });
});

app.listen(port, () => {
    console.log("Library backend server running at http://localhost:" + port);
});
