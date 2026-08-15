import { SetMetadata } from '@nestjs/common';
import { NivelAcesso } from '../constants';

export const NIVEL_MINIMO_KEY = 'nivelMinimo';

/**
 * Exige que o usuário autenticado tenha, no mínimo, o nível informado
 * (comparação por peso hierárquico, ver src/common/constants/niveis.constant.ts).
 * Pode ser aplicado na classe (controller inteiro) ou em uma rota específica.
 */
export const NivelMinimo = (nivel: NivelAcesso) =>
  SetMetadata(NIVEL_MINIMO_KEY, nivel);
