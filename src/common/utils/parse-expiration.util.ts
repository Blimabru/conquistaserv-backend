export function parseExpirationToMs(expiration: string): number {
  const match = /^(\d+)s$/.exec(expiration ?? '');

  if (!match) {
    throw new Error(
      `Formato de expiração inválido: "${expiration}". Use o formato "<segundos>s" (ex: "604800s").`,
    );
  }

  return Number(match[1]) * 1000;
}
