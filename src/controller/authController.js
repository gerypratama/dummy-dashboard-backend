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

const handleRegister = async (req, res) => {
  if (!req.body
    || !req.body.email
    || !req.body.password
    || !req.body.username) {
    return res.status(400).json({ 'message': 'User email, username, and password must not be empty' })
  }

  const { email, username, password } = req.body
  const session = driver.session()

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const response = await session.executeWrite(tx => tx.run(
      `
      MATCH (existing:User)
      WHERE existing.email = $email OR existing.username = $username
      WITH count(existing) > 0 as exists
      CALL apoc.do.when(
        exists,
        'RETURN null as user',
        '
          CREATE (u:User {
            email: email,
            username: username,
            password: password,
            createdAt: datetime()
          }) RETURN u as user
        ', {email: $email, username: $username, password: $hashedPassword}
      ) YIELD value
      RETURN value.user, exists
    `,
      { email, username, hashedPassword }
    ))

    const exists = response.records[0].get('exists')

    if (exists) {
      return res.status(409).json({ 'message': 'User already exists' })
    }

    res.status(201).json({ 'success': true, 'message': 'User created successfully' })
  } catch (error) {
    res.status(500).json({ 'message': 'Error creating user' })
  } finally {
    await session.close()
  }
}

module.exports = { handleLogin, handleRegister }