const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { Account, Keypair, Networks, rpc, StrKey, TransactionBuilder, xdr } = require('@stellar/stellar-sdk');
const { prepareTransaction, signTransaction } = require('../dist/stellarv2/wallet/transaction');
const { createPrivateKeySigner } = require('../dist/stellarv2');

const source = Keypair.random();
const context = {
  contractAddress: StrKey.encodeContract(Buffer.alloc(32, 1)),
  network: { network: 'TESTNET', networkPassphrase: Networks.TESTNET },
};

afterEach(() => mock.restoreAll());

test('prepares contract arguments and signs/decodes the resulting XDR offline', async () => {
  mock.method(rpc.Server.prototype, 'getAccount', async () => new Account(source.publicKey(), '1'));
  let simulated;
  mock.method(rpc.Server.prototype, 'simulateTransaction', async transaction => {
    simulated = transaction;
    return {
      transactionData: { getFootprint: () => new xdr.LedgerFootprint({ readOnly: [], readWrite: [xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId: source.xdrPublicKey() }))] }) },
    };
  });
  mock.method(rpc.Server.prototype, 'prepareTransaction', async transaction => transaction);

  const response = await prepareTransaction(context, source.publicKey(), {
    method: 'compatibility',
    args: [
      { value: source.publicKey(), type: 'address' },
      { value: 3, type: 'u32' },
      { value: true, type: 'bool' },
      { value: [{ value: 'hello', type: 'symbol' }, { value: 4n, type: 'i128' }, { value: false, type: 'bool' }], type: 'vec' },
      { value: null, type: 'vec' },
    ],
  });
  assert.equal(response.isSuccess, true);
  assert.equal(response.isReadOnly, false);
  const operation = simulated.operations[0];
  assert.equal(operation.type, 'invokeHostFunction');
  const args = operation.func.invokeContract().args();
  assert.deepEqual(args.map(arg => arg.switch().name), ['scvAddress', 'scvU32', 'scvBool', 'scvVec', 'scvVoid']);
  assert.deepEqual(args[3].vec().map(arg => arg.switch().name), ['scvSymbol', 'scvI128', 'scvBool']);

  for (const signed of [
    (await signTransaction(context, response.result, source.secret())).toXDR(),
    await createPrivateKeySigner(source.secret(), Networks.TESTNET)(response.result),
  ]) {
    const decoded = TransactionBuilder.fromXDR(signed, Networks.TESTNET);
    assert.deepEqual(decoded.hash(), simulated.hash());
    assert.equal(source.verify(decoded.hash(), decoded.signatures[0].signature()), true);
  }
});

test('rejects unsupported vector element types before simulation', async () => {
  mock.method(rpc.Server.prototype, 'getAccount', async () => new Account(source.publicKey(), '1'));
  const simulate = mock.method(rpc.Server.prototype, 'simulateTransaction');
  await assert.rejects(prepareTransaction(context, source.publicKey(), {
    method: 'compatibility', args: [{ value: [{ value: 'x', type: 'unsupported' }], type: 'vec' }],
  }), /Unsupported contract argument type/);
  assert.equal(simulate.mock.callCount(), 0);
});
