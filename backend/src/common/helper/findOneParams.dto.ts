import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @ApiProperty({ description: 'Resource ID', example: 1 })
  @IsNumberString()
  id: number;
}