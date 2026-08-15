export const NIVEIS_ACESSO = {
  USUARIO: 10,
  ADMIN: 100,
} as const;

export type NivelAcesso = keyof typeof NIVEIS_ACESSO;

export const NIVEIS_VALIDOS = Object.keys(NIVEIS_ACESSO) as NivelAcesso[];

export function pesoDoNivel(nivel: string): number | undefined {
  return NIVEIS_ACESSO[nivel as NivelAcesso];
}

export function nivelAtende(
  nivelUsuario: string,
  nivelMinimo: string,
): boolean {
  const pesoUsuario = pesoDoNivel(nivelUsuario);
  const pesoMinimo = pesoDoNivel(nivelMinimo);

  if (pesoUsuario === undefined || pesoMinimo === undefined) return false;

  return pesoUsuario >= pesoMinimo;
}
