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
    it('should shart with zero balance', async () => {
      assert.equal(await instance.balanceOf(firstAccount), 0);
    });
  });

  const VALID_BURN = getTxFixture("./tx-fixtures/valid-burn.json");

  describe('#claim', async () => {
    const submitClaim = async (claimer) => {
      const NONE = '0x00';
      const tx = txParamsObject(VALID_BURN);
      const txid = b("b744d63085d1453839605948430215f3b9d0d6254bc10f233f4f3d9987b4c95a");
      const mmrRoot = b("46e3cbba5a18d914348185b15b068397dbee4dcb03ded98bf1723c7436bc140d");
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
        receivingPKH: b("bbb919d2f5f3d8e002221792590a8994cbb616da")
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
