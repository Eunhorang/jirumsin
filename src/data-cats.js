
/* ── 분류별 기본값 ─────────────────────────
   type: goods 물건 · sub 구독 · luxury 명품·보석 · invest 투자 · exp 경험
   dep1: 1년 뒤 되팔 때 사라지는 가치 비율, depN: 그 뒤 해마다 줄어드는 비율
   life: 쓰는 햇수, uses: 1년에 쓰는 횟수(per: 'day'면 하루 단위), hidden: 쓰는 동안의 숨은 비용(가격 대비)
   thrill: 설렘이 이어지는 날 수, rs: 사면 안 되는 이유 우선순위, alts: 대안 */
const ALT = {
  device: [['리퍼·중고', '공식 리퍼 제품이나 상태 좋은 중고로 같은 성능을 훨씬 싸게 얻을 수 있어요.'], ['렌털로 먼저', '정말 자주 쓸지 모르겠다면 한두 달 빌려 써 보고 정하세요.'], ['한 단계 아래 모델', '쓰는 용도에 비해 사양이 넘치지 않는지 확인해 보세요.'], ['지금 기기 정리', '저장공간 정리나 초기화만으로 속도가 꽤 돌아오기도 해요.']],
  luxury: [['중고 시세 확인', '같은 모델의 중고가를 보면 되팔 때 받을 돈이 현실적으로 보여요.'], ['대여 서비스', '특별한 날 한두 번 쓸 거라면 대여로 충분해요.'], ['6개월 목표 적금', '그 금액을 6개월 동안 모아 보고, 그래도 원하면 그때 사세요.'], ['매일 쓸 수 있나', '아까워서 못 쓰는 명품은 옷장 속 보관함이 될 뿐이에요.']],
  invest: [['매수 이유 세 줄 쓰기', '왜 사는지, 언제 팔지, 얼마나 떨어지면 다시 볼지 먼저 적어 보세요.'], ['비중 상한 정하기', '한 종목이 전체 자산에서 차지할 상한을 미리 정해 두세요.'], ['하루 뒤 다시 보기', '급등 뉴스를 본 날은 결정을 하루 미루세요.'], ['모의투자로 연습', '확신이 서지 않으면 모의투자로 먼저 해 보세요.']],
  generic: [['30일 위시리스트', '적어 두고 30일 뒤에도 원하면 그때 사세요.'], ['중고·대여', '중고 거래나 대여로 해결할 수 있는지 먼저 보세요.'], ['이미 가진 걸로', '집에 있는 물건으로 대신할 수 있는지 찾아보세요.'], ['가격 알림 걸기', '최저가 알림을 걸어 두면 급하게 살 이유가 사라져요.']],
};
const CATS = {
  phone: { type: 'goods', dep1: .35, depN: .2, life: 3, per: 'day', uses: 365, hidden: .15, hiddenT: '케이스·필름·보험·충전기', thrill: 30, psy: { upgrade: 45, social: 30, adapt: 40 }, rs: ['upgradeGap', 'dep', 'thrill', 'hours', 'opp'],
    alts: [['배터리 교체부터', '금방 꺼지는 게 문제라면 배터리 교체(보통 10만 원대)로 1~2년 더 쓸 수 있어요.'], ['한 세대 전 모델', '출시 1년 지난 모델이나 리퍼 제품은 성능 차이는 작고 값은 훨씬 싸요.'], ['중고 시세 확인', '지금 폰을 팔면 얼마 받는지, 새 폰이 1년 뒤 얼마가 될지 같이 보세요.'], ['요금제 다이어트', '자급제와 알뜰폰 요금제로 바꾸면 매달 나가는 돈이 줄어요.']] },
  device: { type: 'goods', dep1: .3, depN: .2, life: 4, uses: 200, hidden: .1, hiddenT: '액세서리·케이스·보증 연장', thrill: 21, psy: { adapt: 40, upgrade: 30, identity: 20, diderot: 20 }, rs: ['upgradeGap', 'dep', 'thrill', 'hours', 'opp'], alts: ALT.device },
  console: { type: 'goods', dep1: .25, depN: .15, life: 5, uses: 100, hidden: .5, hiddenT: '게임 타이틀·온라인 구독·추가 패드', thrill: 21, psy: { adapt: 35, diderot: 35, emotion: 20 }, rs: ['hidden', 'thrill', 'dep', 'hours', 'opp'],
    alts: [['중고 본체', '게임기는 중고 거래가 활발해서 상태 좋은 본체를 쉽게 구할 수 있어요.'], ['구독 한 달 체험', '게임 구독 서비스로 한 달만 해 보면 실제로 얼마나 할지 알 수 있어요.'], ['해 볼 곳 먼저', '하고 싶은 게임이 한두 개라면 친구 집이나 체험존에서 먼저 해 보세요.']] },
  appliance: { type: 'goods', dep1: .4, depN: .15, life: 7, uses: 150, hidden: .1, hiddenT: '소모품·전기료·수리비', thrill: 14, psy: { adapt: 30, identity: 15, exposure: 20 }, rs: ['dep', 'thrill', 'hidden', 'hours', 'opp'],
    alts: [['렌털·체험', '생활 가전은 렌털이나 체험으로 먼저 써 보면 실패가 줄어요.'], ['지금 제품 수리', '고장이 아니라 불편이라면 수리나 부품 교체로 해결되는지 보세요.'], ['가격 추적', '대형 가전은 가격 변동이 커요. 최저가 알림을 걸고 기다려 보세요.']] },
  car: { type: 'goods', dep1: .18, depN: .12, life: 8, per: 'day', uses: 365, hidden: .7, hiddenT: '보험·세금·연료·정비·주차', thrill: 60, psy: { social: 40, veblen: 30, adapt: 35, identity: 30 }, rs: ['carCost', 'dep', 'hours', 'opp'],
    alts: [['카셰어링과 비교', '한 달에 몇 번 타는지 따져 보면 카셰어링이나 택시가 더 싼 경우가 많아요.'], ['한 등급 아래·중고차', '감가가 큰 첫 3년을 다른 사람이 부담한 중고차는 가성비가 좋아요.'], ['월 비용으로 계산', '차값 말고 보험·세금·연료·주차까지 한 달 비용으로 계산해 보세요.']] },
  fashion: { type: 'goods', dep1: .7, depN: .3, life: 3, uses: 30, hidden: .05, hiddenT: '세탁·수선', thrill: 14, psy: { adapt: 45, social: 35, exposure: 30, diderot: 25 }, rs: ['trendFade', 'dep', 'thrill', 'hours'],
    alts: [['옷장 정리부터', '비슷한 옷이 몇 벌 있는지 세어 보면 새 옷이 정말 필요한지 보여요.'], ['30일 위시리스트', '사고 싶은 옷을 적어 두고 30일 뒤에도 원하면 그때 사세요.'], ['중고·빈티지', '중고 플랫폼에는 거의 새것인 옷도 많아요.']] },
  luxfashion: { type: 'luxury', dep1: .35, depN: .05, life: 8, uses: 40, hidden: .05, hiddenT: '관리·수선·보관', thrill: 30, psy: { veblen: 55, social: 45, adapt: 35, reward: 20 }, rs: ['ownRare', 'luxResale', 'hours', 'thrill', 'opp'], alts: ALT.luxury },
  luxury: { type: 'luxury', dep1: .35, depN: .05, life: 8, uses: 40, hidden: .05, hiddenT: '관리·수선·보험', thrill: 30, psy: { veblen: 50, social: 40, adapt: 35 }, rs: ['ownRare', 'luxResale', 'hours', 'opp'], alts: ALT.luxury },
  watch: { type: 'luxury', dep1: .2, depN: .02, life: 20, uses: 150, hidden: .06, hiddenT: '오버홀·보험', thrill: 45, psy: { veblen: 50, identity: 35, social: 35, adapt: 25 }, rs: ['ownRare', 'luxResale', 'hours', 'opp'],
    alts: [['인증 중고', '시계는 인증 중고 시장이 잘 갖춰져 있어요.'], ['차 보고 일주일', '매장에서 차 보고 일주일 뒤에도 생각나는지 보세요.'], ['다 모아서 사기', '정말 원한다면 할부 대신 다 모은 뒤에 사세요.']] },
  jewelry: { type: 'luxury', dep1: .55, depN: 0, life: 20, uses: 40, hidden: .03, hiddenT: '세척·보험', thrill: 30, psy: { veblen: 40, social: 35, identity: 25 }, rs: ['diamond', 'ownRare', 'hours', 'opp'],
    alts: [['랩그로운 다이아몬드', '천연과 성분이 같은 랩그로운 다이아몬드는 값이 훨씬 낮아요.'], ['의미를 남기는 다른 방법', '반지 대신 함께하는 여행이나 경험으로 의미를 남길 수도 있어요.'], ['예산 먼저 정하기', '매장에 가기 전에 상한선부터 정해 두세요.']] },
  gold: { type: 'luxury', dep1: .15, depN: 0, life: 10, uses: 20, hidden: 0, hiddenT: '공임비', thrill: 30, psy: { herd: 30, recency: 30, fomo: 20 }, rs: ['goldVat', 'hours', 'opp'],
    alts: [['구매 방식 비교', '실물 금, 금 통장, KRX 금시장은 세금과 수수료 구조가 달라요. 먼저 비교해 보세요.'], ['공임비 확인', '장신구는 공임비가 붙어서 되팔 때 그만큼 손해예요.'], ['금액과 기간 정하기', '한 번에 큰돈을 넣으면 가격 변동에 흔들리기 쉬워요. 상한을 미리 정해 두세요.']] },
  beauty: { type: 'goods', dep1: 1, depN: 0, life: 1, uses: 200, hidden: 0, hiddenT: '', thrill: 7, psy: { exposure: 40, adapt: 35, reward: 25 }, rs: ['beautyStock', 'noresale', 'thrill', 'hours'],
    alts: [['다 쓰고 사기', '지금 쓰는 제품을 끝까지 쓴 뒤에 사도 늦지 않아요.'], ['샘플·미니 사이즈', '나에게 맞는지 샘플로 먼저 확인하세요.'], ['겹치는지 확인', '이미 가진 제품과 성분이나 기능이 겹치지 않는지 보세요.']] },
  sub: { type: 'sub', usesM: 8, thrill: 10, psy: { inertia: 55, sunk: 20, exposure: 20 }, rs: ['sub10', 'subUse', 'subInertia', 'hours'],
    alts: [['한 달만 몰아 쓰기', '보고 싶은 게 있을 때 한 달만 결제하고 바로 해지하세요.'], ['해지 날짜 먼저', '가입하는 날 해지 알림부터 달력에 적어 두세요.'], ['무료 대안', '도서관, 무료 요금제, 이미 결제 중인 다른 구독으로 대신할 수 있는지 보세요.'], ['구독 목록 점검', '지금 나가는 구독을 전부 적어 보면 겹치는 게 보여요.']] },
  stock: { type: 'invest', fee: .005, mdd: .5, thrill: 3, psy: { overconf: 45, herd: 35, recency: 35, fomo: 30 }, rs: ['mdd', 'daytrade', 'rising', 'hours'], alts: ALT.invest },
  crypto: { type: 'invest', fee: .003, mdd: .8, thrill: 3, psy: { fomo: 50, herd: 45, overconf: 35, variable: 30 }, rs: ['mdd', 'daytrade', 'rising', 'hours'],
    alts: [['잃어도 되는 돈만', '전부 잃어도 생활에 지장이 없는 금액까지만 생각하세요.'], ['리딩방·지인 추천 주의', '수익을 보장한다는 말은 사기의 가장 흔한 신호예요.'], ['24시간 규칙', '급등한 날에는 24시간 기다린 뒤 다시 판단하세요.']] },
  etf: { type: 'invest', fee: .003, mdd: .55, thrill: 3, psy: { recency: 20, herd: 15 }, rs: ['etfOk', 'mdd', 'hours'],
    alts: [['자동 적립', '정해진 날 정해진 금액을 넣으면 타이밍 고민이 줄어요.'], ['총보수 비교', '같은 지수를 따르는 상품끼리 수수료를 비교해 보세요.'], ['비상금 먼저', '몇 달 치 생활비를 따로 떼어 둔 뒤에 투자하세요.']] },
  lev: { type: 'invest', fee: .005, mdd: .82, thrill: 2, psy: { overconf: 55, variable: 40, fomo: 35 }, rs: ['levDecay', 'mdd', 'daytrade', 'hours'],
    alts: [['기초 지수로 대신', '같은 방향에 투자해도 레버리지 없는 상품이 훨씬 덜 흔들려요.'], ['손실 한도 정하기', '어디까지 잃으면 멈출지 먼저 정하세요.'], ['보유 기간 정하기', '레버리지 상품은 오래 들고 있을수록 불리해질 수 있어요.']] },
  travel: { type: 'exp', dep1: 1, depN: 0, life: 1, uses: 1, hidden: .3, hiddenT: '현지 지출·쇼핑·환전 수수료', thrill: 120, psy: { social: 30, reward: 30, exposure: 25 }, rs: ['expDebt', 'hidden', 'hours', 'opp'],
    alts: [['비수기·가까운 곳', '같은 설렘을 훨씬 싸게 얻을 수 있는 날짜와 장소가 있어요.'], ['여행 적금', '할부 대신 여행 적금으로 미리 모아서 떠나세요.'], ['일정 하루 줄이기', '하루만 줄여도 숙박비와 식비가 크게 줄어요.']] },
  dining: { type: 'exp', dep1: 1, depN: 0, life: 1, uses: 1, hidden: .1, hiddenT: '주류·추가 주문·교통', thrill: 5, psy: { social: 30, reward: 35, exposure: 30 }, rs: ['expDebt', 'hours', 'opp'],
    alts: [['점심 코스로', '같은 가게도 점심 코스는 훨씬 저렴한 경우가 많아요.'], ['기념일로 아껴 두기', '특별한 날에 가면 만족이 더 커요.'], ['집에서 차리는 한 끼', '좋은 재료로 직접 차리는 것도 특별한 경험이에요.']] },
  experience: { type: 'exp', dep1: 1, depN: 0, life: 1, uses: 1, hidden: .15, hiddenT: '교통·굿즈·식사', thrill: 14, psy: { social: 25, reward: 30, fomo: 25 }, rs: ['expDebt', 'hidden', 'hours'],
    alts: [['좌석 한 단계 낮추기', '공연의 감동은 좌석 등급만큼 차이 나지 않아요.'], ['굿즈는 나중에', '현장 분위기에 산 굿즈는 집에 오면 시들해지기 쉬워요.'], ['다음 기회 확인', '추가 공연이나 다른 일정이 있는지 보세요.']] },
  gacha: { type: 'goods', dep1: 1, depN: 0, life: 1, uses: 30, hidden: 0, hiddenT: '', thrill: 2, psy: { variable: 65, sunk: 50, fomo: 30 }, rs: ['gacha', 'noresale', 'hours', 'opp'],
    alts: [['월 한도 정하기', '한 달에 쓸 금액을 정하고, 넘으면 그달은 멈추세요.'], ['확률표 확인', '원하는 아이템이 나올 확률을 보면 기대값이 보여요.'], ['일주일 무과금', '일주일만 결제 없이 해 보면 정말 필요한지 알 수 있어요.']] },
  kpop: { type: 'goods', dep1: .6, depN: .2, life: 3, uses: 20, hidden: .2, hiddenT: '중복 구매·배송비', thrill: 7, psy: { identity: 45, variable: 35, social: 30, fomo: 25 }, rs: ['kpopRandom', 'thrill', 'hours'],
    alts: [['앨범은 한 장만', '원하는 포토카드는 교환이나 중고로 구하는 게 훨씬 싸요.'], ['스트리밍으로 응원', '음원 스트리밍도 아티스트에게 힘이 돼요.'], ['공연에 모으기', '굿즈 대신 공연 관람에 돈을 모으면 기억이 오래 남아요.']] },
  hobby: { type: 'goods', dep1: .35, depN: .15, life: 5, uses: 25, hidden: .4, hiddenT: '소모품·이용료·업그레이드', thrill: 30, psy: { identity: 50, diderot: 40, adapt: 30 }, rs: ['gearFirst', 'hidden', 'dep', 'hours', 'opp'],
    alts: [['대여·원데이 클래스', '장비를 사기 전에 빌리거나 체험 수업으로 시작해 보세요.'], ['중고 입문 장비', '처음에는 중고 입문 장비로 충분해요.'], ['3개월 규칙', '3개월 넘게 꾸준히 하면 그때 장비를 업그레이드하세요.']] },
  generic: { type: 'goods', dep1: .45, depN: .2, life: 3, uses: 50, hidden: .05, hiddenT: '부속품·관리비', thrill: 14, psy: { adapt: 35, exposure: 20 }, rs: ['thrill', 'dep', 'hours', 'opp'], alts: ALT.generic },
};
const GENERIC_CAT = { goods: 'generic', sub: 'sub', luxury: 'luxury', invest: 'stock', exp: 'experience' };
const DEFAULT_PRICE = { goods: 300000, luxury: 3000000, sub: 10000, invest: 1000000, exp: 300000 };

