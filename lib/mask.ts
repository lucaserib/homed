export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');

  const cpf = numbers.slice(0, 11);

  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

export function maskCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');

  const cnpj = numbers.slice(0, 14);

  return cnpj
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

export function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');

  const phone = numbers.slice(0, 11);

  if (phone.length <= 10) {
    return phone
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    return phone
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
}

export function maskCRM(value: string): string {
  const match = value.match(/^(\d+)(-?)([A-Z]*)$/);

  if (!match) return value;

  const [, numbers, , letters] = match;

  if (letters) {
    return `${numbers}-${letters}`;
  }

  return numbers;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
