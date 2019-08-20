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

function txParamsObject(fixture) {
  return {
    version: fixture.version,
    vin: fixture.vin,
    vout: fixture.vout,
    locktime: fixture.locktime
  };
}

module.exports = {b, getTxFixture, txParams, txParamsObject};