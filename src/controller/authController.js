const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const driver = require('../config/neo4j.driver');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../constants');

const handleLogin = async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ 'message': 'User email and password must not be empty' })
  }

  const { email, password } = req.body
  const session = driver.session();
  const response = await session.executeRead(tx => tx.run(
    `
      MATCH (u: User {email: $email})
      RETURN u
      `,
    { email }
  ))

  await session.close()

  if (response.records.length === 0) {
    return res.status(401).json({ 'message': 'No user found' })
  }
  const user = response.records[0].get('u')

  const hashedPassword = user.properties.password
  const isAuth = await bcrypt.compare(password, hashedPassword)

  if (isAuth) {
    const { firstName, lastName, image, role, companyPosition, companyName, phone, email: userEmail, username } = user.properties

    const accessToken = jwt.sign(
      {
        "user_info": {
          "username": username,
          "email": userEmail,
          "role": role,
          "first_name": firstName,
          "last_name": lastName,
          "profile_pict": image,
          "phone": phone,
          "company": companyName,
          "job_title": companyPosition
        }
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    )

    const refreshToken = jwt.sign(
      {
        "username": username,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    )

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000
    })
    res.status(200).json({ 'success': true, 'message': 'Login successful', 'data': { accessToken } })
  } else {
    res.status(401).json({ 'message': 'Invalid credentials' })
  }
}

module.exports = { handleLogin }