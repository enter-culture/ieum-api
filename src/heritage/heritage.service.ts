import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseStringPromise } from 'xml2js';

const FALLBACK_KEY =
  '/AZVKcyk74moGpLTCAi6K6GDE9BUTRi+ReTZW6bHYsBD4qHJgi/9Odu1FEZ+PHCevoJ7nAb94xolpbyGCbZyZQ==';

const HERITAGE_CODES: Record<
  string,
  { ccbaAsno: string; ccbaCtcd: string; ccbaKdcd: string }
> = {
  'ganggang-sullae': { ccbaAsno: '0000080000000', ccbaCtcd: '36', ccbaKdcd: '17' },
  pansori: { ccbaAsno: '0000050000000', ccbaCtcd: 'ZZ', ccbaKdcd: '17' },
  hahoetal: { ccbaAsno: '0000690000000', ccbaCtcd: '37', ccbaKdcd: '17' }, // 제69호 (경북)
  namsadang: { ccbaAsno: '0000030000000', ccbaCtcd: '11', ccbaKdcd: '17' },
  taekkyeon: { ccbaAsno: '0000760000000', ccbaCtcd: '33', ccbaKdcd: '17' }, // 제76호 (충북)
};

export interface HeritageSearchItem {
  asno: string;
  ctcd: string;
  kdcd: string;
  name: string;
  region: string;
  category: string;
}

export interface HeritageDetail {
  name: string;
  category: string;
  subCategory: string;
  designatedAt: string;
  region: string;
  admin: string;
  content: string;
  thumbnail: string;
  images: string[];
}

@Injectable()
export class HeritageService {
  private readonly base = 'http://www.cha.go.kr/cha';

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('HERITAGE_API_KEY') ?? FALLBACK_KEY;
  }

  async search(query = '', page = '1'): Promise<HeritageSearchItem[]> {
    const key = encodeURIComponent(this.apiKey);
    const url = `${this.base}/SearchKindOpenapiList.do?serviceKey=${key}&pageUnit=20&pageIndex=${page}&ccbaKdcd=17&searchWrd=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const xml = await res.text();
    const parsed = await parseStringPromise(xml, {
      explicitArray: false,
      trim: true,
    });

    const items = parsed?.result?.item;
    const list = items ? (Array.isArray(items) ? items : [items]) : [];

    return list.map((item: Record<string, string>) => ({
      asno: item.ccbaAsno,
      ctcd: item.ccbaCtcd,
      kdcd: '17',
      name: item.ccbaMnm1,
      region: item.ccbaCtcdNm,
      category: item.ccmaName,
    }));
  }

  async detail(
    asno: string | undefined,
    ctcd: string | undefined,
    kdcd = '17',
  ): Promise<HeritageDetail> {
    if (!asno || !ctcd) throw new BadRequestException('missing params');
    return this.fetchDetail(kdcd, asno, ctcd);
  }

  async findById(id: string): Promise<HeritageDetail> {
    const code = HERITAGE_CODES[id];
    if (!code) throw new NotFoundException('not found');
    return this.fetchDetail(code.ccbaKdcd, code.ccbaAsno, code.ccbaCtcd);
  }

  /** 응답이 XML이 아니면(잘못된 코드 시 국가유산청이 HTML 홈페이지를 돌려줌) null 반환 — 500 방지 */
  private async safeParseXml(xml: string): Promise<any> {
    if (!xml || !xml.trimStart().startsWith('<?xml')) return null;
    try {
      return await parseStringPromise(xml, { explicitArray: false, trim: true });
    } catch {
      return null;
    }
  }

  private async fetchDetail(
    kdcd: string,
    asno: string,
    ctcd: string,
  ): Promise<HeritageDetail> {
    const key = encodeURIComponent(this.apiKey);

    const [detailRes, imageRes] = await Promise.all([
      fetch(
        `${this.base}/SearchKindOpenapiDt.do?serviceKey=${key}&ccbaKdcd=${kdcd}&ccbaAsno=${asno}&ccbaCtcd=${ctcd}`,
      ),
      fetch(
        `${this.base}/SearchImageOpenapi.do?serviceKey=${key}&ccbaKdcd=${kdcd}&ccbaAsno=${asno}&ccbaCtcd=${ctcd}`,
      ),
    ]);

    const [detailXml, imageXml] = await Promise.all([
      detailRes.text(),
      imageRes.text(),
    ]);

    const [detailData, imageData] = await Promise.all([
      this.safeParseXml(detailXml),
      this.safeParseXml(imageXml),
    ]);

    const item = detailData?.result?.item ?? {};
    const imgItem = imageData?.result?.item;
    const images: string[] = [];

    if (imgItem) {
      // xml2js가 같은 태그명 여러 개를 배열로 묶음 → imageUrl이 배열일 수 있음
      const urls = imgItem.imageUrl;
      if (Array.isArray(urls)) images.push(...urls.filter(Boolean));
      else if (typeof urls === 'string' && urls) images.push(urls);
    }

    return {
      name: item.ccbaMnm1 ?? '',
      category: item.ccmaName ?? '',
      subCategory: [item.gcodeName, item.bcodeName, item.mcodeName]
        .filter(Boolean)
        .join(' > '),
      designatedAt: item.ccbaAsdt ?? '',
      region: item.ccbaCtcdNm ?? '',
      admin: item.ccbaAdmin ?? '',
      content: item.content ?? '',
      thumbnail: item.imageUrl ?? '',
      images,
    };
  }
}
