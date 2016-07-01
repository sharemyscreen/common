const smsCommon = require('../../');
const expect = require('chai').expect;
const organizationFixture = require('../fixtures/models/organization.json');

var user;
var user2;
var org;
var org2;

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
          expect(cOrg.members.length).to.equal(1);
          expect(cOrg.rooms.length).to.equal(1);
          smsCommon.userModel.getByPublicId(user.publicId, false, function (err, fUser) {
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
          expect(cOrg.members.length).to.equal(1);
          expect(cOrg.rooms.length).to.equal(1);
          smsCommon.userModel.getByPublicId(user.publicId, false, function (err, fUser) {
            if (err) {
              done(err);
            } else {
              expect(fUser.organizations).to.have.lengthOf(2);
              org2 = cOrg;
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
        expect(fOrgs).to.have.lengthOf(2);
        done();
      }
    });
  });

  it('getByIdDepth()', function (done) {
    smsCommon.organizationModel.getByIdDepth(org._id, function (err, fOrg) {
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

  it('safePrint()', function () {
    const result = org.safePrint(true);
    expect(result.publicId.length).to.equal(25);
    expect(result.name).to.equal(organizationFixture.organization.name);
    expect(result.members.length).to.equal(1);
    expect(result.owner._id).to.be.undefined;
    expect(result.creator._id).to.be.undefined;
    /*
    result.members.forEach(function (member) {
      expect(member._id).to.be.undefined;
      expect(member.organizations).to.be.undefined;
    });
    */
  });

  it('safePrint()', function () {
    const result = org.safePrint(false);
    expect(result.publicId.length).to.equal(25);
    expect(result.name).to.equal(organizationFixture.organization.name);
    expect(result.members).to.be.undefined;
    expect(result.owner._id).to.be.undefined;
    expect(result.creator._id).to.be.undefined;
  });

  it('inviteUser()', function (done) {
    org.inviteUser(user2, function (err) {
      if (err) {
        done(err);
      } else {
        expect(org.members).to.have.lengthOf(2);
        expect(user2.organizations).to.have.lengthOf(1);
        done();
      }
    });
  });

  it('kickUser()', function (done) {
    org.kickUser(user2, function (err) {
      if (err) {
        done(err);
      } else {
        expect(org.members).to.have.lengthOf(1);
        expect(user2.organizations).to.have.lengthOf(0);
        done();
      }
    });
  });

  it('destroy()', function (done) {
    org.destroy(function (err) {
      if (err) {
        done(err);
      } else {
        smsCommon.userModel.getByPublicId(user.publicId, true, function (err, fUser) {
          if (err) {
            done(err);
          } else {
            expect(fUser.organizations).to.have.lengthOf(1);
            expect(fUser.organizations[0].publicId).to.equal(org2.publicId);
            done();
          }
        });
      }
    });
  });
});
