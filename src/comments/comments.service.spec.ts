import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  const user = { id: 7, nickname: '구수', name: '신성수', picture: 'http://img/p.png' };

  function makeEm(overrides: Partial<Record<string, jest.Mock>> = {}) {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      flush: jest.fn(),
      getReference: jest.fn((_e: unknown, id: number) => ({ id })),
      ...overrides,
    } as never;
  }

  it('list: shortsId의 댓글을 최신순으로 DTO 매핑한다', async () => {
    const em = makeEm({
      find: jest.fn().mockResolvedValue([
        { id: 2, shortsId: 10, content: '두번째', createdAt: new Date('2026-06-22'), user },
        { id: 1, shortsId: 10, content: '첫번째', createdAt: new Date('2026-06-21'), user },
      ]),
    });
    const svc = new CommentsService(em);
    const res = await svc.list(10);
    expect(em.find).toHaveBeenCalledWith(
      expect.anything(),
      { shortsId: 10 },
      { orderBy: { createdAt: 'DESC' }, populate: ['user'] },
    );
    expect(res[0]).toEqual({
      id: 2, shortsId: 10, content: '두번째', createdAt: new Date('2026-06-22'),
      author: { id: 7, nickname: '구수', name: '신성수', picture: 'http://img/p.png' },
    });
  });

  it('create: 댓글을 만들고 작성자 정보를 포함해 반환한다', async () => {
    const created = { id: 5, shortsId: 10, content: '새 댓글', createdAt: new Date('2026-06-22'), user };
    const em = makeEm({ create: jest.fn().mockReturnValue(created) });
    const svc = new CommentsService(em);
    const res = await svc.create(7, { shortsId: 10, content: '새 댓글' });
    expect(em.flush).toHaveBeenCalled();
    expect(res).toEqual({
      id: 5, shortsId: 10, content: '새 댓글', createdAt: new Date('2026-06-22'),
      author: { id: 7, nickname: '구수', name: '신성수', picture: 'http://img/p.png' },
    });
  });
});
