// crypting package
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    // hash the passeword (pass the password from the body + salt (how many times we eexectute the hash algorythime))
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // create new user with our model
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // save in DB
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            // check if user exists
            // if it doesn't =
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            //if it does: methode compare of bcrypt to compare hash password (what was send by req, what is in DB)
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // if password is wrong:
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    // if password is right: return object with: user id, jwt token
                    res.status(200).json({
                        userId: user._id,
                        // create token with methode sign. Create object with data to encode (user id) and secret key for encoding, expiration time)
                        token: jwt.sign(
                            { userId: user._id },
                            'BOOKS_ARE_AWESOME',
                            { expiresIn: '24h' },
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };