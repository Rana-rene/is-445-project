const express = require("express");
const path = require("path");
const { Pool } = require("pg");
// require('dotenv').config();

// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Add database package and connection string (can remove ssl)
const pool = new Pool({
  user: "xldhavxk",
  host: "babar.db.elephantsql.com",
  database: "xldhavxk",
  password: "Q4-_EX_sx-Qq4bo1Il-4wS0wEKpsUen2",
  port: 5432
});
console.log("Successful connection to the database");


// Starting the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});


// GET /
app.get("/", (req, res) => {
    // res.send("Hello world...");
    res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
    res.render("about");
});

// GET /data
app.get("/data", (req, res) => {
    const test = {
        titre: "Test",
        items: ["one", "two", "three"]
    };
    res.render("data", { model: test });
});


app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books ORDER BY Title"
    pool.query(sql, [], (err, result) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("books", { model: result.rows });
    });
});


app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});



// POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
    const book = [req.body.title, req.body.author, req.body.comments];
    pool.query(sql, book, (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("edit", { model: result.rows[0] });
    });
  });

// POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [req.body.title, req.body.author, req.body.comments, id];
    const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE (Book_ID = $4)";
    pool.query(sql, book, (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });
  

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("delete", { model: result.rows[0] });
    });
  });


// POST /delete/5
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });



