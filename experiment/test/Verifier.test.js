const Verifier = artifacts.require("Verifier");

function b(s) {
  return `0x${s}`;
}

function getTxFixture(path) {
  const fixture = require(path);
  const modifiedEntries = Object.entries(fixture).map(([k, v]) => [k, b(v)]);
  return Object.fromEntries(modifiedEntries);
}

function getData(fixture) {
  return [
    fixture.version,
    fixture.vin,
    fixture.vout,
    fixture.locktime
  ];
}

const ONE_INPUT_3_OUTPUTS = getTxFixture("./tx-fixtures/1-input-3-outputs-2-last-p2pkh.json")
const ONE_INPUT_2_OUTPUTS = getTxFixture("./tx-fixtures/1-input-2-outputs-first-p2pkh.json")

contract('Verifier', (accounts) => {
  let instance;
  before(async () => {
    instance = await Verifier.new();
  });

  describe('#verifyTxRaw', async () => {
    it('should return true on a valid txid', async () => {
      const tx = ONE_INPUT_2_OUTPUTS;
      const actual = await instance.verifyTxRaw.call(...getData(tx), tx.txid);
      assert.equal(actual, true);
    });

    it('should return false on a invalid txid', async () => {
      const tx = ONE_INPUT_2_OUTPUTS;
      const id = b("0000000000000000000000000000000000000000000000000000000000000000");
      const actual = await instance.verifyTxRaw.call(...getData(tx), id);
      assert.equal(actual, false);
    });
  });

  describe('#extractNumOutputs', async () => {
    const vout = ONE_INPUT_3_OUTPUTS.vout;
    it('should return the correct number of outputs', async () => {
      assert.equal(await instance.extractNumOutputs(vout), 3);
    });
  });

  describe('#verifyVoutIsValueTransfer', async () => {
    const {vout} = ONE_INPUT_2_OUTPUTS;
    it('should return true when the tx is a value transfer with the exact amount and recipient', async () => {
      const amount = 4742166692845;
      const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
      const actual = await instance.verifyVoutIsValueTransfer.call(vout, amount, recipient);
      assert.equal(actual, true);
    });

    it('should return false when the amount is wrong', async () => {
      const amount = 4;
      const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
      const actual = await instance.verifyVoutIsValueTransfer.call(vout, amount, recipient);
      assert.equal(actual, false);
    });

    it('should return false when the recipient is wrong', async () => {
      const amount = 4742166692845;
      const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E900");
      const actual = await instance.verifyVoutIsValueTransfer.call(vout, amount, recipient);
      assert.equal(actual, false);
    });

    it('should return true when the transfer occurs on an output other than the first', async () => {
      const voutMultiOutput = ONE_INPUT_3_OUTPUTS.vout;
      const amount = 455638444049;
      const recipient = b("43849383122EBB8A28268A89700C9F723663B5B8");
      const actual = await instance.verifyVoutIsValueTransfer.call(voutMultiOutput, amount, recipient);
      assert.equal(actual, true);
    });
  });

  describe('#verifyTx', async () => {
    it('should return true when everything is valid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = tx.txid;
        const amount = 4742166692845;
        const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const actual = await instance.verifyTx.call(...getData(tx), amount, recipient, id);
        assert.equal(actual, true);
    });

    it('should return false when txid is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = b("1111111111111111111111111111111111111111111111111111111111111111");
        const amount = 4742166692845;
        const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const actual = await instance.verifyTx.call(...getData(tx), amount, recipient, id);
        assert.equal(actual, false);
    });

    it('should return false when receiver is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = tx.txid;
        const amount = 4742166692845;
        const recipient = b("0000000000000000000000000000000000000000");
        const actual = await instance.verifyTx.call(...getData(tx), amount, recipient, id);
        assert.equal(actual, false);
    });

    it('should return false when amount is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = tx.txid;
        const amount = 123456789;
        const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const actual = await instance.verifyTx.call(...getData(tx), amount, recipient, id);
        assert.equal(actual, false);
    });
  });
});
