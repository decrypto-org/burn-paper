const CheckpointRepo = artifacts.require("CheckpointRepo");

contract('CheckpointRepo', (accounts) => {
  let instance;
  before(async () => {
    instance = await CheckpointRepo.new();
  });

  describe('#vote', async () => {
    it('should set the approved mmr', async () => {
        await instance.vote('0x000000000000000000196a8f4398bebf91cb93dae4f6811e730f663aa35de169');
        const actual = await instance.approvedMMR();
        assert.equal(actual, '0x000000000000000000196a8f4398bebf91cb93dae4f6811e730f663aa35de169', "value should be the one we set");
    });
  });
});
