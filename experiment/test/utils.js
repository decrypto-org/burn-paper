function b(s) {
  return `0x${s}`;
}

function rb(s) {
  return b(
    s
      .split('')
      .map((_, i, arr) => 2*i < arr.length ? arr.slice(2*i, 2*i+2).join('') : '')
      .reverse()
      .join('')
  );
}

function getTxFixture(path) {
  const fixture = require(path);
  const modifiedEntries = Object.entries(fixture).map(([k, v]) => [k, b(v)]);
  return Object.fromEntries(modifiedEntries);
}

function getMMRFixture(path) {
  const LEFT = '0x01', RIGHT = '0x02';
  const {txIDRoot, mmrRoot, proof} = require(path);
  const hashes = proof.map(x => b(x[0]));
  const sides = proof.map(x => x[1] === "LEFT" ? LEFT : RIGHT);
  return {txIDRoot: b(txIDRoot), mmrRoot: b(mmrRoot), hashes, sides};
}

function txParams(fixture) {
  return [
    fixture.version,
    fixture.vin,
    fixture.vout,
    fixture.locktime
  ];
}

function txParamsObject(fixture) {
  return {
    version: fixture.version,
    vin: fixture.vin,
    vout: fixture.vout,
    locktime: fixture.locktime
  };
}

const assertReverts = require("assert").rejects;

function logGasUsed(what, result) {
  console.log(what, 'used', result.receipt.gasUsed, 'gas');
}

module.exports = {b, rb, getTxFixture, getMMRFixture, txParams, txParamsObject, assertReverts, logGasUsed};
