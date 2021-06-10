const { Pool, Client } = require('pg')
const connectionString = process.env.TEST_DATABASE_URL
const pool = new Pool({
  connectionString,
})

// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })

const client = new Client({
  connectionString,
})


// Truncate All database tables
const tables = ["org", ]
query_text = "TRUNCATE $1 CASCADE"
const truncateAllTables = async (query_values) => {
    try {
    const res = await client.query(query_text, query_values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

module.exports = {
    client,
}