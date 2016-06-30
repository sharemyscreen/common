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

organizationSchema.methods.safePrint = function (keepMembers) {
  if (keepMembers) {
    var mb;
    var members = [];
    this.members.forEach(function (member) {
      mb = member.safePrintMember();
      members.push(mb);
    });
  }

  var owner = this.owner.safePrintMember();

  var creator = this.creator.safePrintMember();

  var ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = keepMembers ? members : undefined;
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
      org.members.splice(org.members.indexOf(user), 1);
      org.save(cb);
    }
  });
};

organizationSchema.methods.destroy = function (cb) {
  const org = this;
  org.members.forEach(function (member, i) {
    member.leaveOrganization(this, function (err) {
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

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
