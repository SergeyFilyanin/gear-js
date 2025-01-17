import { HexString } from '@polkadot/util/types';
import { join } from 'path';
import { readFileSync } from 'fs';
import { u8aToHex } from '@polkadot/util';

import { generateCodeHash, generateProgramId } from '../src';
import { TEST_WASM_DIR } from './config';

const pingCode = readFileSync(join(TEST_WASM_DIR, 'demo_ping.opt.wasm'));
let codeId: HexString;

describe('Generate IDs', () => {
  test('demo_ping codeHash', () => {
    codeId = generateCodeHash(pingCode);
    expect(codeId).toBe('0x4b701fedb61456cd75df8ae6348f73aa9f529f2363f9ce76398f14aba15f01d6');
  });

  test('demo_ping codeHash from u8a', () => {
    expect(generateCodeHash(Uint8Array.from(pingCode))).toBe(
      '0x4b701fedb61456cd75df8ae6348f73aa9f529f2363f9ce76398f14aba15f01d6',
    );
  });

  test('demo_ping codeHash from HexString', () => {
    expect(generateCodeHash(u8aToHex(Uint8Array.from(pingCode)))).toBe(
      '0x4b701fedb61456cd75df8ae6348f73aa9f529f2363f9ce76398f14aba15f01d6',
    );
  });

  test('demo_ping programId', () => {
    expect(generateProgramId(pingCode, '1234')).toBe(
      '0x795e9492c45292140dbc488326342afd18965992c71f76f4a237c083c960e785',
    );
  });

  test('programId using codeId', () => {
    expect(generateProgramId(codeId, '1234')).toBe(
      '0x795e9492c45292140dbc488326342afd18965992c71f76f4a237c083c960e785',
    );
  });
});
