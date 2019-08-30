const Crosschain = artifacts.require("CrosschainMock");

const ZERO_HASH = '0x00000000000000000000000000000000',
      ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const {b, getTxFixture, txParamsObject, assertReverts} = require("./utils");
const ONE_INPUT_2_OUTPUTS = getTxFixture("./tx-fixtures/1-input-2-outputs-first-p2pkh.json")
const ALL_ZEROS_TX = getTxFixture("./tx-fixtures/all-zeros.json")

contract('Crosschain', ([firstAccount, ..._]) => {
  let instance;
  beforeEach(async () => {
    instance = await Crosschain.new(b("b68a591985b945bdb9b54e00fe441373c222256ba4f7b358f39ee96d8800553c"));
  });

  describe('#submitEventProof', async () => {
    const tx = txParamsObject(ONE_INPUT_2_OUTPUTS);
    const validEvent = {
      amount: 4742166692845,
      txID: ONE_INPUT_2_OUTPUTS.txid,
      receivingPKH: b("10DA3170F451F152ADA3E4DE2B2E457CBCC9E90A")
    };
    const NONE = '0x00', LEFT = '0x01', RIGHT = '0x02';
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
      },
      blockConnection: {
        hashes: [
          "f5e1336b9857ced01bfe1e9c5e991c158bfb1a3809c921f2c77b55cad78ed478",
          "83a4e809e0dab38c5ae30547cdbdedac2149af7f125d3bf5e6ee3a1e5b47bd21",
          "3e427d953bcd08967a761a86ccfdb32797b51b3865d0ed4984291f91119f23ba",
          "2e180d86a0fbb9f53fc9d5b58a9963a8ec49f3fa51bb7c14f51ff0757c069a24",
          "3115474d295df26c3a4042acc97194067fb0af08e400302f97c79899df2c29d2",
          "f5dad1876af83184f6520e27c362f201f2974644c4a86862ea5ef2e0e3ddbe1f",
          "d341220afbeef460f517ca118c27444de47b89c878eb3ec9190f43eba7faeaa5",
          "c54f9f3e0ec55df95e59d00ed016c83ffc6548f6d606ed8f99bc7d0c669d93df",
          "f2e4ca63604f53fcd44e68ef0619aee613e572205fd9c1994eac5677445417ee",
        ].map(b),
        sides: [ NONE, RIGHT, RIGHT, RIGHT, LEFT, RIGHT, LEFT, RIGHT, RIGHT ]
      }
    };
    const invalidProofBecauseOfTransaction = {...validProof, transaction: txParamsObject(ALL_ZEROS_TX)};
    const invalidProofBecauseOfTxInclusion = {...validProof, txInclusion: {...validProof.txInclusion, txIDRoot: ZERO_HASH}};
    const invalidProofBecauseOfBlockConnection = {
      ...validProof,
      blockConnection: {hashes: [ZERO_HASH], sides: [NONE]}
    };
    const invalidEventBecauseOfAmount = {...validEvent, amount: 123};

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

    it('does not save an event where the amount is wrong', async () => {
      await assertDoesNotSave(invalidEventBecauseOfAmount, validProof);
    });

    it('does not save an event with an proof with wrong .transaction', async () => {
      await assertDoesNotSave(validEvent, invalidProofBecauseOfTransaction);
    });
    
    it('does not save an event with a proof with wrong transaction inclusion', async () => {
      await assertDoesNotSave(validEvent, invalidProofBecauseOfTxInclusion);
    });

    it('does not save an event with a proof with wrong block connection', async () => {
      await assertDoesNotSave(validEvent, invalidProofBecauseOfBlockConnection);
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
