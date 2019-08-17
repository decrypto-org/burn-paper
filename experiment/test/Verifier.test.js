const Verifier = artifacts.require("Verifier");

function b(s) {
  return `0x${s}`;
}

function getTxFixture(path) {
  const fixture = require(path);
  const modifiedEntries = Object.entries(fixture).map(([k, v]) => [k, b(v)]);
  return Object.fromEntries(modifiedEntries);
}

function txParams(fixture) {
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
      const actual = await instance.verifyTxRaw.call(...txParams(tx), tx.txid);
      assert.equal(actual, true);
    });

    it('should return false on a invalid txid', async () => {
      const tx = ONE_INPUT_2_OUTPUTS;
      const id = b("0000000000000000000000000000000000000000000000000000000000000000");
      const actual = await instance.verifyTxRaw.call(...txParams(tx), id);
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
        const actual = await instance.verifyTx.call(...txParams(tx), amount, recipient, id);
        assert.equal(actual, true);
    });

    it('should return false when txid is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = b("1111111111111111111111111111111111111111111111111111111111111111");
        const amount = 4742166692845;
        const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const actual = await instance.verifyTx.call(...txParams(tx), amount, recipient, id);
        assert.equal(actual, false);
    });

    it('should return false when receiver is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = tx.txid;
        const amount = 4742166692845;
        const recipient = b("0000000000000000000000000000000000000000");
        const actual = await instance.verifyTx.call(...txParams(tx), amount, recipient, id);
        assert.equal(actual, false);
    });

    it('should return false when amount is invalid', async () => {
        const tx = ONE_INPUT_2_OUTPUTS;
        const id = tx.txid;
        const amount = 123456789;
        const recipient = b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A");
        const actual = await instance.verifyTx.call(...txParams(tx), amount, recipient, id);
        assert.equal(actual, false);
    });
  });

  describe('#verifyTxInclusion', async () => {
    it('should return true when the inclusion proof is valid', async () => {
      const txID = ONE_INPUT_2_OUTPUTS.txid;
      const txIDRoot = b("5afc459131783935b0a2174dbc11f19b504f54070780658b33d589d0234707fc");
      const txIndex = 1;
      const proof = [
        "b9a3a95c4ad6c2c9de8af123c3407a2614c7657eafaf6b19b11c4523ebad4b25",
        "34fd1280997cdd3c395b507ac1b9a5aedfa67768ca9e6adbb19e7c863c061a35",
        "53cc48a5416bf73699e90309431aa4c60e5337b7d01821e67ab0da4b6ad0fa72"
      ].map(b);
      assert.equal(await instance.verifyTxInclusion(txID, txIDRoot, txIndex, proof), true);
    });
    it('should return false when the inclusion proof is invalid', async () => {
      const txID = ONE_INPUT_2_OUTPUTS.txid;
      const txIDRoot = b("5afc459131783935b0a2174dbc11f19b504f54070780658b33d589d0234707fc");
      const txIndex = 2;
      const proof = [
        "b9a3a95c4ad6c2c9de8af123c3407a2614c7657eafaf6b19b11c4523ebad4b25",
        "34fd1280997cdd3c395b507ac1b9a5aedfa67768ca9e6adbb19e7c863c061a35",
        "53cc48a5416bf73699e90309431aa4c60e5337b7d01821e67ab0da4b6ad0fa72"
      ].map(b);
      assert.equal(await instance.verifyTxInclusion(txID, txIDRoot, txIndex, proof), false);
    });
  });
});
