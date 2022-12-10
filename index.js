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

// GET /manage
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

// POST /manage
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


// GET /edit/5
app.get("/edit/:id", async(req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM CUSTOMERS WHERE customer_id = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { 
      model: result.rows[0],
      type: 'get'
     });
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const customer = [req.body.customer_id, req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales, id];
  const sql = "UPDATE CUSTOMERS SET customer_id = $1, first_name = INITCAP($2), last_name = INITCAP($3), states = UPPER($4), sales_ytd = $5, previous_years_sales = $6 WHERE (customer_id = $7)";
  pool.query(sql, customer, (err, result) => {
    if (err) {
      res.render("edit", {
        model: req.body,
        err: 'good',
        type: 'post'});
      } else {
      res.render("edit", {
        model: req.body,
        err: 'good',
        type: 'post'});
    };
  });
});



  // GET /delete/5
  app.get("/delete/:id", async(req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM CUSTOMERS WHERE customer_id = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("delete", { 
        model: result.rows[0],
        type: 'get'
    });
  });
});


  // POST /delete/5
  app.post("/delete/:id", async(req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM CUSTOMERS WHERE customer_id = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        res.render("delete", {
          model: req.body,
          err: 'good',
          type: 'post'});
        } else {
        res.render("delete", {
          model: req.body,
          err: 'good',
          type: 'post'});
      };
    });
  });

  // GET /newCust
  app.get("/newCust", async (req, res) => {
    res.render("newCust", {
      model: {},
      type: "get"
    });
  });

  // POST /newCust
  app.post("/newCust", async (req, res) => {
    const sql = "INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales) VALUES ($1, INITCAP($2), INITCAP($3), UPPER($4), $5, $6)";
    const create_customer = [req.body.customer_id, req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales];
    pool.query(sql, create_customer, (err, result) => {
      if (err) {
        // return console.error(err.message);
        res.render("newCust", {
          model: req.body,
          type: "post",
          err: err.message
        });
      } else {
        res.render("newCust", {
          model: req.body,
          err: 'good',
          type: "post"

        });
      };
    });
  });

  // Strips a String Number that contains (, and $), then converts it into a Number 
  function stringer(str) {
    return parseFloat(str.replace(/\$/g, '').replace(/,/g, ''));
  }

  // GET /export
  app.get("/export", async (req, res) => {
    var message = "";
    const totRecs = await finder.getTotalRecords();
    res.render("export", {
      type: "get",
      message: message,
      totRecs: totRecs.totRecords,
    });
  });

  // POST /export
  app.post("/export", async (req, res) => {
    const sql = "SELECT * FROM CUSTOMERS ORDER BY customer_id";
    pool.query(sql, [], (err, result) => {
      var message = "";
      var tests = req.body.file_name;
      if (err) {
        message = `Error - ${err.message}`;
        res.render("output", { message: message })
      } else {
        // var output = (`Customer ID, First Name, Last Name, State, Sales YTD, Prev Year sales\r\n`);
        var output = "";
        result.rows.forEach(customer => {
          // output += `${customer.customer_id},${customer.first_name},${customer.last_name},${customer.states},${customer.sales_ytd},${customer.previous_years_sales}\r\n`;
          // output += `${customer.customer_id},${customer.first_name},${customer.last_name},${customer.states},"\$"+ ${stringer(customer.sales_ytd)},"\$"+ ${stringer(customer.previous_years_sales)}\r\n`;
          output += `${customer.customer_id},${customer.first_name},${customer.last_name},${customer.states},${stringer(customer.sales_ytd)},${stringer(customer.previous_years_sales)}\r\n`;
        });
        res.header("Content-Type", "text/csv");
        res.attachment(`${tests}`);
        return res.send(output);
      };
    });
  });


  // GET /import
  app.get("/import", async (req, res) => {
    var message = "";
    const totRecs = await finder.getTotalRecords();
    res.render("import", {
      type: "get",
      message: message,
      totRecs: totRecs.totRecords,
    });
  });

  // POST /import
  // app.post("/import", upload.single('filename'), async (req, res) => {
  //   if (!req.file || Object.keys(req.file).length === 0) {
  //     message = "Error: Import file not uploaded";
  //     return res.send(message);
  //   };
  //   //Read file line by line, inserting records
  //   const buffer = req.file.buffer;
  //   const lines = buffer.toString().split(/\r?\n/);
  //   var numFailed = 0;
  //   var numInserted = 0;
  //   var errorMessage = "";

  //   lines.forEach(line => {
  //     //console.log(line);
  //     customer = line.split(",");
  //     //console.log(customer);
  //     const sql = "INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales) VALUES ($1, INITCAP($2), INITCAP($3), UPPER($4), $5, $6)";
  //     pool.query(sql, customer, (err, result) => {

  //       if (err) {
  //         // console.log(`Insert Error.  Error message: ${err.message}`);
  //         numFailed++;
  //         errorMessage += `${err.msg} \r\n`;

  //       } else {
  //         console.log(`Inserted successfully`);
  //         numInserted++;
  //       }
  //     });
  //   });

  //   num_records = `<h2>Import Summary</h1><br>
  //   <h6>Records Processed: ${lines.length}</h6><br>
  //   <h6>Records inserted successfully:${numInserted}</h6><br>
  //   <h6>Records not inserted: ${numFailed}</h6><br>`;;

  //   res.send(num_records);
  //   // res.send(num_inserted_msg);
  //   // res.send(num_failed_msg);
  // });

  // USE INNER HTML AND EXPAND NUM_RECORDS TO HAVE THE NUMBER ISNERTED AND TEH NUMBER FAILED 


  app.post("/import", upload.single('filename'), async (req, res) => {
    if (!req.file || Object.keys(req.file).length === 0) {
      message = "Error: Import file not uploaded";
      return res.send(message);
    };
    //Read file line by line, inserting records
    const buffer = req.file.buffer;
    const lines = buffer.toString().split(/\r?\n/);
    var numFailed = 0;
    var numInserted = 0;
    var errorMessage = [];

    for (line of lines) {
      customer = line.split(",");
      //console.log(customer);
      const result = await finder.insertCustomer(customer);
      if (result.trans === "success") {
        numInserted++;
      } else {
        numFailed++;
        errorMessage.push(`${result.msg}`);
      };
    };
    console.log(typeof (errorMessage));
    console.log(errorMessage);
    num_records = (`<h3>Import Summary</h3><br>
                 <p>Records Processed: ${lines.length}</p><br>
                 <p>Records inserted successfully:${numInserted}</p><br>
                 <p>Records not inserted: ${numFailed}</p><br>`);

    if (numFailed > 0) {
      num_records += `<h4>Error Message</h4><br>`;
      for (let i = 0; i < errorMessage.length; i++) {
        num_records += `<p>${errorMessage[i]}</p><br>`;
      }
    };
    res.send(num_records);
  });

// // GET /create
// app.get("/create", (req, res) => {
//   res.render("create", { model: {} });
// });

// // POST /create
// app.post("/create", (req, res) => {
//   const sql = "INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales) VALUES ($1, INITCAP($2), INITCAP($3), UPPER($4), $5, $6)";
//   const create_customer = [req.body.customer_id, req.body.first_name, req.body.last_name, req.body.states, req.body.sales_ytd, req.body.previous_years_sales];
//   pool.query(sql, create_customer, (err, result) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     res.redirect("/manage");
//   });
// });
