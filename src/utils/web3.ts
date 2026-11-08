import type { NetworkConfig } from '@/types';

interface Eip3085Chain {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export function toHexChainId(id: number): string {
  return '0x' + id.toString(16);
}

export function toEip3085Params(net: NetworkConfig): Eip3085Chain {
  return {
    chainId: toHexChainId(net.id),
    chainName: net.name,
    nativeCurrency: { name: net.nativeName, symbol: net.symbol, decimals: 18 },
    rpcUrls: [net.rpcUrl],
    blockExplorerUrls: [net.explorerUrl],
  };
}

function getEthereum(): any | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.ethereum || null;
}

function getSolanaWallet(): any | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.solana || w.solflare || null;
}

export function hasEvmWallet(): boolean {
  return getEthereum() !== null;
}

export function hasSolanaWallet(): boolean {
  return getSolanaWallet() !== null;
}

export async function fetchNativeBalanceEvm(address: string, network: NetworkConfig): Promise<number> {
  const eth = getEthereum();
  if (eth) {
    try {
      const hexBal = await eth.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const parsed = parseInt(hexBal, 16) / 1e18;
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    } catch {
      // fall through to RPC
    }
  }
  try {
    const resp = await fetch(network.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });
    const json = await resp.json();
    if (json?.result) return parseInt(json.result, 16) / 1e18;
  } catch {
    // ignore
  }
  return 0;
}

export async function fetchNativeBalanceSolana(address: string, network: NetworkConfig): Promise<number> {
  const sol = getSolanaWallet();
  if (sol) {
    try {
      const resp = await sol.connect?.();
      const pubKey = resp?.publicKey?.toString() || address;
      const balanceLamports = await sol.connection?.getBalance?.(pubKey);
      if (balanceLamports) return balanceLamports / 1e9;
    } catch {
      // fall through to RPC
    }
  }
  try {
    const resp = await fetch(network.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });
    const json = await resp.json();
    if (json?.result?.value) return json.result.value / 1e9;
  } catch {
    // ignore
  }
  return 0;
}

export async function fetchNativeBalance(address: string, network: NetworkConfig): Promise<number> {
  if (network.isEvm) return fetchNativeBalanceEvm(address, network);
  return fetchNativeBalanceSolana(address, network);
}

export async function switchOrAddChain(network: NetworkConfig): Promise<boolean> {
  const eth = getEthereum();
  if (!eth) return false;
  const params = toEip3085Params(network);
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainId }],
    });
    return true;
  } catch (err: any) {
    if (err?.code === 4902) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [params],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

async function ensureEvmNetwork(network: NetworkConfig): Promise<void> {
  const eth = getEthereum();
  if (!eth) throw new Error('No EVM wallet found');
  const currentChainHex = await eth.request({ method: 'eth_chainId' });
  if (parseInt(currentChainHex, 16) !== network.id) {
    const switched = await switchOrAddChain(network);
    if (!switched) {
      throw new Error(`Chain mismatch: Please switch your wallet to ${network.name} before signing.`);
    }
  }
}

function toWeiHex(nativeAmount: number): string {
  const safeAmount = Math.max(0, Number.isFinite(nativeAmount) ? nativeAmount : 0);
  const gwei = BigInt(Math.round(safeAmount * 1e9));
  const wei = gwei * 1000000000n;
  return '0x' + wei.toString(16);
}

export async function sendNativeTransfer(
  from: string,
  to: string,
  nativeAmount: number,
  network: NetworkConfig
): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error('No EVM wallet found');
  await ensureEvmNetwork(network);

  if (!(nativeAmount > 0)) {
    throw new Error('Fee amount must be greater than zero.');
  }
  const expectedWei = BigInt(toWeiHex(nativeAmount));
  if (expectedWei <= 0n) {
    throw new Error('Fee amount must be greater than zero.');
  }

  const txHash: string = await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, value: toWeiHex(nativeAmount) }],
  });

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    throw new Error('Invalid transaction hash returned by wallet.');
  }

  // Verify against independent public RPC: tamper-proof fee recipient + value
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const resp = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionByHash',
          params: [txHash],
        }),
      });
      const json = await resp.json();
      const tx = json?.result;
      if (!tx) continue;

      const recipientOk = tx.to && tx.to.toLowerCase() === to.toLowerCase();
      const valueOk = BigInt(tx.value || '0x0') >= (expectedWei * 95n) / 100n;
      if (!recipientOk || !valueOk) {
        throw new Error('Security Alert: Fee transaction recipient or value mismatch detected.');
      }
      return txHash;
    } catch (err: any) {
      if (err?.message?.startsWith('Security Alert')) throw err;
      // RPC not propagated yet — retry
    }
  }

  return txHash;
}

export async function sendSolanaTransfer(
  from: string,
  to: string,
  nativeAmount: number
): Promise<string> {
  const sol = getSolanaWallet();
  if (!sol) throw new Error('No Solana wallet found');
  const lamports = Math.floor(nativeAmount * 1e9);
  const sig = await sol.signAndSendTransaction?.({
    to,
    lamports,
  });
  const signature = sig?.signature || sig?.toString();
  if (!signature || signature.length < 43) {
    throw new Error('Solana fee payment failed: Transaction was not signed or broadcast.');
  }
  return signature;
}

export async function sendFeeTransfer(
  from: string,
  to: string,
  nativeAmount: number,
  network: NetworkConfig
): Promise<string> {
  if (network.isEvm) return sendNativeTransfer(from, to, nativeAmount, network);
  return sendSolanaTransfer(from, to, nativeAmount);
}

const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';
const ADDRESS_ZERO = '0x' + '0'.repeat(40);

function encodeApproveCall(spender: string, amount: string): string {
  const spenderParam = spender.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const cleanAmount = amount.replace(/^0x/, '');
  const amountParam = cleanAmount.padStart(64, '0');
  return ERC20_APPROVE_SIGNATURE + spenderParam + amountParam;
}

export async function revokeApproval(
  tokenContract: string,
  spender: string,
  network?: NetworkConfig
): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error('No EVM wallet found');
  if (network) await ensureEvmNetwork(network);
  const accounts = await eth.request({ method: 'eth_accounts' });
  const from = accounts[0];
  if (!from) throw new Error('No connected account');

  const data = encodeApproveCall(spender, '0');
  const txHash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: tokenContract, data }],
  });
  return txHash;
}

export function isAddressZero(addr: string): boolean {
  return addr.toLowerCase() === ADDRESS_ZERO;
}
