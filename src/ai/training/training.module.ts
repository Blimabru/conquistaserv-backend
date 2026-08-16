import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { IngestionModule } from '../ingestion/ingestion.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [IngestionModule, VectorStoreModule],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
