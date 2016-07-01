'use strict';

const mongoose = require('mongoose');
const roomModel = require('./room');
const utils = require('../utils');

const Schema = mongoose.Schema;

const organizationSchema = new Schema({
  publicId: {
    type: String,
    required: true,
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
  }],
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: 'Room'
  }]
}, { timestamps: true });

organizationSchema.statics.createNew = function (name, user, cb) {
  organizationModel.create({
    name: name,
    owner: user,
    creator: user,
    members: [user],
    publicId: utils.uidGen(25)
  }, (err, cOrg) => {
    if (err) {
      return cb(err);
    }

    user.integrateOrganization(cOrg, err => {
      if (err) {
        return cb(err);
      }
      roomModel.createNew('general', user, [], (err, room) => {
        if (err) {
          return cb(err);
        }

        cOrg.rooms.push(room);
        cb(null, cOrg);
      });
    });
  });
};

organizationSchema.statics.getAll = function (cb) {
  return organizationModel.find({}).exec(cb);
};

organizationSchema.statics.getByPublicId = function (id, cb) {
  return organizationModel.findOne({publicId: id})
    .populate('owner creator members')
    .exec(cb);
};

organizationSchema.statics.getByIdDepth = function (id, cb) {
  return organizationModel.findOne({_id: id})
    .populate('owner creator members')
    .exec(cb);
};

organizationSchema.methods.safePrint = function (keepMembers) {
  if (keepMembers) {
    let mb;
    const members = [];
    this.members.forEach(function (member) {
      mb = member.safePrintMember();
      members.push(mb);
    });
  }

  const owner = this.owner.safePrintMember();

  const creator = this.creator.safePrintMember();

  const ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = keepMembers ? ret.members : undefined;
  ret.owner = owner;
  ret.creator = creator;
  return ret;
};

organizationSchema.methods.inviteUser = function (user, cb) {
  const org = this;
  user.integrateOrganization(org, function (err) {
    if (err) {
      cb(err);
    } else {
      org.members.push(user);
      org.save(cb);
    }
  });
};

organizationSchema.methods.kickUser = function (user, cb) {
  const org = this;
  user.leaveOrganization(org, function (err) {
    if (err) {
      cb(err);
    } else {
      org.members.pull(user._id);
      org.save(cb);
    }
  });
};

organizationSchema.methods.destroy = function (cb) {
  const org = this;
  org.members.forEach(function (member, i) {
    member.leaveOrganization(org, function (err) {
      if (err) {
        cb(err);
      } else {
        if (i === org.members.length - 1) {
          org.remove(cb);
        }
      }
    });
  });
};

organizationSchema.virtual('room.default').get(() => {
  return this.rooms[0];
});

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
