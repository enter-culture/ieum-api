/* eslint-disable */
// 기존 프론트 번들 영상(ieum/public/videos/0X.mp4)을 R2에 업로드하고 videos 테이블에 등록한다.
// 실행: node scripts/seed-videos.cjs  (.env.local에서 R2/DB 설정 로드)
const fs = require('fs');
const path = require('path');

// .env.local 파싱
const envText = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
function loadPg() {
  try { return require('pg'); } catch {}
  const base = path.join(__dirname, '..', 'node_modules', '.pnpm');
  const dir = fs.readdirSync(base).find((d) => d.startsWith('pg@'));
  return require(path.join(base, dir, 'node_modules', 'pg'));
}

const VIDEOS_DIR = path.join(__dirname, '..', '..', 'ieum', 'public', 'videos');
const SEED = [
  { file: '01.mp4', slug: 'ganggang-sullae', title: '강강술래', region: '전라남도 해남·진도' },
  { file: '02.mp4', slug: 'pansori', title: '판소리', region: '전국' },
  { file: '03.mp4', slug: 'hahoetal', title: '하회별신굿탈놀이', region: '경상북도 안동' },
  { file: '04.mp4', slug: 'namsadang', title: '남사당놀이', region: '경기도 안성' },
  { file: '05.mp4', slug: 'taekkyeon', title: '택견', region: '전국' },
];

async function main() {
  const r2 = new S3Client({
    region: 'auto',
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });

  const pgLib = loadPg();
  const client = new pgLib.Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  for (const s of SEED) {
    const key = `shorts/seed-${s.slug}.mp4`;
    const body = fs.readFileSync(path.join(VIDEOS_DIR, s.file));
    await r2.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: 'video/mp4',
      }),
    );
    await client.query(
      `insert into videos (title, description, category, sub_category, region, r2key, heritage_id, heritage_asno, heritage_ctcd, created_at)
       values ($1, null, $2, null, $3, $4, $5, null, null, now())
       on conflict (r2key) do update set title = excluded.title, region = excluded.region`,
      [s.title, '국가무형문화재', s.region, key, s.slug],
    );
    console.log(`✓ ${s.title} → ${key}`);
  }

  await client.end();
  console.log('seed done');
}

main().catch((e) => {
  console.error('SEED ERROR:', e.message);
  process.exit(1);
});
