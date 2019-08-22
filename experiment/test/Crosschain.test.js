const Crosschain = artifacts.require("Crosschain");

const ZERO_HASH = '0x00000000000000000000000000000000',
      ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const {b, getTxFixture, txParamsObject, assertReverts} = require("./utils");
const ONE_INPUT_2_OUTPUTS = getTxFixture("./tx-fixtures/1-input-2-outputs-first-p2pkh.json")
const ALL_ZEROS_TX = getTxFixture("./tx-fixtures/all-zeros.json")

contract('Crosschain', ([firstAccount, ..._]) => {
  let instance;
  beforeEach(async () => {
    instance = await Crosschain.new();
  });

  describe('#submitEventProof', async () => {
    it('saves a valid event', async () => {
        const tx = txParamsObject(ONE_INPUT_2_OUTPUTS);
        const txID = ONE_INPUT_2_OUTPUTS.txid;
        const amount = 4742166692845;
        const receivingPKH = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const event = {amount, txID, receivingPKH};
        await instance.submitEventProof(event, {transaction:tx});
        assert.ok(await instance.eventExists(event));
    });

    it('does not save an invalid event', async () => {
        const tx = txParamsObject(ALL_ZEROS_TX);
        const event = {amount: 1, txID: ZERO_HASH, receivingPKH: ZERO_HASH};
        await assertReverts(async () => {
          await instance.submitEventProof(event, {transaction: tx});
        });
        assert.equal(await instance.eventExists(event), false);
    });

    it('does not remember an event which was never submitted with a proof', async () => {
        const event = {amount: 1, txID: ZERO_HASH, receivingPKH: ZERO_HASH};
        assert.ok(!(await instance.eventExists(event)));
    });
  });
});
