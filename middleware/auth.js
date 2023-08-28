const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
        //get token, take out the brearer word
       const token = req.headers.authorization.split(' ')[1];
       // decode token with verify method (pass token and secret phrase)
       const decodedToken = jwt.verify(token, 'BOOKS_ARE_AWESOME');
        // get user id decoded in the token
       const userId = decodedToken.userId;
       // add this value to the req object to transmit to other middlewares
       req.auth = {
           userId: userId
       };
    next();
   } catch(error) {
       res.status(401).json({ error });
   }
};