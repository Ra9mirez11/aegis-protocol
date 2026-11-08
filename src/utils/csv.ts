import type { TokenHolding, NetworkConfig } from '@/types';

interface TaxLossRecord {
  date: string;
  tokenSymbol: string;
  tokenName: string;
  contractAddress: string;
  tokenType: string;
  balance: number;
  originalInvestmentUsd: number;
  currentValueUsd: number;
  realizedLossUsd: number;
  txHash: string;
  network: string;
  action: string;
}

export interface TaxExportRow {
  token: TokenHolding;
  txHash: string;
  action: string;
  realizedLoss: number;
}

export function sanitizeCsvCell(val: string): string {
  let safe = val;
  if (/^[=+\-@\t\r]/.test(safe)) {
    safe = "'" + safe;
  }
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function generateTaxLossCSV(
  rows: TaxExportRow[],
  network: NetworkConfig
): string {
  const records: TaxLossRecord[] = rows.map((r) => {
    const t = r.token;
    return {
      date: new Date().toISOString().split('T')[0],
      tokenSymbol: t.symbol,
      tokenName: t.name,
      contractAddress: t.contractAddress,
      tokenType: t.isDead ? 'Dead/Scam (No Liquidity)' : 'Dust (<$1.00)',
      balance: t.balance,
      originalInvestmentUsd: t.originalInvestmentUsd || 0,
      currentValueUsd: t.valueUsd,
      realizedLossUsd: r.realizedLoss,
      txHash: r.txHash,
      network: network.name,
      action: r.action,
    };
  });

  const headers = [
    'Date',
    'Token Symbol',
    'Token Name',
    'Contract Address',
    'Token Type',
    'Balance',
    'Original Investment (USD)',
    'Current Value (USD)',
    'Realized Loss (USD)',
    'Transaction Hash',
    'Network',
    'Action',
  ];

  const csvRows = records.map((r) =>
    [
      r.date,
      sanitizeCsvCell(r.tokenSymbol),
      sanitizeCsvCell(r.tokenName),
      sanitizeCsvCell(r.contractAddress),
      sanitizeCsvCell(r.tokenType),
      r.balance.toString(),
      r.originalInvestmentUsd.toFixed(2),
      r.currentValueUsd.toFixed(2),
      r.realizedLossUsd.toFixed(2),
      r.txHash,
      sanitizeCsvCell(r.network),
      sanitizeCsvCell(r.action),
    ].join(',')
  );

  const csv = [headers.join(','), ...csvRows].join('\n');
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
