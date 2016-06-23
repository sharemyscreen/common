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

userSchema.statics.createPassword = function (email, password, firstName, lastName, cb) {
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

userSchema.statics.createFacebook = function (email, facebookId, firstName, lastName, cb) {
  userModel.create({
    email: email,
    facebookId: facebookId,
    firstName: firstName,
    lastName: lastName,
    publicId: utils.uidGen(25),
    organizations: []
  }, cb);
};

userSchema.statics.createGoogle = function (email, googleId, firstName, lastName, cb) {
  userModel.create({
    email: email,
    googleId: googleId,
    firstName: firstName,
    lastName: lastName,
    publicId: utils.uidGen(25),
    organizations: []
  }, cb);
};

userSchema.statics.getByPublicId = function (publicId, cb) {
  userModel.findOne({ publicId: publicId }, cb);
};

userSchema.statics.getByCredential = function (email, password, cb) {
  userModel.findOne({ email: email }, function (err, fUser) {
    if (err) {
      cb(err);
    } else {
      bcrypt.compare(password, fUser.password, function (err, res) {
        if (err) {
          cb(err);
        } else {
          cb(null, res === true ? fUser : false);
        }
      });
    }
  });
};

userSchema.statics.getByFacebookId = function (facebookId, cb) {
  userModel.findOne({ facebookId: facebookId }, cb);
};

userSchema.statics.getByGoogleId = function (googleId, cb) {
  userModel.findOne({ googleId: googleId }, cb);
};

userSchema.methods.safePrint = function () {
  const obj = this.toObject();
  obj.password = undefined;
  obj.googleId = undefined;
  obj.facebookId = undefined;
  obj.__v = undefined;
  obj._id = undefined;
  obj.updatedAt = undefined;
  return obj;
};

userSchema.methods.integrateOrganization = function (organization, cb) {
  this.organizations.push(organization);
  return this.save(cb);
};

userSchema.methods.leaveOrganization = function (organization, cb) {
  this.organizations.splice(this.organizations.indexOf(organization), 1);
  return this.save(cb);
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
