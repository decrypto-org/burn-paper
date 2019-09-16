const BurnVerifier = artifacts.require("BurnVerifier");
const {b} = require("./utils");

const ZERO_HASH = '0x00000000000000000000000000000000',
      ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('BurnVerifier', ([firstAccount, ..._]) => {
  let instance;
  beforeEach(async () => {
    instance = await BurnVerifier.new();
  });

  describe('#verifyBurn', async () => {
    it('should return true for a valid encoding', async () => {
      const ethereumAddress = b('edfe2ce9383f11c6fb357fb684a54e9849ad74e6');
      const burnPKH = b('5caf35503a763213efc9b3991c7106444d873c8b');
      assert.equal(await instance.verifyBurn(ethereumAddress, burnPKH), true);
    });

    it('should return false for an invalid encoding', async () => {
      const ethereumAddress = b('edfe2ce9383f11c6fb357fb684a54e9849ad74e6');
      const burnPKH = ZERO_HASH;
      assert.equal(await instance.verifyBurn(ethereumAddress, burnPKH), false);
    });
  });
});
