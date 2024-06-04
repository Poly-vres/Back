require('dotenv').config();

// Import required modules
const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors"); // Import the cors module

// Create a new Express application
const app = express();
app.use(cors()); // Enable CORS for all requests

// Define the database connection configuration
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const mangaPool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MANGA_DB_NAME,
});

//route to get the library_books table
app.get("/library_books", async (req, res) => {
    console.log("GET Route /library_books  called");
    let conn;
    try {
        // Get a connection from the pool
        conn = await mangaPool.getConnection();

        // Execute a simple test query
        const rows = await conn.query("SELECT * FROM  library_books"); // Change "your_table" to your actual table name

        // Send the query result as the response
        res.json(rows);
    } catch (err) {
        // Handle errors
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (conn) conn.release();
    }
});

//route to get the library_books table
app.get("/library_users", async (req, res) => {
    console.log("GET Route /library_users  called");
    let conn;
    try {
        // Get a connection from the pool
        conn = await mangaPool.getConnection();

        // Execute a simple test query
        const rows = await conn.query("SELECT * FROM  library_users"); // Change "your_table" to your actual table name

        // Send the query result as the response
        res.json(rows);
    } catch (err) {
        // Handle errors
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (conn) conn.release();
    }
});

//route to add a new user
app.post("/libray_users", async (req, res) => {
    console.log("POST Route /users called");
    let conn;
    try {
        // Get a connection from the pool
        conn = await pool.getConnection();

        // Execute a simple test query
        const rows = await conn.query(
            "INSERT INTO users (id, name) VALUES (?, ?);",
            [req.body.id, req.body.name]
        ); // Change "your_table" to your actual table name

        // Send the query result as the response
        res.json(rows);
    } catch (err) {
        // Handle errors
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (conn) conn.release();
    }
});


app.post("/library_books/reserve/:userId/:bookId", async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    let conn;
    try {
        // Get a connection from the pool
        conn = await mangaPool.getConnection();

        // Execute the update query
        const result = await conn.query(
            "UPDATE library_books SET borrowed = ? WHERE id = ?;",
            [userId, bookId]
        );

        // Check if the update was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: `No book found with id: ${bookId}`
            });
        }

        // Convert BigInt values to strings if present
        const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // Send the query result as the response
        res.json({
            message: `The user ${userId} has requested to take the book with the id: ${bookId}`,
            result: serializedResult
        });
    } catch (err) {
        // Enhanced error handling
        console.error("Error executing query:", err);

        if (err.code === 'ER_BAD_FIELD_ERROR') {
            res.status(400).json({
                error: "Invalid field in the query",
                details: err.message
            });
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
            res.status(500).json({
                error: "Database table not found",
                details: err.message
            });
        } else {
            res.status(500).json({
                error: "Internal Server Error",
                details: err.message
            });
        }
    } finally {
        // Release the connection back to the pool
        if (conn) conn.release();
    }
});

app.post("/library_user_status_update/:userId/:pwd", async (req, res) => {
    const userId = req.params.userId;
    const pwd = req.params.pwd;

    let conn;
    try {
        conn = await mangaPool.getConnection();

        const result = await conn.query(
            "UPDATE library_users SET status  = ? WHERE id = ?;",
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(418).json({
                error: `No user found with id: ${userId}`
            });
        }

        const pwd = await conn.query(
            "SELECT password FROM library_users WHERE id = ?;",
            [userId]
        );

        if (pwd[0].password === pwd) {
            return res.status(418).json({
                error: `The password is incorrect`
            });
        }

        res.json({
            message: `The user ${userId} has now the status: ${status}`,
            result: serializedResult
        });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({
            error: "Internal Server Error",
            details: err.message
        });
    } finally {
        if (conn) conn.release();
    }
});

//route to connect to the site
app.post("/library_users/connect/:username/:password", async (req, res) => {
        const username = req.params.username;
        const password = req.params.password;

        let conn;
        try {
            conn = await mangaPool.getConnection();

            let correct = false;
            //we first check if the user exists, then if the password is correct

            const user = await conn.query(
                "SELECT * FROM library_users WHERE username = ?;",
                [username]
            );

            if (user.length === 0) {
                return res.status(404).json({
                    error: `No user found with username: ${username}`
                });
            }

            if (user[0].password === password) {
                res.json({
                    message: `The user ${username} is now connected`,
                });
            } else {
                res.status(418).json({
                    error: `The password is incorrect`
                });
            }
        } catch (err) {
            console.error("Error executing query:", err);
            res.status(500).json({
                error: "Internal Server Error",
                details: err.message
            });
        } finally {
            if (conn) conn.release();
        }
    }
);


//reserve a book
/*
app.post("/library_books/reserve/:id_user/:id_book", async (req, res) => {
    console.log("POST Route /library_books/reserve called");
    let conn;
    try {
        // Get a connection from the pool
        conn = await mangaPool.getConnection();

        // Update the library_books table to set reservated_by
        const rows = await conn.query(
            "UPDATE library_books SET reservated_by = ? WHERE id = ?;",
            [req.params.id_user, req.params.id_book]
        );

        // Send the query result as the response
        res.json(rows);
    } catch (err) {
        // Handle errors
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        // Release the connection back to the pool
        if (conn) conn.release();
    }
});
*/


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    let runtimer = 0;
    setInterval(() => {
        console.log(
            "Server is running for " + runtimer + " minutes on port " + PORT
        );
    }, 60000);
});

//TODO: FAIRE UNE ROUTE DE CONNEXION, DE CREATION DE COMPTE