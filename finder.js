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
  console.log("Successful connection to the database");
  

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customers";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;


const insertCustomer = (customers) => {
    // Will accept either a customers array or customers object
    if (customers instanceof Array) {
        params = customers;
    } else {
        params = Object.values(customers);
    };

    const sql = `INSERT INTO customers (customers_id, first_name, last_name, states, sales_ytd, previous_years_sales)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `Customers id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customers id ${params[0]}.  ${err.message}`
            };
        });
};

// Add this at the bottom
module.exports.insertCustomer = insertCustomer;



const findCustomers = (customers) => {
    // Will build query based on data provided in the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM customers WHERE true";

    // Check data provided and build query as necessary
    if (customers.customer_id !== "") {
        params.push(parseInt(customers.customer_id));
        sql += ` AND customer_id = $${i}`;
        i++;
    };
    if (customers.first_name !== "") {
        params.push(`${customers.first_name}%`);
        sql += ` AND UPPER(first_name) LIKE UPPER($${i})`;
        i++;
    };
    if (customers.last_name !== "") {
        params.push(`${customers.last_name}%`);
        sql += ` AND UPPER(last_name) LIKE UPPER($${i})`;
        i++;
    };
    if (customers.states !== "") {
        params.push(`${customers.states}%`);
        sql += ` AND UPPER(states) LIKE UPPER($${i})`;
        i++;
    };
    if (customers.sales_ytd !== "") {
        params.push(parseFloat(customers.sales_ytd));
        sql += ` AND sales_ytd >= $${i}`;
        i++;
    };
    if (customers.previous_years_sales !== "") {
        params.push(parseFloat(customers.previous_years_sales));
        sql += ` AND previous_years_sales >= $${i}`;
        i++;
    };

    sql += ` ORDER BY customer_id`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

// Add towards the bottom of the page
module.exports.findCustomers = findCustomers;
