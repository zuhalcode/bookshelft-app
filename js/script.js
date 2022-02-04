function Book(title, author, year, isComplete, id = +new Date()) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.year = year;
  this.isComplete = isComplete;
}

class Method {
  static displayBooks() {
    const books = Storage.getBooks();
    this.displayToBody(books);
  }

  static displayToBody = (books) => {
    if (!books) return;
    else {
      const tbody = document.querySelector("#tbody");
      const tbodyUnfinished = document.querySelector("#tbody-unfinished");
      const finishedBook = [];
      const unfinishedBook = [];
      books.forEach((book) => (book.isComplete ? finishedBook.push(book) : unfinishedBook.push(book)));
      Method.mapBook(finishedBook, tbody, "Unread");
      Method.mapBook(unfinishedBook, tbodyUnfinished, "Read");
    }
  };

  static mapBook = (books, element, action) => {
    const tr = books
      .map((book) => {
        return `<tr>
              <td>${book.id}</td>
              <td>${book.title}</td>
              <td>${book.author}</td>
              <td>${book.year}</td>
              <td>
              <a href="" class="btn btn-success read ">${action}</a>
              <a href="" class="btn btn-primary edit">Edit</a>
              <a href="" class="btn btn-danger delete">Delete</a>
              </td>
              </tr>`;
      })
      .join("");
    element.innerHTML = tr;
  };

  static clearForm = () => {
    document.querySelector("#title").value = "";
    document.querySelector("#author").value = "";
    document.querySelector("#year").value = "";
  };

  static deleteTable = (target) => {
    target.classList.contains("delete") && target.parentElement.parentElement.remove();
  };

  static displayAlert = (msg, className) => {
    if (className === "success") {
      const p = document.createElement("p");
      p.className = `alert alert-${className}`;
      p.appendChild(document.createTextNode(msg));
      const container = document.querySelector(".title");
      const form = document.querySelector("form");
      container.insertBefore(p, form);
      setTimeout(() => document.querySelector(".alert").remove(), 2000);
    } else {
      const inputs = document.querySelectorAll(".input-div");

      inputs.forEach((input) => {
        input.insertAdjacentHTML("afterend", `<p class="alert-input text-${className} ms-1 ">${msg}</p>`);

        setTimeout(() => {
          document.querySelectorAll(".alert-input").forEach((input) => input.remove());
        }, 2000);
      });
    }
  };
}

class Storage {
  static getBooks = () => {
    let books = null;
    localStorage.getItem("books") === null ? (books = []) : (books = JSON.parse(localStorage.getItem("books")));
    return books;
  };

  static addBook = (book) => {
    if (!book) {
      return;
    } else {
      const books = Storage.getBooks();
      books.push(book);
      localStorage.setItem("books", JSON.stringify(books));
    }
  };

  static deleteBook = (id) => {
    const books = Storage.getBooks();
    books.forEach((book, index) => book.id == id && books.splice(index, 1));
    localStorage.setItem("books", JSON.stringify(books));
  };

  static readBook = (id) => {
    const books = Storage.getBooks();
    books.forEach((book) => {
      if (book.id == id) {
        if (book.isComplete) book.isComplete = false;
        else book.isComplete = true;
      }
    });
    localStorage.setItem("books", JSON.stringify(books));
  };

  static editBook = (id) => {
    const books = Storage.getBooks();

    books.forEach((book) => {
      if (book.id == id) {
        const titleEdit = document.querySelector("#title-edit");
        const authorEdit = document.querySelector("#author-edit");
        const yearEdit = document.querySelector("#year-edit");
        const isCompleteEdit = document.querySelector("#finish-edit");

        titleEdit.value = book.title;
        authorEdit.value = book.author;
        yearEdit.value = book.year;
        book.isComplete ? isCompleteEdit.setAttribute("checked", true) : isCompleteEdit.setAttribute("unchecked", true);

        document.querySelector(".form-edit").addEventListener("submit", () => {
          let bookEdited;

          titleEdit === "" || authorEdit === "" || yearEdit === ""
            ? null
            : isCompleteEdit.checked
            ? (bookEdited = new Book(titleEdit.value, authorEdit.value, yearEdit.value, true, book.id))
            : (bookEdited = new Book(titleEdit.value, authorEdit.value, yearEdit.value, false, book.id));

          Method.displayBooks(bookEdited);
          Storage.addBook(bookEdited);
          Method.clearForm();
          this.deleteBook(id);
          displayModal();
        });
      }
    });
    localStorage.setItem("books", JSON.stringify(books));
  };
}

const displayModal = () => {
  const blur = document.querySelectorAll(".blur");
  const modal = document.querySelector(".modal-box");
  modal.classList.toggle("display");
  blur[0].classList.toggle("blur-active");
  blur[1].classList.toggle("blur-active");
};

document.addEventListener("DOMContentLoaded", Method.displayBooks());

document.querySelector(".form").addEventListener("submit", () => {
  const title = document.querySelector("#title").value;
  const author = document.querySelector("#author").value;
  const year = document.querySelector("#year").value;
  const isComplete = document.querySelector("#finish");
  let book;

  title === "" || author === "" || year === "" ? null : isComplete.checked ? (book = new Book(title, author, year, true)) : (book = new Book(title, author, year, false));

  Method.displayBooks(book);
  Storage.addBook(book);
  Method.clearForm();
});

const btnDelete = document.querySelectorAll(".delete");
btnDelete.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    Method.deleteTable(e.target);
    Storage.deleteBook(e.target.parentElement.parentElement.firstElementChild.innerHTML);
    Method.displayAlert("Book deleted", "success");
    e.preventDefault();
  });
});

const btnRead = document.querySelectorAll(".read");
btnRead.forEach((btn) => {
  btn.addEventListener("click", (e) => Storage.readBook(e.target.parentElement.parentElement.firstElementChild.innerHTML));
});

const btnEdit = document.querySelectorAll(".edit");
btnEdit.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    displayModal();
    Storage.editBook(e.target.parentElement.parentElement.firstElementChild.innerHTML);
  });
});

document.getElementById("search").addEventListener("keyup", (e) => {
  const searchValue = e.target.value.toLowerCase();
  const filteredBooks = [];
  const books = Storage.getBooks();
  books.filter((book) => book.title.toLowerCase().includes(searchValue) && filteredBooks.push(book));
  Method.displayToBody(filteredBooks);
});
