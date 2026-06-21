import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseStringPromise } from 'xml2js';

export interface Bbox {
  xfrom: number;
  yfrom: number;
  xto: number;
  yto: number;
}

export interface CultureEvent {
  id: string;
  kind: string;
  title: string;
  genre: string;
  place: string;
  area: string;
  sigungu: string;
  startDate: string;
  endDate: string;
  thumbnail: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class CultureService {
  private readonly base = 'https://apis.data.go.kr/B553457/cultureinfo';

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('DATA_GO_KR_API_KEY') ?? '';
  }

  async events(bbox: Bbox, from: string, to: string): Promise<CultureEvent[]> {
    const key = encodeURIComponent(this.apiKey);
    const params = [
      `serviceKey=${key}`,
      `from=${from}`,
      `to=${to}`,
      `cPage=1`,
      `rows=50`,
      `gpsxfrom=${bbox.xfrom}`,
      `gpsyfrom=${bbox.yfrom}`,
      `gpsxto=${bbox.xto}`,
      `gpsyto=${bbox.yto}`,
      `sortStdr=1`,
    ].join('&');

    const res = await fetch(`${this.base}/period2?${params}`);
    const xml = await res.text();
    const data = await parseStringPromise(xml, {
      explicitArray: false,
      trim: true,
    }).catch(() => null);

    const items = data?.response?.body?.items?.item;
    const list = items ? (Array.isArray(items) ? items : [items]) : [];

    return list.map((i: Record<string, string>) => ({
      id: String(i.seq ?? ''),
      kind: i.serviceName ?? '',
      title: i.title ?? '',
      genre: i.realmName ?? '',
      place: i.place ?? '',
      area: i.area ?? '',
      sigungu: i.sigungu ?? '',
      startDate: i.startDate ?? '',
      endDate: i.endDate ?? '',
      thumbnail: i.thumbnail || null,
      lat: Number(i.gpsY),
      lng: Number(i.gpsX),
    }));
  }
}
