const smsCommon = require('../../');
const should = require('should');
const accessTokenFixture = require("../fixtures/models/access-token.json");

let user;
let client;

describe("Testing access_token model", function () {

	before(function (done) {

		user = new smsCommon.User(accessTokenFixture.user);

		user.save(function (err) {
			if (err) {
				done(err);
			}
			else {

				smsCommon.Client.createNew(accessTokenFixture.client.name, function (err, cClient) {
					if (err) {
						done(err);
					}
					else {
						client = cClient;
						done();
					}
				});
			}
		});
	});

	it("Should generated an access token", function (done) {

		const accessToken = new smsCommon.AccessToken({
			client: client,
			user: user,
			scopes: accessTokenFixture.token.scopes
		});

		accessToken.save(function (err) {
			if (err) {
				done(err);
			}
			else {
				accessToken.token.length.should.equal(256);

				accessToken.user._id.should.equal(user._id);

				accessToken.client._id.should.equal(client._id);
				done();
			}
		});
	})
});
