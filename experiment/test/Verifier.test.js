const Verifier = artifacts.require("Verifier");

function b(s) {
  return `0x${s}`;
}

contract('Verifier', (accounts) => {
  let instance;
  before(async () => {
    instance = await Verifier.new();
  });

  describe('#verifyTxRaw', async () => {
    it('should return true on a valid txid', async () => {
      const raw = b("0100000001253afcfa0813546f4bf7eb6a31fdf1ea23e36a255e5dd41f499b37b73a960db8000000006a47304402203e532ba8a5cb275b48765bc51a53eb64645a85382b1e4269db00ad30d09c7ba402207e3d5053e6c79028019529f33d3fd655d3ff54a919c9c1de74c87ae0b3315992012102392b10a28cc0fbc52fcfb2e9af7441839ca3014fefe30f95b0e6b14d56ef1da2feffffff02ed43291f500400001976a91410da3170f451f152ada3e4de2b2e457cbcc9e90a88ac807c814a0000000017a914fd9b7ec7c672afc42b98f7468e6ee0ca3e6f913c871da10700");
      const id = b("e9f07570343a6a49b541d4449028718c3d245a1a5d12439d3030a37dbd5026d2");
      const actual = await instance.verifyTxRaw.call(raw, id);
      assert.equal(actual, true);
    });

    it('should return false on a invalid txid', async () => {
      const raw = b("0100000001253afcfa0813546f4bf7eb6a31fdf1ea23e36a255e5dd41f499b37b73a960db8000000006a47304402203e532ba8a5cb275b48765bc51a53eb64645a85382b1e4269db00ad30d09c7ba402207e3d5053e6c79028019529f33d3fd655d3ff54a919c9c1de74c87ae0b3315992012102392b10a28cc0fbc52fcfb2e9af7441839ca3014fefe30f95b0e6b14d56ef1da2feffffff02ed43291f500400001976a91410da3170f451f152ada3e4de2b2e457cbcc9e90a88ac807c814a0000000017a914fd9b7ec7c672afc42b98f7468e6ee0ca3e6f913c871da10700");
      const id = b("e9f07570343a6a49b541d4449028718c3d245a1a5d12439d3030a37dbd5026d3");
      const actual = await instance.verifyTxRaw.call(raw, id);
      assert.equal(actual, false);
    });
  });

  describe('#verifyTx', async () => {
    it('should return true when everything is valid', async () => {
        const raw = b("0100000001253afcfa0813546f4bf7eb6a31fdf1ea23e36a255e5dd41f499b37b73a960db8000000006a47304402203e532ba8a5cb275b48765bc51a53eb64645a85382b1e4269db00ad30d09c7ba402207e3d5053e6c79028019529f33d3fd655d3ff54a919c9c1de74c87ae0b3315992012102392b10a28cc0fbc52fcfb2e9af7441839ca3014fefe30f95b0e6b14d56ef1da2feffffff02ed43291f500400001976a91410da3170f451f152ada3e4de2b2e457cbcc9e90a88ac807c814a0000000017a914fd9b7ec7c672afc42b98f7468e6ee0ca3e6f913c871da10700");
        const id = b("e9f07570343a6a49b541d4449028718c3d245a1a5d12439d3030a37dbd5026d2");
        const amount = 4742166692845;
        const recipient = "mh44VSvTxje84m6yeyBLBULUNRbkm8SEQj";
        const actual = await instance.verifyTx.call(raw, amount, recipient, id);
        assert.equal(actual, true);
    });

    it('should return false when txid is invalid', async () => {
        const raw = b("0100000001253afcfa0813546f4bf7eb6a31fdf1ea23e36a255e5dd41f499b37b73a960db8000000006a47304402203e532ba8a5cb275b48765bc51a53eb64645a85382b1e4269db00ad30d09c7ba402207e3d5053e6c79028019529f33d3fd655d3ff54a919c9c1de74c87ae0b3315992012102392b10a28cc0fbc52fcfb2e9af7441839ca3014fefe30f95b0e6b14d56ef1da2feffffff02ed43291f500400001976a91410da3170f451f152ada3e4de2b2e457cbcc9e90a88ac807c814a0000000017a914fd9b7ec7c672afc42b98f7468e6ee0ca3e6f913c871da10700");
        const id = b("e9f07570343a6a49b541d4449028718c3d245a1a5d12439d3030a37dbd5026d0");
        const amount = 4742166692845;
        const recipient = "mh44VSvTxje84m6yeyBLBULUNRbkm8SEQj";
        const actual = await instance.verifyTx.call(raw, amount, recipient, id);
        assert.equal(actual, false);
    });
  });
});
