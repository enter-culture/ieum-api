import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Destination {
  id: string;
  title: string;
  address: string;
  category: string;
  contentTypeId: string;
  image: string | null;
  dist: number;
  lat: number;
  lng: number;
}

@Injectable()
export class DestinationsService {
  constructor(private readonly config: ConfigService) {}

  async findNearby(
    lat = '37.5666',
    lng = '126.9784',
    radius = '5000',
    contentTypeId = '', // 12:관광지 14:문화시설 15:행사 39:음식점
  ): Promise<Destination[]> {
    const serviceKey = this.config.get<string>('TOUR_API_KEY') ?? '';
    if (!serviceKey) {
      throw new InternalServerErrorException('TOUR_API_KEY not set');
    }

    const params = new URLSearchParams({
      serviceKey,
      numOfRows: '20',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: '이음',
      _type: 'json',
      mapX: lng,
      mapY: lat,
      radius,
      ...(contentTypeId && { contentTypeId }),
      arrange: 'S', // 거리순
    });

    const res = await fetch(
      `https://apis.data.go.kr/B551011/KorService1/locationBasedList1?${params}`,
    );

    if (!res.ok) {
      throw new BadGatewayException(`Tour API error: ${res.status}`);
    }

    const data = await res.json();
    const items = data?.response?.body?.items?.item ?? [];
    const list = Array.isArray(items) ? items : [items];

    return list.map((item: Record<string, string>) => ({
      id: item.contentid,
      title: item.title,
      address: item.addr1,
      category: item.cat2name ?? item.cat1name ?? '',
      contentTypeId: item.contenttypeid,
      image: item.firstimage || item.firstimage2 || null,
      dist: Math.round(Number(item.dist)),
      lat: Number(item.mapy),
      lng: Number(item.mapx),
    }));
  }
}
