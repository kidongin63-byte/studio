export type Member = {
  id: string;
  name: string;
  phone: string;
  address: string;
  birthDate: string; // YYYY-MM-DD
  isLunar: boolean;
  anniversary: string; // YYYY-MM-DD
  preferences: {
    food: string;
    hobbies: string;
  };
  avatarUrl: string;
};

export type Rule = {
  id: string;
  title: string;
  content: string;
};

export type Message = {
  id: string;
  author: string;
  content: string;
};

export const members: Member[] = [
  {
    id: '1',
    name: '김서연',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    birthDate: '1964-05-15',
    isLunar: false,
    anniversary: '1990-06-20',
    preferences: {
      food: '한식, 이탈리안',
      hobbies: '등산, 독서',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar1/200/200',
  },
  {
    id: '2',
    name: '이준호',
    phone: '010-2345-6789',
    address: '부산시 해운대구 마린시티로 45',
    birthDate: '1955-02-28',
    isLunar: true,
    anniversary: '1985-03-10',
    preferences: {
      food: '회, 중식',
      hobbies: '낚시, 골프',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar2/200/200',
  },
  {
    id: '3',
    name: '박지현',
    phone: '010-3456-7890',
    address: '대구시 수성구 달구벌대로 678',
    birthDate: '1970-11-11',
    isLunar: false,
    anniversary: '1995-12-25',
    preferences: {
      food: '빵, 커피',
      hobbies: '베이킹, 영화 감상',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar3/200/200',
  },
  {
    id: '4',
    name: '최민준',
    phone: '010-4567-8901',
    address: '인천시 연수구 컨벤시아대로 90',
    birthDate: '1968-08-20',
    isLunar: false,
    anniversary: '1992-10-05',
    preferences: {
      food: '치킨, 맥주',
      hobbies: '축구, 게임',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar4/200/200',
  },
  {
    id: '5',
    name: '정수빈',
    phone: '010-5678-9012',
    address: '광주시 서구 상무대로 12',
    birthDate: '1974-01-30',
    isLunar: true,
    anniversary: '2000-01-15',
    preferences: {
      food: '매운 음식',
      hobbies: '여행, 사진 촬영',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar5/200/200',
  },
    {
    id: '6',
    name: '윤지우',
    phone: '010-6789-0123',
    address: '제주도 제주시 한라산로 34',
    birthDate: '1945-07-07',
    isLunar: false,
    anniversary: '1970-09-09',
    preferences: {
      food: '채식, 샐러드',
      hobbies: '요가, 명상',
    },
    avatarUrl: 'https://picsum.photos/seed/avatar6/200/200',
  },
];

export const rules: Rule[] = [
  {
    id: 'rule-1',
    title: '제 1조: 명칭',
    content: '본 모임의 명칭은 "충기모" (충직한 사람들의 모임)라 칭한다.',
  },
  {
    id: 'rule-2',
    title: '제 2조: 목적',
    content: '회원 상호간의 친목 도모와 우의 증진, 그리고 건전한 여가 생활을 목적으로 한다.',
  },
  {
    id: 'rule-3',
    title: '제 3조: 회원 자격',
    content: '본 모임의 설립 취지에 동감하고, 회원으로서의 의무를 다할 수 있는 자로 한다.',
  },
  {
    id: 'rule-4',
    title: '제 4조: 정기 모임',
    content: '정기 모임은 분기별 1회 실시하는 것을 원칙으로 하며, 날짜와 장소는 운영진이 협의하여 정한다.',
  },
  {
    id: 'rule-5',
    title: '제 5조: 회비',
    content: '회비는 월 2만원으로 하며, 모임 운영 및 경조사비 등으로 사용된다. 회비 납부는 매월 10일까지 완료해야 한다.',
  },
];

export const messages: Message[] = [
  {
    id: 'msg-1',
    author: '총무님',
    content: '가장 큰 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데에 있다. - 넬슨 만델라',
  },
  {
    id: 'msg-2',
    author: '김서연',
    content: '우정은 영혼의 포도주와 같다. 오래될수록 더 좋다.',
  },
  {
    id: 'msg-3',
    author: '이준호',
    content: '인생에서 가장 중요한 것은 무엇을 가졌는지가 아니라, 누구와 함께하는지이다.',
  },
  {
    id: 'msg-4',
    author: '박지현',
    content: '작은 변화가 큰 차이를 만든다. 오늘 하루도 소중히!',
  },
    {
    id: 'msg-5',
    author: '총무님',
    content: '행복은 여정이지, 목적지가 아니다. 함께하는 모든 순간이 행복입니다.',
  },
  {
    id: 'msg-6',
    author: '최민준',
    content: '진정한 친구는 두 개의 몸에 깃든 하나의 영혼이다. - 아리스토텔레스',
  },
];
