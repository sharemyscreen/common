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

userSchema.statics.getByPublicId = function (publicId, organization, cb) {
  if (organization) {
    userModel.findOne({ publicId: publicId })
      .populate('organizations')
      .exec(function (err, fUser) {
        if (err) {
          cb(err);
        } else {
          fUser.organizations.forEach(function (org, i) {
            org.populate('owner creator members', function (err, fOrg) {
              if (err) {
                cb(err);
              } else {
                fUser.organizations[i] = fOrg;
                if (i === fUser.organizations.length - 1) {
                  cb(null, fUser);
                }
              }
            });
          });
        }
      });
  } else {
    userModel.findOne({publicId: publicId}, cb);
  }
};

userSchema.statics.getByEmail = function (email, cb) {
  userModel.findOne({ email: email }, cb);
};

userSchema.statics.getByPartialEmail = function (partialEmail, limit, cb) {
  userModel.find({ email: new RegExp('^' + partialEmail, 'i') })
    .limit(limit)
    .exec(cb);
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
  var orgs = [];
  this.organizations.forEach(function (organization) {
    orgs.push(organization.safePrint(true));
  });
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  delete obj.facebookId;
  delete obj.__v;
  delete obj._id;
  delete obj.updatedAt;
  obj.organizations = orgs;
  return obj;
};

userSchema.methods.safePrintMember = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  delete obj.facebookId;
  delete obj.__v;
  delete obj._id;
  delete obj.updatedAt;
  delete obj.organizations;
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