/* ── 구매 심리 ───────────────────────────── */
const PSY = {
  social: ['사회적 비교', '주변 사람이 가진 걸 보면 나도 그만큼은 가져야 할 것 같은 압박이 생겨요. 비교 기준은 가질수록 계속 올라가요.'],
  adapt: ['쾌락 적응', '새것이 주는 기쁨은 생각보다 빨리 익숙해져요. 몇 주 뒤에는 원래 기분으로 돌아오는 경우가 대부분이에요.'],
  fomo: ['희소성 압박', '"지금 아니면 끝"이라는 느낌은 판단을 서두르게 만들어요. 한정판과 마감 임박은 대표적인 판매 기술이에요.'],
  anchor: ['할인 착시', '원래 가격이 기준점이 되면 할인된 가격이 이득처럼 느껴져요. 하지만 사지 않으면 100% 아끼는 거예요.'],
  reward: ['보상 심리', '"이 정도는 나한테 줘도 돼"라는 생각은 지출을 정당화하는 가장 흔한 이유예요.'],
  emotion: ['감정 소비', '스트레스를 받을 때 결제하면 잠깐 기분이 오르지만, 카드값이 나올 때 다시 스트레스가 돼요.'],
  diderot: ['디드로 효과', '새 물건 하나가 들어오면 거기에 어울리는 다른 물건까지 사고 싶어져요. 첫 구매가 연쇄 구매의 시작이 되기 쉬워요.'],
  veblen: ['과시 욕구', '비쌀수록 더 갖고 싶어진다면, 물건보다 "남이 알아봐 주는 나"를 원하는 것일 수 있어요.'],
  herd: ['군중 심리', '다들 산다는 소식은 확신처럼 느껴지지만, 사람이 몰릴 때는 이미 값이 오른 뒤인 경우가 많아요.'],
  recency: ['최근 편향', '최근에 오른 흐름이 앞으로도 이어질 거라고 믿기 쉬워요. 지난 수익률은 앞날을 보장하지 않아요.'],
  overconf: ['과신', '"나는 남들보다 잘 고를 수 있다"는 믿음은 대부분의 개인 투자자가 가진 착각이에요.'],
  inertia: ['구독 관성', '해지하는 게 귀찮아서, 잘 쓰지 않아도 결제가 계속되기 쉬워요.'],
  variable: ['변동 보상', '언제 좋은 게 나올지 모르는 뽑기 구조는 도박과 같은 방식으로 뇌의 보상 회로를 자극해요.'],
  sunk: ['매몰 비용', '"이미 쓴 돈이 아까워서" 계속 쓰게 되는 함정이에요. 지나간 돈은 돌아오지 않아요.'],
  identity: ['정체성 소비', '이걸 가지면 "그런 사람"이 될 것 같은 기대가 있어요. 장비보다 습관이 사람을 바꿔요.'],
  exposure: ['노출 효과', '광고와 추천 영상에 자주 보이면 원래 없던 욕구가 생겨요. 알고리즘은 당신의 지갑을 잘 알아요.'],
  upgrade: ['업그레이드 집착', '지금 것도 잘 되는데 새 버전이 나오면 갑자기 낡아 보여요. 실제 체감 차이는 광고보다 작아요.'],
};
const TRIG = {
  sale: { anchor: 55, fomo: 10 }, everyone: { social: 55, herd: 20 }, stress: { emotion: 60 }, reward: { reward: 60 },
  limited: { fomo: 55 }, rising: { recency: 55, herd: 25, fomo: 20 }, sns: { exposure: 55, social: 15 },
  upgrade: { upgrade: 50, diderot: 10 }, gift: { social: 10 },
};
const WANT = {
  social: '뒤처지지 않았다는 안심', adapt: '새것이 주는 몇 주의 설렘', fomo: '놓치지 않았다는 안도감', anchor: '싸게 샀다는 승리감',
  reward: '수고했다는 인정', emotion: '오늘 하루의 기분 전환', diderot: '완벽하게 갖춰진 느낌', veblen: '남들이 알아봐 주는 순간',
  herd: '다들 하는 걸 나도 한다는 안심', recency: '나만 뒤처질지 모른다는 불안을 끄는 것', overconf: '내 판단이 옳았다는 확인',
  inertia: '언젠가 쓸 것 같은 가능성', variable: '다음 뽑기의 두근거림', sunk: '이미 쓴 돈이 헛되지 않았다는 위안',
  identity: '되고 싶은 나의 모습', exposure: '화면 속 그 장면의 주인공', upgrade: '새것의 신선함',
};

