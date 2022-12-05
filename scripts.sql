CREATE TABLE CUSTOMERS (
  customer_id   	INTEGER PRIMARY KEY,
  first_name  	VARCHAR(20),
  last_name  	VARCHAR(20),
  states 	VARCHAR(2),
  sales_ytd	    MONEY,
  previous_years_sales  MONEY
);

INSERT INTO CUSTOMERS (customer_id, first_name, last_name, states, sales_ytd, previous_years_sales)
VALUES 
    ('1', 'John', 'Smith', 'CA', 9000, 8000),
    ('2', 'Joe', 'Cabyon', 'NY', 11230, 15000),
    ('3', 'Rene', 'Trujillo', 'CO', 15000, 13222),
    ('4', 'Alex', 'Rodriguez', 'AK', 8643, 7423),
    ('5', 'Chris', 'Johnson', 'AL', 9235, 4345),
    ('6', 'Justin', 'Brown', 'CT', 12467, 10000),
    ('7', 'Mayra', 'Garcia', 'GA', 12234, 12000);
