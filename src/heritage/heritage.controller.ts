import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HeritageService } from './heritage.service';

@ApiTags('heritage')
@Controller('heritage')
export class HeritageController {
  constructor(private readonly heritageService: HeritageService) {}

  @Get('search')
  @ApiOperation({ summary: '국가유산(무형유산) 검색' })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 (기본 1)' })
  search(@Query('q') q?: string, @Query('page') page?: string) {
    return this.heritageService.search(q, page);
  }

  @Get('detail')
  @ApiOperation({ summary: '국가유산 상세 조회 (검색 결과의 코드로 조회)' })
  @ApiQuery({ name: 'asno', required: true, description: '관리번호 ccbaAsno' })
  @ApiQuery({ name: 'ctcd', required: true, description: '시도코드 ccbaCtcd' })
  @ApiQuery({ name: 'kdcd', required: false, description: '종목코드 ccbaKdcd (기본 17)' })
  detail(
    @Query('asno') asno?: string,
    @Query('ctcd') ctcd?: string,
    @Query('kdcd') kdcd?: string,
  ) {
    return this.heritageService.detail(asno, ctcd, kdcd);
  }

  @Get(':id')
  @ApiOperation({ summary: '사전 정의된 국가유산 상세 조회 (slug)' })
  @ApiParam({
    name: 'id',
    description: 'slug — ganggang-sullae | pansori | hahoetal | namsadang | taekkyeon',
  })
  findById(@Param('id') id: string) {
    return this.heritageService.findById(id);
  }
}
