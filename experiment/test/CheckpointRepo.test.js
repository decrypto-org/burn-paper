const CheckpointRepo = artifacts.require("CheckpointRepo");

const {b, assertReverts} = require('./utils');

contract('CheckpointRepo', (accounts) => {
  describe('#vote', async () => {
    describe('for a 4 member federation', async () => {
      let instance, validlyVote;
      const firstMMR = b('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      const secondMMR = b('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
      beforeEach(async () => {
        instance = await CheckpointRepo.new(accounts.slice(0, 4));
        validlyVote = async (mmr) => {
          for (let i = 0; i < 3; ++i) {
            await instance.vote(mmr, { from: accounts[i] });
          }
        };
      });

      it('should not set an mmr voted without majority', async () => {
        await instance.vote(firstMMR, { from: accounts[0] });
        assert.notEqual(await instance.approvedMMR(), firstMMR);
      });

      it('should set an mmr voted with a 3 of 4 majority', async () => {
        await validlyVote(firstMMR);
        assert.equal(await instance.approvedMMR(), firstMMR);
      });

      it('should not set an mmr voted by non-federation members with the correct number of votes', async () => {
        for (let i = 0; i < 3; ++i) {
          await assertReverts(instance.vote(firstMMR, { from: accounts[accounts.length - 1 - i] }));
        }
        assert.notEqual(await instance.approvedMMR(), firstMMR);
      });

      it('should not allow a federation member obstruct an otherwise existing majority', async () => {
        await instance.vote(firstMMR, { from: accounts[0] });
        await instance.vote(b('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'), { from: accounts[1] });
        for (let i = 2; i < 4; ++i) {
          await instance.vote(firstMMR, { from: accounts[i] });
        }
        assert.equal(await instance.approvedMMR(), firstMMR);
      });

      it('should not allow a federation member to double-vote', async () => {
        await instance.vote(firstMMR, { from: accounts[0] });
        for (let i = 1; i < 4; ++i) { // TODO: should be 3
          assertReverts(instance.vote(firstMMR, { from: accounts[0] }));
        }
        assert.notEqual(await instance.approvedMMR(), firstMMR);
      });


      it("should not count a round's votes towards the next", async () => {
        await instance.vote(secondMMR, { from: accounts[0] });
        await validlyVote(firstMMR);
        for (let i = 1; i < 3; ++i) {
          instance.vote(secondMMR, { from: accounts[i] });
        }
        assert.notEqual(await instance.approvedMMR(), secondMMR);
      });

      describe('when an mmr has already been voted successfully', async () => {
        beforeEach(async () => {
          await validlyVote(firstMMR)
        });

        it('should change to something else when voted by the majority', async () => {
          await validlyVote(secondMMR);
          assert.equal(await instance.approvedMMR(), secondMMR);
        });

        it('should be able to revert to that mmr after having voted something else', async () => {
          await validlyVote(secondMMR);
          await validlyVote(firstMMR);
          assert.equal(await instance.approvedMMR(), firstMMR);
        });

        it('should require the full federation votes again in order to revert to that mmr', async () => {
          await validlyVote(secondMMR);
          await instance.vote(firstMMR, { from: accounts[0] });
          assert.notEqual(await instance.approvedMMR(), firstMMR);
        });
      });
    });

    it('should work for a 2 member federation', async () => {
      const instance = await CheckpointRepo.new(accounts.slice(0, 2));
      const mmr = b('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      await instance.vote(mmr, { from: accounts[0] });
      await instance.vote(mmr, { from: accounts[1] });
      assert.equal(await instance.approvedMMR(), mmr);
    });
  });
});