/* ── 입력 선택지 ─────────────────────────── */
const TYPES = [['auto', '자동'], ['goods', '물건'], ['sub', '구독'], ['luxury', '명품·보석'], ['invest', '주식·코인'], ['exp', '경험']];
const TYPE_NAME = { goods: '물건', sub: '구독 서비스', luxury: '명품·보석', invest: '주식·코인 등 투자', exp: '경험' };
const REASONS = [
  ['sale', '할인·특가라서'], ['everyone', '다들 가지고 있어서'], ['stress', '스트레스 풀고 싶어서'], ['reward', '나에게 주는 보상'],
  ['limited', '지금 아니면 못 살 것 같아서'], ['sns', 'SNS·유튜브에서 보고'], ['upgrade', '가진 게 낡아서'], ['rising', '요즘 계속 올라서'],
  ['need', '꼭 필요해서'], ['gift', '선물하려고'],
];
const SINCE = [['today', '오늘 처음 봤어요'], ['days', '며칠 됐어요'], ['weeks', '몇 주째 고민 중'], ['months', '몇 달째 원했어요']];
const EXAMPLES = [
  { item: '새 아이폰 프로', price: 1790000, reasons: ['everyone', 'upgrade'], since: 'days', similar: true },
  { item: '샤넬 클래식 플랩백', price: 16000000, reasons: ['reward', 'sns'], since: 'weeks' },
  { item: '롤렉스 서브마리너', price: 15500000, reasons: ['everyone', 'reward'], since: 'months' },
  { item: '넷플릭스 프리미엄', price: 17000, reasons: ['stress'], since: 'today', type: 'sub' },
  { item: '테슬라 주식', price: 5000000, reasons: ['rising', 'sns'], since: 'today', type: 'invest' },
  { item: '비트코인', price: 3000000, reasons: ['rising', 'limited'], since: 'days', type: 'invest' },
  { item: '플스5', price: 700000, reasons: ['stress', 'sale'], since: 'days' },
  { item: '게임 현질', price: 100000, reasons: ['limited', 'stress'], since: 'today' },
  { item: '오마카세', price: 200000, reasons: ['reward', 'sns'], since: 'days' },
];

/* ── 이 돈이면 (2026년 대략적인 가격) ───────── */
const UNITS = {
  coffee: ['아메리카노', '잔', 4700], chicken: ['치킨', '마리', 23000], gukbap: ['국밥', '그릇', 11000],
  movie: ['영화 관람', '번', 15000], book: ['책', '권', 18000], subway: ['지하철', '번', 1550],
  jeju: ['제주 왕복 항공권', '번', 150000], rent: ['서울 원룸 월세', '달', 700000], trip: ['해외여행', '번', 2000000],
};
