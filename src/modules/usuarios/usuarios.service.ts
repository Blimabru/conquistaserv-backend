import {
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { PaginateService } from 'src/shared/services/paginate.service';
import { AtualizaUsuarioDto } from './dto/atualiza-usuario.dto';
import { CriaUsuarioDto } from './dto/cria-usuario.dto';
import * as bcrypt from 'bcryptjs';
import { equals } from 'class-validator';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async cria(data: CriaUsuarioDto): Promise<any> {
    data.senha = await this.hashDado(data.senha);

    await this._emailExiste(data);
    await this._usuarioExiste(data);

    const usuario = this.prismaService.usuario.create({
      data,
    });

    return usuario;
  }

  async buscaTodos(
    pagina: number,
    itensPorPagina: number,
    busca: string,
    filtro?: string[],
    valor?: string[],
  ) {
    try {
      const querys = {};

      if (filtro && valor) {
        filtro.forEach((filtro, index) => {
          querys[filtro] = {
            equals: valor[index],
          };
        });
      }

      if (pagina && itensPorPagina && querys) {
        return this.paginateService.paginate({
          module: 'usuario',
          busca,
          pagina,
          itensPorPagina,
          querys,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao listar usuários. ${error.message}`,
      );
    }
  }

  async buscaPorLogin(login: string) {
    return await this.prismaService.usuario.findUnique({
      where: {
        login,
      },
      select: {
        id: true,
        login: true,
        email: true,
        senha: true,
        nivel: true,
        situacao: true,
        refreshToken: true,
      },
    });
  }

  async buscaPorId(id: string) {
    const usuario = await this.prismaService.usuario.findUnique({
      where: {
        id,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return usuario;
  }

  async atualiza(id: string, data: AtualizaUsuarioDto) {
    const usuarioExists = await this.prismaService.usuario.findUnique({
      where: {
        id,
      },
    });

    if (!usuarioExists) {
      throw new NotFoundException('Usuario não existe');
    }

    if (data.email && usuarioExists.email !== data.email) {
      await this._emailExiste(data);
    }

    if (data.login && usuarioExists.login !== data.login) {
      await this._usuarioExiste(data);
    }

    if (data.senha) {
      data.senha = await this.hashDado(data.senha);
    }

    await this.prismaService.usuario.update({
      data,
      where: {
        id,
      },
    });
  }

  async deleta(id: string) {
    const usuarioExists = await this.prismaService.usuario.findUnique({
      where: {
        id,
      },
    });

    if (!usuarioExists) {
      throw new NotFoundException('usuario não existe!');
    }

    await this.prismaService.usuario.delete({
      where: {
        id,
      },
    });
  }

  async hashDado(rawData: string) {
    const SALT = bcrypt.genSaltSync();
    return bcrypt.hashSync(rawData, SALT);
  }

  async comparaDados(rawData: string, hash: string) {
    return bcrypt.compareSync(rawData, hash);
  }

  private async _usuarioExiste(
    data: CriaUsuarioDto | AtualizaUsuarioDto,
  ): Promise<CriaUsuarioDto> {
    const usuario = await this.prismaService.usuario.findFirst({
      where: {
        login: data.login,
      },
    });

    if (usuario) {
      throw new ConflictException(
        'Esse login de usuário já existe na base de dados',
      );
    }

    return usuario;
  }

  private async _emailExiste(
    data: CriaUsuarioDto | AtualizaUsuarioDto,
  ): Promise<CriaUsuarioDto> {
    const emailExiste = await this.prismaService.usuario.findFirst({
      where: {
        email: data.email,
      },
    });

    if (emailExiste) {
      throw new ConflictException('Esse e-mail já existe na base de dados');
    }

    return emailExiste;
  }
}
