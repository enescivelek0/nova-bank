/** Nova Bank EFT banka kodu */
export const NOVA_BANK_CODE = "00777";

const letterValue = (ch: string) => (ch.charCodeAt(0) - 55).toString();

function mod97(numeric: string): number {
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder;
}

function toNumeric(value: string) {
  return value.replace(/[A-Z]/g, letterValue);
}

export function normalizeIban(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** TR IBAN üretir: TR + 2 kontrol + 5 banka kodu + 1 rezerv + 16 hesap no */
export function makeTrIban(bankCode: string, accountNo: string) {
  const bban = `${bankCode.padStart(5, "0")}0${accountNo.padStart(16, "0")}`;
  const check = 98 - mod97(toNumeric(`${bban}TR00`));
  return `TR${String(check).padStart(2, "0")}${bban}`;
}

export function isValidTrIban(value: string) {
  const iban = normalizeIban(value);
  if (!/^TR\d{24}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  return mod97(toNumeric(rearranged)) === 1;
}

export function formatIban(value: string) {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();
}

export function ibanBankCode(value: string) {
  return normalizeIban(value).slice(4, 9);
}

export function isNovaIban(value: string) {
  return ibanBankCode(value) === NOVA_BANK_CODE;
}
