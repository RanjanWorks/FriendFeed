const jwt = require('jsonwebtoken');
const userModal = require('../models/userModal'); // Adjust the path as necessary

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    req.isLogged = false;
    req.edit = false;

    if (token) {
      const data = jwt.verify(token, 'ranjan');
      req.isLogged = true;
      req.current = data
      
      const user = await userModal.findById(data.userId);
      if (user && user.username === req.params.username) {
        req.edit = true;
      }
    }
  } catch (error) {
    console.log(error);
  }
  next();
};

module.exports = authenticateUser;
