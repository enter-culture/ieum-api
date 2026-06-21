import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: '위치 기반 주변 여행지 조회 (한국관광공사 Tour API)' })
  @ApiQuery({ name: 'lat', required: false, description: '위도 (기본 37.5666)' })
  @ApiQuery({ name: 'lng', required: false, description: '경도 (기본 126.9784)' })
  @ApiQuery({ name: 'radius', required: false, description: '반경(m) (기본 5000)' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'contentTypeId — 12:관광지 14:문화시설 15:행사 39:음식점',
  })
  findNearby(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('type') type?: string,
  ) {
    return this.destinationsService.findNearby(lat, lng, radius, type);
  }
}
