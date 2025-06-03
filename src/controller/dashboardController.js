const driver = require("../config/neo4j.driver")

const getStats = async (req, res) => {
  const session = driver.session()

  try {
    const response = await session.executeWrite(tx => tx.run(
      `
        MATCH (n:User)
        RETURN count(n) as total
        `
    ))
    const totalUser = response.records[0].get('total')
    return res.status(200).json({
      "success": true, "message": "Data successfully fetched", "data": {
        "total_user": totalUser
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 'success': false, "message": "Unexpected error" })
  } finally {
    await session.close()
  }
}

module.exports = { getStats }