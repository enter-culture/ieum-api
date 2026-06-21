import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeritageService } from './heritage.service';

@ApiTags('heritage')
@Controller('heritage')
export class HeritageController {
  constructor(private readonly heritageService: HeritageService) {}

  @Get('search')
  search(@Query('q') q?: string, @Query('page') page?: string) {
    return this.heritageService.search(q, page);
  }

  @Get('detail')
  detail(
    @Query('asno') asno?: string,
    @Query('ctcd') ctcd?: string,
    @Query('kdcd') kdcd?: string,
  ) {
    return this.heritageService.detail(asno, ctcd, kdcd);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.heritageService.findById(id);
  }
}
