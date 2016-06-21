const utils = require('../utils');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  publicId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    bcrypt: true
  },
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String,
    require: true
  },
  googleId: String,
  facebookId: String,
  organizations: [{
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }]

}, {timestamps: true});

userSchema.virtual('fullName').get(function () { return this.firstName + ' ' + this.lastName; });

userSchema.statics.createNewPassword = function (email, password, firstName, lastName, cb) {
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      cb(err);
    } else {
      userModel.create({
        email: email,
        password: hash,
        firstName: firstName,
        lastName: lastName,
        publicId: utils.uidGen(25),
        organizations: []
      }, cb);
    }
  });
};

userSchema.methods.integrateOrganization = function (organization) {
  this.organizations.push(organization);
  return this.save();
};

userSchema.methods.leaveOrganization = function (organization) {
  this.organizations.splice(this.organizations.indexOf(organization), 1);
  return this.save();
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
