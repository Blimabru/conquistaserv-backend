import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaginateService } from 'src/shared/services/paginate.service';
import { SecretariasController } from './secretarias.controller';
import { SecretariasService } from './secretarias.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SecretariasController],
  providers: [SecretariasService, PaginateService],
  exports: [SecretariasService],
})
export class SecretariasModule {}
