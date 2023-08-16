const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    // delete bookObject._id;
    // delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre créer !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
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
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
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
    console.log("BEST");
    Book.find()
        .then((books) => {
            books.sort((a,b) => b.averageRating - a.averageRating)
            const bestRatedBooks = books.slice(0, 3)
            res.status(200).json(bestRatedBooks);
        })
        .catch(error => res.status(400).json({ error }));

};

exports.rateBook = (req, res, next) => {
    const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };

    Book.findOne({_id: req.params.id})
    .then((book) => {
        console.log('THE BOOKS USER ID ' + book.userId);
        console.log('MY USER ID ' + req.auth.userId);
        console.log(rating);

        if (book.userId == req.auth.userId) {
            res.status(401).json({ message : 'A dèja noté ce livre'});
            console.log('A dèja noté ce livre');
        } else {
            book.ratings.push(rating);
            console.log(book.ratings);

            let sumOfRatings = 0;
            let grades = book.ratings.map(({grade}) => grade);
            console.log(grades);

            for (i=0; i < grades.length; i++){
                sumOfRatings += grades[i];
            }
            console.log('SUM OF RATINGS ' + sumOfRatings);
            book.averageRating = sumOfRatings / grades.length;
            console.log('AVERAGE RATING ' + book.averageRating );

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