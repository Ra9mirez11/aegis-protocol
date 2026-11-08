export interface AegisVaultFile {
  format: 'aegis-vault-v1';
  exportedAt: number;
  label: string;
  createdAt: number;
  encryptedData: string;
  iv: string;
  salt: string;
  shareA: string;
  inactivityDays: number;
  lastHeartbeat: number;
  beneficiaryAddress: string;
}

export function buildAegisFile(vault: {
  label: string;
  createdAt: number;
  encryptedData: string;
  iv: string;
  salt: string;
  shareA: string;
  inactivityDays: number;
  lastHeartbeat: number;
  beneficiaryAddress: string;
}): AegisVaultFile {
  return {
    format: 'aegis-vault-v1',
    exportedAt: Date.now(),
    label: vault.label,
    createdAt: vault.createdAt,
    encryptedData: vault.encryptedData,
    iv: vault.iv,
    salt: vault.salt,
    shareA: vault.shareA,
    inactivityDays: vault.inactivityDays,
    lastHeartbeat: vault.lastHeartbeat,
    beneficiaryAddress: vault.beneficiaryAddress,
  };
}

export function buildAegisFileWithLabel(vault: {
  label: string;
  createdAt: number;
  encryptedData: string;
  iv: string;
  salt: string;
  shareA: string;
  inactivityDays: number;
  lastHeartbeat: number;
  beneficiaryAddress: string;
}, labelOverride: string): AegisVaultFile {
  const file = buildAegisFile(vault);
  return { ...file, label: labelOverride };
}

export function downloadAegisFile(file: AegisVaultFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeLabel = file.label.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
  a.download = `${safeLabel || 'vault'}.aegis`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAegisFile(text: string): AegisVaultFile | null {
  try {
    const obj = JSON.parse(text);
    if (
      typeof obj.format === 'string' &&
      typeof obj.encryptedData === 'string' &&
      typeof obj.iv === 'string' &&
      typeof obj.salt === 'string' &&
      typeof obj.shareA === 'string'
    ) {
      return obj as AegisVaultFile;
    }
    return null;
  } catch {
    return null;
  }
}
