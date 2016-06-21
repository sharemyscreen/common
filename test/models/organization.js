const smsCommon = require('../../');
const expect = require('chai').expect;
const organizationFixture = require('../fixtures/models/organization.json');

var user;
var user2;
var org;

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
          org = cOrg;
          done();
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

  it('getByPublicId()', function (done) {
    smsCommon.organizationModel.getByPublicId(org.publicId, function (err, fOrg) {
      if (err) {
        done(err);
      } else {
        expect(fOrg).to.not.be.null;
        expect(fOrg._id.toString()).to.equal(org._id.toString());
        done();
      }
    });
  });

  it('inviteUser()', function (done) {
    org.inviteUser(user2, function (err) {
      if (err) {
        done(err);
      } else {
        expect(org.members).to.have.lengthOf(2);
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
        done();
      }
    });
  });
});
