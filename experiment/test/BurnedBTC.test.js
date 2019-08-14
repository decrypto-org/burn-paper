const BurnedBTC = artifacts.require("BurnedBTC");

const ZERO_HASH = '0x00000000000000000000000000000000',
      ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('BurnedBTC', ([firstAccount, ..._]) => {
  let instance;
  beforeEach(async () => {
    instance = await BurnedBTC.new(ZERO_ADDRESS);
  });

  describe('#balanceOf', async () => {
    it('should shart with zero balance', async () => {
      assert.equal(await instance.balanceOf(firstAccount), 0);
    });
  });

  describe('#claim', async () => {
    it('should credit the user for a valid burn event', async () => {
      await instance.claim({amount: 42, txID: ZERO_HASH, receivingAddress: ZERO_HASH});
      assert.equal(await instance.balanceOf(firstAccount), 42);
    });
  });
});
