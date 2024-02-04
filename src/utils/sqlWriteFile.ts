// function for testing of sql requests
const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
    console.log(err)
  }
}
