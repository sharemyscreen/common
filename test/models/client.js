const smsCommon = require('../../');
const expect = require('chai').expect;
const clientFixture = require('../fixtures/models/client.json');

var client;

describe('Testing Client model', function () {
  it('createNew()', function (done) {
    smsCommon.clientModel.createNew(clientFixture.client1.name, function (err, cClient) {
      if (err) {
        done(err);
      }	else {
        expect(cClient.name).to.equal(clientFixture.client1.name);
        expect(cClient.key).to.not.be.null;
        expect(cClient.secret).to.not.be.null;
        expect(cClient.trusted).to.be.true;
        client = cClient;
        done();
      }
    });
  });

  it('createFixClient()', function (done) {
    smsCommon.clientModel.createFix(clientFixture.client2.name,
      clientFixture.client2.key,
      clientFixture.client2.secret,
      function (err, cClient) {
        if (err) {
          done(err);
        }	else {
          expect(cClient.name).to.equal(clientFixture.client2.name);
          expect(cClient.key).to.equal(clientFixture.client2.key);
          expect(cClient.secret).to.equal(clientFixture.client2.secret);
          expect(cClient.trusted).to.be.true;
          client = cClient;
          done();
        }
      });
  });

  it('getAll()', function (done) {
    smsCommon.clientModel.getAll(function (err, fClients) {
      if (err) {
        done(err);
      } else {
        expect(fClients).to.be.an('array');
        expect(fClients).to.have.lengthOf(3);
        done();
      }
    });
  });

  it('getByKey()', function (done) {
    smsCommon.clientModel.getByKey(client.key, function (err, fClient) {
      if (err) {
        done(err);
      } else {
        expect(fClient).to.not.be.null;
        expect(fClient._id).to.eql(client._id);
        done();
      }
    });
  });

  it('getByCredential()', function (done) {
    smsCommon.clientModel.getByCredential(client.key, client.secret, function (err, fClient) {
      if (err) {
        done(err);
      } else {
        expect(fClient).to.not.be.null;
        expect(fClient._id).to.eql(client._id);
        done();
      }
    });
  });

  it('getByName()', function (done) {
    smsCommon.clientModel.getByName(client.name, function (err, fClient) {
      if (err) {
        done(err);
      } else {
        expect(fClient).to.not.be.null;
        expect(fClient._id).to.eql(client._id);
        done();
      }
    });
  });

  it('trust()', function (done) {
    client.trust(function (err) {
      if (err) {
        done(err);
      } else {
        expect(client.trusted).to.be.true;
        done();
      }
    });
  });

  it('safePrint()', function () {
    const result = client.safePrint();

    expect(result).to.not.be.null;
    expect(result).to.be.an('object');
    expect(result._id).to.be.undefined;
    expect(result.__v).to.be.undefined;
    expect(result.updatedAt).to.be.undefined;
  });
});
