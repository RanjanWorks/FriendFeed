const jwt = require('jsonwebtoken');

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login')
  }

  try {
    let data = jwt.verify(token, 'ranjan');
    req.user = data;
    next();
  } catch (error) {
    return res.status(403).send("Invalid token");
  }
}

module.exports = isLoggedIn;
