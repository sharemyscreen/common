const mongoose = require('mongoose');
const utils = require('../utils');
const userModel = require('./user');

const Schema = mongoose.Schema;

const organizationSchema = new Schema({
  publicId: {
    type: String,
    require: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, { timestamps: true });

organizationSchema.statics.createNew = function (name, user, cb) {
  organizationModel.create({
    name: name,
    owner: user,
    creator: user,
    members: [user],
    publicId: utils.uidGen(25)
  }, function (err, cOrg) {
    if (err) {
      cb(err);
    } else {
      user.integrateOrganization(cOrg, function (err) {
        if (err) {
          cb(err);
        } else {
          cb(null, cOrg);
        }
      });
    }
  });
};

organizationSchema.statics.getAll = function (cb) {
  organizationModel.find({}, cb);
};

organizationSchema.statics.getByPublicId = function (id, cb) {
  organizationModel.findOne({publicId: id})
    .populate('owner creator members')
    .exec(cb);
};

organizationSchema.statics.getByIdDepth = function (id, cb) {
  organizationModel.findOne({ _id: id })
    .populate('owner creator members')
    .exec(cb);
};

organizationSchema.methods.safePrint = function () {
  var mb;
  var members = [];
  this.members.forEach(function (member) {
    mb = member.safePrint();
    delete mb.organizations;
    members.push(mb);
  });

  var owner = this.owner.safePrint();
  delete owner.organizations;

  var creator = this.creator.safePrint();
  delete creator.organizations;

  var ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = members;
  ret.owner = owner;
  ret.creator = creator;
  return ret;
};

organizationSchema.methods.inviteUser = function (user, cb) {
  this.members.push(user);
  return this.save(cb);
};

organizationSchema.methods.kickUser = function (user, cb) {
  this.members.splice(this.members.indexOf(user), 1);
  return this.save(cb);
};

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
