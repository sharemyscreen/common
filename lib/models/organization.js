const mongoose = require('mongoose');
const utils = require('../utils');

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
  }, cb);
};

organizationSchema.statics.getAll = function (cb) {
  organizationModel.find({}, cb);
};

organizationSchema.statics.getByPublicId = function (id, cb) {
  organizationModel.findOne({publicId: id})
    .populate('members')
    .exec(cb);
};

organizationSchema.statics.getByIdDepth = function (id, cb) {
  organizationModel.findOne({ _id: id })
    .populate('members')
    .exec(cb);
};

organizationSchema.methods.safePrint = function () {
  var members = [];
  this.members.forEach(function (member) {
    members.push(member.safePrint());
  });
  var ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = members;
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
