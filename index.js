const express = require("express");
const path = require("path");
const multer = require("multer");
const upload = multer();
const finder = require("./finder.js");

// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


// Add packages
require("dotenv").config();
// Add database package and connection string (can remove ssl)
const { Pool } = require("pg");

const pool = new Pool({
    user: "xldhavxk",
    host: "babar.db.elephantsql.com",
    database: "xldhavxk",
    password: "Q4-_EX_sx-Qq4bo1Il-4wS0wEKpsUen2",
    port: 5432
  });

// Starting the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


// GET /
app.get("/", (req, res) => {
    // res.send("Hello world...");
    res.render("index");
});


app.get("/manage", async (req, res) => {
  // Omitted validation check
  const totRecs = await finder.getTotalRecords();
  //Create an empty product object (To populate form with values)
  const cust = {
      customer_id: "",
      first_name: "",
      last_name: "",
      states: "",
      sales_ytd: "",
      previous_years_sales: ""
  };
  res.render("manage", {
      type: "get",
      totRecs: totRecs.totRecords,
      cust: cust
  });
});

app.post("/manage", async (req, res) => {
  const totRecs = await finder.getTotalRecords();

  finder.findCustomers(req.body)
      .then(result => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: result,
              cust: req.body
          })
      })
      .catch(err => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: `Unexpected Error: ${err.message}`,
              cust: req.body
          });
      });
});

app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});



// POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales) VALUES ($1, INITCAP($2), INITCAP($3), UPPER($4), $5, $6)";
    const create_customer= [req.body.customer_id, req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales];
    pool.query(sql, create_customer, (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/manage");
    });
  });

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM CUSTOMERS WHERE customer_id = $1";
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
    const customer= [req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales, id];
    const sql = "UPDATE CUSTOMERS SET first_name = INITCAP($1), last_name = INITCAP($2), states = UPPER($3), sales_ytd = $4, previous_years_sales = $5 WHERE (customer_id = $6)";
    pool.query(sql, customer, (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/manage");
    });
  });
  

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM CUSTOMERS WHERE customer_id = $1";
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
    const sql = "DELETE FROM CUSTOMERS WHERE customer_id = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/manage");
    });
  });


  app.get("/newCust", async (req, res) => {
    res.render("newCust", {
      model: {}, 
      type: "get"
     });
});

// POST /newCust
app.post("/newCust", async (req, res) => {
  const sql = "INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales) VALUES ($1, INITCAP($2), INITCAP($3), UPPER($4), $5, $6)";
  const create_customer= [req.body.customer_id, req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales];
  pool.query(sql, create_customer, (err, result) => {
    if (err) {
      // return console.error(err.message);
      res.render("newCust", {
        model: {},
        type: "post",
        err: err.message});
    } else{
    res.render("newCust", {
      model: {},
      type: "post",
      err: 'good'
    });
    };
  });
});

// Strips a String Number that contains (, and $), then converts it into a Number 
function stringer(str) {
  return parseFloat(str.replace(/\$/g, '').replace(/,/g, ''));
}

app.get("/export", (req, res) => {
  var message = "";
  res.render("export",{ message: message });
 });

app.post("/export", (req, res) => {
  const sql = "SELECT * FROM CUSTOMERS ORDER BY customer_id";
  pool.query(sql, [], (err, result) => {
      var message = "";
      if (err) {
          message = `Error - ${err.message}`;
          res.render("output", { message: message })
      } else {
          var output = (`Customer ID, First Name, Last Name, State, Sales YTD, Prev Year sales\r\n`);
          result.rows.forEach(customer => {
              output += `${customer.customer_id},${customer.first_name},${customer.last_name},${customer.states},"\$"+ ${stringer(customer.sales_ytd)},"\$"+ ${stringer(customer.previous_years_sales)}\r\n`;
          });
          res.header("Content-Type", "text/csv");
          res.attachment("export.csv");
          return res.send(output);
      };
  });
});
