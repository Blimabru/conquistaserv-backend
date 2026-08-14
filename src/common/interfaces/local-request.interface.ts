import { Usuario } from '../types/usuario.type';

export interface LocalRequest extends Express.Request {
  user: Usuario;
}
