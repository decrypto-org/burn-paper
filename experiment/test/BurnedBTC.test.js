const BurnedBTC = artifacts.require("BurnedBTC");
const CheckpointRepo = artifacts.require("CheckpointRepo");
const { b, getTxFixture, txParamsObject, assertReverts } = require("./utils");

const ZERO_HASH = '0x00000000000000000000000000000000',
      ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('BurnedBTC', ([firstAccount, ..._]) => {
  let checkpointRepoInstance, instance;
  beforeEach(async () => {
    checkpointRepoInstance = await CheckpointRepo.new();
    instance = await BurnedBTC.new(checkpointRepoInstance.address);
  });

  describe('#balanceOf', async () => {
    it('should start with zero balance', async () => {
      assert.equal(await instance.balanceOf(firstAccount), 0);
    });
  });

  const VALID_BURN = getTxFixture("./tx-fixtures/valid-burn.json");

  describe('#claim', async () => {
    const submitClaim = async (claimer) => {
      const NONE = '0x00';
      const tx = txParamsObject(VALID_BURN);
      const txid = b("70cc4606ef094d2429c5c65780c6049b5000e56c2ca69b8831cc3b6a8fe24cca");
      const mmrRoot = b("5be8c0d419d7c8dce32a5a35fb3be0a2756571ff8565a915bc71154b67512de0");
      await checkpointRepoInstance.vote(mmrRoot);
      const proof = {
        transaction: tx,
        txInclusion: {
          txIDRoot: txid,
          txIndex: 0,
          hashes: []
        },
        blockConnection: {
          hashes: [ mmrRoot ],
          sides: [ NONE ]
        }
      };
      const event = {
        amount: 10,
        txID: txid,
        receivingPKH: b("346753e81b93e3f1567a16f3009c7c65c768d865")
      };
      await instance.submitEventProof(event, proof);
      await instance.claim(event, claimer);
    };

    it('should credit the user for a valid burn event', async () => {
      const actualClaimer = b("de0b295669a9fd93d5f28d9ec85e40f4cb697bae");
      await submitClaim(actualClaimer);
      assert.equal(await instance.balanceOf(actualClaimer), 10);
    });

    it('should not credit a user who takes credit for someone else\'s event', async () => {
      const maliciousClaimer = b("9999999999999999999999999999999999999999");
      await assertReverts(async () => { await submitClaim(maliciousClaimer); });
      assert.equal(await instance.balanceOf(maliciousClaimer), 0);
    });

    it('should allow the claimer the get credit from one specific burn only once', async () => {
      const actualClaimer = b("de0b295669a9fd93d5f28d9ec85e40f4cb697bae");
      await submitClaim(actualClaimer);
      await assertReverts(async () => { await submitClaim(actualClaimer); });
      assert.equal(await instance.balanceOf(actualClaimer), 10);
    });

    it('should not credit a claimer with an invalid proof or event', async () => {
      const claimer = b("3333333333333333333333333333333333333333");
      const proof = {
        transaction: b("00"),
        txInclusion: { txIDRoot: ZERO_HASH, txIndex: 0, hashes: [] },
        blockConnection: { hashes: [], sides: [] }
      };
      const event = {
        amount: 100,
        txID: ZERO_HASH,
        receivingPKH: claimer,
      };
      await checkpointRepoInstance.vote(ZERO_HASH);
      await assertReverts(async () => { await instance.submitEventProof(event, proof); });
      await assertReverts(async () => { await instance.claim(event, claimer); });
      assert.equal(await instance.balanceOf(claimer), 0);
    });
  });
});
