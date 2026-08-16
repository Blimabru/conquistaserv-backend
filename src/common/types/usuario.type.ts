export type Usuario = {
  id: string;
  email: string;
  login: string;
  nivel: string;
  situacao: string;
  senha: string;
  onboardingConcluido: boolean;
  refreshToken?: string;
};
