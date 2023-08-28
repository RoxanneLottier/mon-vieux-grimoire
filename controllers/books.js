const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    // Parse the object (divide the string)
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId; //we will use thre user id from the token for more security

    // create new instance of Book using spread operator
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });

   // save in the DB
    book.save()
        .then(() => res.status(201).json({ message: 'Livre créer !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    // check if document was sent by checking if the is a file in the req
    //if doucument sent:
    const bookObject = req.file ? {
        // parse the string
        ...JSON.parse(req.body.book),
        // create URL for image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; // if no file just to the object in req.body

    delete bookObject._userId; // for security reasons
    // find book that needs to be changed
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // check if the user is the one that created the book, and so is alowed to modify it
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message : 'Unauthorized request'});
            } else {
                // use methode updateOne, argument1: object that we need to modify, argument2: new version of the object, precise the id, the one in the req might not be the right one)
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            // check if user is the one that create the book (is auhtorized)
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request'});
            } else {
                // if yes: delete file linked to book
                // get the file name from the url
                const filename = book.imageUrl.split('/images/')[1];
                // delete the file with unlink methode
                fs.unlink(`images/${filename}`, () => {
                    // delete object in DB
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            res.status(200).json(book);
            console.log(book);
        })
      .catch(error => res.status(404).json({ error }));
  };

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
            console.log(books);
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            // sort books by rating from best to worst
            books.sort((a,b) => b.averageRating - a.averageRating)
            // take the first 3
            const bestRatedBooks = books.slice(0, 3)
            res.status(200).json(bestRatedBooks);
        })
        .catch(error => res.status(400).json({ error }));

};

exports.rateBook = (req, res, next) => {
    // create an rating object
    const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    // find book with id parameter
    Book.findOne({_id: req.params.id})
    .then((book) => {
        // console.log('THE BOOKS USER ID ' + book.userId);
        // console.log('MY USER ID ' + req.auth.userId);
        // console.log(rating);

        // create array of user id existing ratings
        const existingRatings = book.ratings.map(({userId}) => userId)

        // console.log("EX " + existingRatings);
        // check if this array includes the user id of the person authentificated
        const checkUserId = existingRatings.includes(req.auth.userId);
        // console.log(checkUserId);

        // if user id already rated book:
        if (checkUserId == "true") {
            res.status(403).json({ message : 'A dèja noté ce livre'});
            console.log('A dèja noté ce livre');
        } else {
            // otherwise push object to DB
            book.ratings.push(rating);
            // console.log(book.ratings);

            let sumOfRatings = 0;
            // create array of all the ratings
            let grades = book.ratings.map(({grade}) => grade);
            // console.log(grades);

            // loop through array to get the sum of all the ratings and add it to the sumOfRatings
            for (i=0; i < grades.length; i++){
                sumOfRatings += grades[i];
            }
            // console.log('SUM OF RATINGS ' + sumOfRatings);
            // calculate new averageRating
            book.averageRating = sumOfRatings / grades.length;
            // console.log('AVERAGE RATING ' + book.averageRating );

            // save it
            book.save()
            .then((book) => {
                res.status(200).json(book);
                console.log('Book saved', book);
            })
            .catch(error => res.status(500).json({ error }));

        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};