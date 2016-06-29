const smsCommon = require('../../');
const expect = require('chai').expect;
const organizationFixture = require('../fixtures/models/organization.json');

var user;
var user2;
var org;
var room;

describe('Testing Organization model', function () {
  before(function (done) {
    smsCommon.userModel.createPassword(organizationFixture.user.email,
      organizationFixture.user.password,
      organizationFixture.user.firstName,
      organizationFixture.user.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        }	else {
          user = cUser;
          smsCommon.userModel.createPassword(organizationFixture.user2.email,
            organizationFixture.user2.password,
            organizationFixture.user2.firstName,
            organizationFixture.user2.lastName,
            function (err, cUser) {
              if (err) {
                done(err);
              } else {
                user2 = cUser;
                done();
              }
            });
        }
      });
  });

  it('createNew()', function (done) {
    smsCommon.organizationModel.createNew(organizationFixture.organization.name,
      user,
      function (err, cOrg) {
        if (err) {
          done(err);
        }	else {
          expect(cOrg.publicId.length).to.equal(25);
          expect(cOrg.name).to.equal(organizationFixture.organization.name);
          expect(cOrg.creator._id).to.equal(user._id);
          expect(cOrg.owner._id).to.equal(user._id);
          expect(cOrg.rooms).to.have.lengthOf(1);
          expect(cOrg.rooms[0].name).to.equal('General');
          expect(cOrg.rooms[0].members).to.have.lengthOf(1);
          expect(cOrg.rooms[0].members[0].publicId).to.equal(user.publicId);
          expect(cOrg.members.length).to.equal(1);
          smsCommon.userModel.getByPublicId(user.publicId, function (err, fUser) {
            if (err) {
              done(err);
            } else {
              expect(fUser.organizations).to.have.lengthOf(1);
              org = cOrg;
              done();
            }
          });
        }
      });
  });

  it('getAll()', function (done) {
    smsCommon.organizationModel.getAll(function (err, fOrgs) {
      if (err) {
        done(err);
      } else {
        expect(fOrgs).to.be.an('array');
        expect(fOrgs).to.have.lengthOf(1);
        done();
      }
    });
  });

  it('getByIdFull()', function (done) {
    smsCommon.organizationModel.getByIdFull(org._id, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        expect(fOrg).to.not.be.null;
        expect(fOrg._id).to.eql(org._id);
        expect(fOrg.members).to.have.lengthOf(1);
        expect(fOrg.members[0].firstName).to.equal(user.firstName);
        expect(fOrg.rooms).to.have.lengthOf(1);
        expect(fOrg.rooms[0].name).to.equal('General');
        expect(fOrg.rooms[0].members).to.have.lengthOf(1);
        expect(fOrg.rooms[0].members[0].publicId).to.equal(user.publicId);
        done();
      }
    });
  });

  it('getById()', function (done) {
    smsCommon.organizationModel.getById(org._id, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        expect(fOrg).to.not.be.null;
        expect(fOrg._id).to.eql(org._id);
        expect(fOrg.members).to.have.lengthOf(1);
        expect(fOrg.members[0].firstName).to.equal(user.firstName);
        done();
      }
    });
  });

  it('getByPublicId()', function (done) {
    smsCommon.organizationModel.getByPublicId(org.publicId, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        expect(fOrg).to.not.be.null;
        expect(fOrg._id).to.eql(org._id);
        expect(fOrg.members).to.have.lengthOf(1);
        expect(fOrg.members[0].firstName).to.equal(user.firstName);
        done();
      }
    });
  });

  it('getByPublicIdFull()', function (done) {
    smsCommon.organizationModel.getByPublicIdFull(org.publicId, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        expect(fOrg).to.not.be.null;
        expect(fOrg._id).to.eql(org._id);
        expect(fOrg.members).to.have.lengthOf(1);
        expect(fOrg.members[0].firstName).to.equal(user.firstName);
        expect(fOrg.rooms).to.have.lengthOf(1);
        expect(fOrg.rooms[0].name).to.equal('General');
        expect(fOrg.rooms[0].members).to.have.lengthOf(1);
        expect(fOrg.rooms[0].members[0].publicId).to.equal(user.publicId);
        done();
      }
    });
  });

  it('safePrint()', function (done) {
    smsCommon.organizationModel.getByIdFull(org._id, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        const result = fOrg.safePrint(user);
        expect(result.publicId.length).to.equal(25);
        expect(result.name).to.equal(organizationFixture.organization.name);
        expect(result.members.length).to.equal(1);
        expect(result.owner._id).to.be.undefined;
        expect(result.creator._id).to.be.undefined;
        result.members.forEach(function (member) {
          expect(member._id).to.be.undefined;
          expect(member.organizations).to.be.undefined;
        });
        expect(result.rooms).to.have.lengthOf(1);
        result.rooms.forEach(function (room) {
          expect(room._id).to.be.undefined;
          expect(room.organizations).to.be.undefined;
          expect(room.members).to.have.lengthOf(1);
          room.members.forEach(function (member) {
            expect(member._id).to.be.undefined;
            expect(member.publicId).to.equal(user.publicId);
          });
        });
        done();
      }
    });
  });

  it('safePrint()', function (done) {
    smsCommon.organizationModel.getByPublicId(org.publicId, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        const result = fOrg.safePrint(user);
        expect(result.publicId.length).to.equal(25);
        expect(result.name).to.equal(organizationFixture.organization.name);
        expect(result.members.length).to.equal(1);
        expect(result.owner._id).to.be.undefined;
        expect(result.creator._id).to.be.undefined;
        result.members.forEach(function (member) {
          expect(member._id).to.be.undefined;
          expect(member.organizations).to.be.undefined;
        });
        expect(result.rooms).to.have.lengthOf(1);
        result.rooms.forEach(function (room) {
          expect(room._id).to.be.undefined;
          expect(room.organizations).to.be.undefined;
          expect(room.members).to.be.undefined;
        });
        done();
      }
    });
  });

  it('inviteUser()', function (done) {
    org.inviteUser(user2, function (err) {
      if (err) {
        done(err);
      } else {
        smsCommon.organizationModel.getByIdFull(org._id, function (err, fOrg) {
          if (err) {
            done(err);
          } else {
            expect(fOrg.members).to.have.lengthOf(2);
            expect(fOrg.rooms[0].members).to.have.lengthOf(2);
            expect(user2.organizations).to.have.lengthOf(1);
            done();
          }
        });
      }
    });
  });

  it('kickUser()', function (done) {
    org.kickUser(user2, function (err) {
      if (err) {
        done(err);
      } else {
        smsCommon.organizationModel.getByIdFull(org._id, function (err, fOrg) {
          if (err) {
            done(err);
          } else {
            expect(fOrg.members).to.have.lengthOf(1);
            expect(fOrg.rooms[0].members).to.have.lengthOf(1);
            expect(user2.organizations).to.have.lengthOf(0);
            done();
          }
        });
      }
    });
  });

  it('createRoom()', function (done) {
    org.createRoom('Test room', user, true, function (err, cRoom) {
      if (err) {
        done(err);
      } else {
        expect(cRoom.name).to.equal('Test room');
        expect(cRoom.isPrivate).to.equal(true);
        expect(cRoom.creator.publicId).to.equal(user.publicId);
        expect(cRoom.owner.publicId).to.equal(user.publicId);
        expect(cRoom.members).to.have.lengthOf(1);
        expect(org.rooms).to.have.lengthOf(2);
        done();
      }
    });
  });

  it('createRoom()', function (done) {
    org.createRoom('Test room2', user, false, function (err, cRoom) {
      if (err) {
        done(err);
      } else {
        expect(cRoom.name).to.equal('Test room2');
        expect(cRoom.isPrivate).to.equal(false);
        expect(cRoom.creator.publicId).to.equal(user.publicId);
        expect(cRoom.owner.publicId).to.equal(user.publicId);
        expect(cRoom.members).to.have.lengthOf(1);
        expect(org.rooms).to.have.lengthOf(3);
        room = cRoom;
        done();
      }
    });
  });

  it('deleteRoom()', function (done) {
    org.deleteRoom(room, function (err) {
      if (err) {
        done(err);
      } else {
        expect(org.rooms).to.have.lengthOf(2);
        done();
      }
    });
  });

  it('destroy()', function (done) {
    smsCommon.organizationModel.getByIdFull(org._id, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        fOrg.destroy(function (err) {
          if (err) {
            done(err);
          } else {
            smsCommon.userModel.getByPublicId(user.publicId, function (err, fUser) {
              if (err) {
                done(err);
              } else {
                expect(fUser.organizations).to.have.lengthOf(0);
                done();
              }
            });
          }
        });
      }
    });
  });
});
