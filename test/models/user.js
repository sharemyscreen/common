const smsCommon = require('../../');
const expect = require('chai').expect;
const userFixture = require('../fixtures/models/user.json');

var tUser;
var pUser;
var faUser;
var gUser;
var org;

describe('Testing User model', function () {
  before(function (done) {
    smsCommon.userModel.createPassword(userFixture.org.user.email,
    userFixture.org.user.password,
    userFixture.org.user.firstName,
    userFixture.org.user.lastName,
    function (err, cUser) {
      if (err) {
        done(err);
      } else {
        tUser = cUser;
        smsCommon.organizationModel.createNew(userFixture.org.name, tUser, function (err, cOrg) {
          if (err) {
            done(err);
          } else {
            org = cOrg;
            done();
          }
        });
      }
    });
  });

  it('createPassword()', function (done) {
    smsCommon.userModel.createPassword(userFixture.password.email,
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
          pUser = cUser;
          done();
        }
      });
  });

  it('createFacebook()', function (done) {
    smsCommon.userModel.createFacebook(userFixture.facebook.email,
      userFixture.facebook.facebookId,
      userFixture.facebook.firstName,
      userFixture.facebook.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        } else {
          expect(cUser).to.not.be.null;
          expect(cUser.publidId).to.not.be.null;
          expect(cUser.organizations).to.have.lengthOf(0);
          faUser = cUser;
          done();
        }
      });
  });

  it('createGoogle()', function (done) {
    smsCommon.userModel.createGoogle(userFixture.google.email,
      userFixture.google.googleId,
      userFixture.google.firstName,
      userFixture.google.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        } else {
          expect(cUser).to.not.be.null;
          expect(cUser.publidId).to.not.be.null;
          expect(cUser.organizations).to.have.lengthOf(0);
          gUser = cUser;
          done();
        }
      });
  });

  it('getByPublicId()', function (done) {
    smsCommon.userModel.getByPublicId(pUser.publicId, function (err, fUser) {
      if (err) {
        done(err);
      } else {
        expect(fUser).to.not.be.null;
        expect(fUser._id).to.eql(pUser._id);
        done();
      }
    });
  });

  it('getByEmail()', function (done) {
    smsCommon.userModel.getByEmail(pUser.email, function (err, fUser) {
      if (err) {
        done(err);
      } else {
        expect(fUser).to.not.be.null;
        expect(fUser._id).to.eql(pUser._id);
        done();
      }
    });
  });

  it('getByCredential()', function (done) {
    smsCommon.userModel.getByCredential(pUser.email,
      userFixture.password.password,
      function (err, fUser) {
        if (err) {
          done(err);
        } else {
          expect(fUser).to.not.be.null;
          expect(fUser._id).to.eql(pUser._id);
          done();
        }
      });
  });

  it('getByCredential()', function (done) {
    smsCommon.userModel.getByCredential(pUser.email,
      'toto',
      function (err, fUser) {
        if (err) {
          done(err);
        } else {
          expect(fUser).to.be.false;
          done();
        }
      });
  });

  it('getByFacebookId()', function (done) {
    smsCommon.userModel.getByFacebookId(faUser.facebookId, function (err, fUser) {
      if (err) {
        done(err);
      } else {
        expect(fUser).to.not.be.null;
        expect(fUser._id).to.eql(faUser._id);
        done();
      }
    });
  });

  it('getByGoogleId()', function (done) {
    smsCommon.userModel.getByGoogleId(gUser.googleId, function (err, fUser) {
      if (err) {
        done(err);
      } else {
        expect(fUser).to.not.be.null;
        expect(fUser._id).to.eql(gUser._id);
        done();
      }
    });
  });

  it('integrateOrganization()', function (done) {
    pUser.integrateOrganization(org, function (err) {
      if (err) {
        done(err);
      } else {
        expect(pUser.organizations).to.have.lengthOf(1);
        done();
      }
    });
  });

  it('leaveOrganization()', function (done) {
    pUser.leaveOrganization(org, function (err) {
      if (err) {
        done(err);
      } else {
        expect(pUser.organizations).to.have.lengthOf(0);
        done();
      }
    });
  });

  it('safePrint()', function () {
    const result = pUser.safePrint();
    expect(result).to.not.be.undefined;
    expect(result._id).to.be.undefined;
    expect(result.publicId).to.equal(pUser.publicId);
    expect(result.email).to.equal(pUser.email);
    expect(result.password).to.be.undefined;
    expect(result.firstName).to.equal(pUser.firstName);
    expect(result.lastName).to.equal(pUser.lastName);
    expect(result.googleId).to.be.undefined;
    expect(result.facebookId).to.be.undefined;
    expect(result.organizations).to.be.an('array');
    expect(result.createdAt).to.eql(pUser.createdAt);
    expect(result.updatedAt).to.be.undefined;
  });

  it('get fullname', function (done) {
    expect(pUser.fullName).to.equal(pUser.firstName + ' ' + pUser.lastName);
    done();
  });
});
