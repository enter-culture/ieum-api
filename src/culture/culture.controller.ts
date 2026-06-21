import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CultureEvent, CultureService } from './culture.service';

@ApiTags('culture')
@Controller('culture')
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @Get('events')
  events(
    @Query('xfrom') xfrom: string,
    @Query('yfrom') yfrom: string,
    @Query('xto') xto: string,
    @Query('yto') yto: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<CultureEvent[]> {
    return this.cultureService.events(
      {
        xfrom: Number(xfrom),
        yfrom: Number(yfrom),
        xto: Number(xto),
        yto: Number(yto),
      },
      from,
      to,
    );
  }
}
