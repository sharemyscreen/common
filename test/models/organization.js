const smsCommon = require('../../');
const expect = require('chai').expect;
const organizationFixture = require('../fixtures/models/organization.json');

var user;

describe('Testing Organization model', function () {
  before(function (done) {
    smsCommon.userModel.createNewPassword(organizationFixture.user.email,
      organizationFixture.user.password,
      organizationFixture.user.firstName,
      organizationFixture.user.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        }	else {
          user = cUser;
          done();
        }
      });
  });

  it('Should create an organization', function (done) {
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
          done();
        }
      });
  });
});
