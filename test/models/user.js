const smsCommon = require('../../');
const expect = require('chai').expect;
const userFixture = require('../fixtures/models/user.json');

describe('Testing User model', function () {
  it('Should create an user using password', function (done) {
    smsCommon.userModel.createNewPassword(userFixture.password.email,
      userFixture.password.password,
      userFixture.password.firstName,
      userFixture.password.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        } else {
          expect(cUser.publicId).to.not.be.null;
          expect(cUser.publicId.length).to.equal(25);
          expect(cUser.email).to.equal(userFixture.password.email);
          expect(cUser.password).to.not.equal(userFixture.password.password);
          expect(cUser.firstName).to.equal(userFixture.password.firstName);
          expect(cUser.lastName).to.equal(userFixture.password.lastName);
          expect(cUser.organizations.length).to.equal(0);
          done();
        }
      });
  });
});
