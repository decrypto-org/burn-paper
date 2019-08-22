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
    const tx = txParamsObject(ONE_INPUT_2_OUTPUTS);
    const validEvent = {
      amount: 4742166692845,
      txID: ONE_INPUT_2_OUTPUTS.txid,
      receivingPKH: b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A")
    };
    const validProof = {
      transaction: tx,
      txInclusion: {
        txIDRoot: b("5afc459131783935b0a2174dbc11f19b504f54070780658b33d589d0234707fc"),
        txIndex: 1,
        hashes: [
          "b9a3a95c4ad6c2c9de8af123c3407a2614c7657eafaf6b19b11c4523ebad4b25",
          "34fd1280997cdd3c395b507ac1b9a5aedfa67768ca9e6adbb19e7c863c061a35",
          "53cc48a5416bf73699e90309431aa4c60e5337b7d01821e67ab0da4b6ad0fa72"
        ].map(b)
      }
    };
    const invalidProofBecauseTx = {...validProof, transaction: txParamsObject(ALL_ZEROS_TX)};
    const invalidProofBecauseTxInclusion = {...validProof, txInclusion: {...validProof.txInclusion, txIDRoot: ZERO_HASH}};

    async function assertSaves(event, proof) {
      await instance.submitEventProof(event, proof);
      assert.ok(await instance.eventExists(event));
    }
    async function assertDoesNotSave(event, proof) {
      await assertReverts(async () => {
        await instance.submitEventProof(event, proof);
      });
      assert.equal(await instance.eventExists(event), false);
    }

    it('saves a valid event', async () => {
      await assertSaves(validEvent, validProof);
    });

    it('does not save an event with an proof with wrong .transaction', async () => {
      await assertDoesNotSave(validEvent, invalidProofBecauseTx);
    });
    
    it('does not save an event with a proof with wrong transaction inclusion', async () => {
      await assertDoesNotSave(validEvent, invalidProofBecauseTxInclusion);
    });

    it('does not save an invalid event', async () => {
        const zeroProof = {transaction: txParamsObject(ALL_ZEROS_TX)};
        const zeroEvent = {amount: 1, txID: ZERO_HASH, receivingPKH: ZERO_HASH};
        await assertDoesNotSave(zeroEvent, zeroProof);
    });

    it('does not remember an event which was never submitted with a proof', async () => {
        const event = {amount: 1, txID: ZERO_HASH, receivingPKH: ZERO_HASH};
        assert.ok(!(await instance.eventExists(event)));
    });
  });
});
