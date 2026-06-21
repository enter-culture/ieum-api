import { CultureService } from './culture.service';
import { ConfigService } from '@nestjs/config';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?><response><header><resultCode>00</resultCode></header><body><totalCount>1</totalCount><items><item><serviceName>공연</serviceName><seq>378998</seq><title>트리플 노트</title><startDate>20260604</startDate><endDate>20260604</endDate><place>안동문화예술의전당</place><realmName>기타</realmName><area>경북</area><sigungu>안동시</sigungu><thumbnail>http://x/a.jpg</thumbnail><gpsX>128.7257</gpsX><gpsY>36.5594</gpsY></item></items></body></response>`;

describe('CultureService', () => {
  const config = { get: () => 'TESTKEY' } as unknown as ConfigService;

  it('normalizes period2 XML into CultureEvent[]', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(SAMPLE_XML),
    }) as unknown as typeof fetch;

    const svc = new CultureService(config);
    const out = await svc.events(
      { xfrom: 128.3, yfrom: 36.4, xto: 128.8, yto: 36.8 },
      '20260601',
      '20260831',
    );

    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      id: '378998',
      kind: '공연',
      title: '트리플 노트',
      genre: '기타',
      place: '안동문화예술의전당',
      area: '경북',
      sigungu: '안동시',
      startDate: '20260604',
      endDate: '20260604',
      thumbnail: 'http://x/a.jpg',
      lat: 36.5594,
      lng: 128.7257,
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('cultureinfo/period2');
    expect(calledUrl).toContain('serviceKey=TESTKEY');
    expect(calledUrl).toContain('gpsxfrom=128.3');
  });

  it('returns [] when no items', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<?xml version="1.0"?><response><body><items></items></body></response>'),
    }) as unknown as typeof fetch;
    const svc = new CultureService(config);
    const out = await svc.events({ xfrom: 0, yfrom: 0, xto: 1, yto: 1 }, '20260601', '20260831');
    expect(out).toEqual([]);
  });
});
