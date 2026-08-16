import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaginateService } from 'src/shared/services/paginate.service';
import { CanaisController } from './canais.controller';
import { CanaisService } from './canais.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CanaisController],
  providers: [CanaisService, PaginateService],
  exports: [CanaisService],
})
export class CanaisModule {}
