const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

// package for user to only be allowed to create one account per email (added as plugin)
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);