// Create a MySQL Database called bamazon.
// Then create a Table inside of that database called products.
// The products table should have each of the following columns:
//
//
//
// item_id (unique id for each product)
// product_name (Name of product)
// department_name
// price (cost to customer)
// stock_quantity (how much of the product is available in stores)
//
//
//
// Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).
// Then create a Node application called bamazonCustomer.js. Running this application will first display all of the items available for sale.
//Include the ids, names, and prices of products for sale.
// The app should then prompt users with two messages.
//
//
//
// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.
//
//
//
// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
//
//
//
// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
//
//
//
// However, if your store does have enough of the product, you should fulfill the customer's order.
//
//
// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.

var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "andres",

  // Your password
  password: "password123",
  database: "sandbox"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "welcome",
      type: "list",
      message: "Welcome to Bamazon, would you like to make a purchase?",
      choices: ["YES", "EXIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.welcome === "YES") {
        console.log("I'm here");
        purchase();
      }
       else{
        connection.end();
      }
    });
}


//USED TO DISPLAY THE ITEM AVAILABLE IN  THE DB
function purchase() {
  console.log("and now in here too...");
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "Select an Item"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many units would you like?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        // determine if bid was high enough
        if (chosenItem.stock_quantity - parseInt(answer.quantity) > 0) {
          // bid was high enough, so update db, let the user know, and start over
          let newStock  = (chosenItem.stock_quantity - parseInt(answer.quantity));
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newStock
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              let finalPrice = (chosenItem.price * parseInt(answer.quantity))
              console.log("Your total is " + finalPrice);
              start();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Insufficient quantity!");
          start();
        }
      });
  });
}
