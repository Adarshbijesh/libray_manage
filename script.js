const apiBaseUrl = 'http://localhost:3000';

async function fetchBooks() {
    const response = await fetch(apiBaseUrl + '/books');
    const books = await response.json();
    return books;
}

function createBookRow(book) {
    const tr = document.createElement('tr');

    tr.innerHTML =
        '<td>' + book.id + '</td>' +
        '<td>' + book.title + '</td>' +
        '<td>' + book.author + '</td>' +
        '<td>' + (book.isAvailable ? 'Yes' : 'No') + '</td>' +
        '<td>' + (book.borrower ? book.borrower : '-') + '</td>' +
        '<td class="actions">' +
            '<button onclick="lendBook(' + book.id + ')" ' + (!book.isAvailable ? 'disabled' : '') + '>Lend</button>' +
            '<button onclick="returnBook(' + book.id + ')" ' + (book.isAvailable ? 'disabled' : '') + '>Return</button>' +
            '<button onclick="removeBook(' + book.id + ')">Remove</button>' +
        '</td>';

    return tr;
}

async function renderBookList() {
    const books = await fetchBooks();
    const tbody = document.querySelector('#book-list tbody');
    tbody.innerHTML = '';
    books.forEach(book => {
        tbody.appendChild(createBookRow(book));
    });
}

async function addBook(event) {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();

    if (!title || !author) {
        alert('Please enter both title and author.');
        return;
    }

    const response = await fetch(apiBaseUrl + '/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author })
    });

    if (response.ok) {
        document.getElementById('add-book-form').reset();
        renderBookList();
    } else {
        const error = await response.json();
        alert('Error adding book: ' + error.error);
    }
}

async function removeBook(id) {
    if (!confirm('Are you sure you want to remove this book?')) return;

    const response = await fetch(apiBaseUrl + '/books/' + id, {
        method: 'DELETE'
    });

    if (response.ok) {
        renderBookList();
    } else {
        alert('Error removing book');
    }
}

async function lendBook(id) {
    const borrower = prompt('Enter borrower name:');
    if (!borrower) return;

    const response = await fetch(apiBaseUrl + '/books/' + id + '/lend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrower })
    });

    if (response.ok) {
        renderBookList();
    } else {
        const error = await response.json();
        alert('Error lending book: ' + error.error);
    }
}

async function returnBook(id) {
    const response = await fetch(apiBaseUrl + '/books/' + id + '/return', {
        method: 'POST'
    });

    if (response.ok) {
        const result = await response.json();
        alert('Book returned. Fine: ₹' + result.fine);
        renderBookList();
    } else {
        const error = await response.json();
        alert('Error returning book: ' + error.error);
    }
}

document.getElementById('add-book-form').addEventListener('submit', addBook);

renderBookList();
