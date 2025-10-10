import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [AuthGuard],
  exports: [AuthGuard, TypeOrmModule],
})
export class CommonModule {}
