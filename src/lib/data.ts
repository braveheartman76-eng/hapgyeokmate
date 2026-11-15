export type Subject = { id: string; name: string; shortName: string; description: string; color: string; units: string[]; available: boolean };
export type Question = { id: string; subjectId: string; unit: string; prompt: string; choices: string[]; correctIndex: number; explanation: string; source: string; difficulty: "기본" | "보통" | "심화" };

export const subjects: Subject[] = [
  { id: "criminal-law", name: "형법", shortName: "형법", description: "총론부터 각론까지 판례 중심 학습", color: "#6d4aff", units: ["형법의 기초", "구성요건론", "위법성", "책임론"], available: true },
  { id: "criminal-procedure", name: "형사소송법", shortName: "형소법", description: "수사·공판·증거를 흐름으로 정리", color: "#9a7cff", units: ["수사", "공소", "공판", "증거"], available: true },
  { id: "corrections", name: "교정학", shortName: "교정학", description: "교정이론과 현행 법령을 함께", color: "#b565d9", units: ["교정의 기초", "시설내 처우", "사회내 처우"], available: true },
  { id: "labor-law", name: "노동법", shortName: "노동법", description: "개별·집단적 근로관계 핵심 쟁점", color: "#ee7eb8", units: ["근로기준법", "노동조합법"], available: false },
];

export const questions: Question[] = [
  { id: "cl-001", subjectId: "criminal-law", unit: "형법의 기초", prompt: "형법의 시간적 적용범위에 관한 설명으로 옳은 것은?", choices: ["범죄 후 법률이 변경되어 형이 가벼워진 경우에도 행위시법만 적용한다.", "재판확정 후 법률이 변경되어 그 행위가 범죄를 구성하지 않게 되면 형의 집행을 면제한다.", "한시법의 추급효는 언제나 인정된다.", "형법 제1조 제2항은 소송법규의 변경에도 당연히 적용된다."], correctIndex: 1, explanation: "형법 제1조 제3항에 따라 재판이 확정된 후 법률의 변경으로 그 행위가 범죄를 구성하지 않게 된 때에는 형의 집행을 면제합니다.", source: "형법 제1조", difficulty: "기본" },
  { id: "cl-002", subjectId: "criminal-law", unit: "구성요건론", prompt: "부작위범에 관한 설명으로 가장 적절한 것은?", choices: ["보증인지위는 법률에 의해서만 발생한다.", "부작위범의 실행행위는 언제나 결과 발생 시점에 종료된다.", "진정부작위범은 명령규범을 부작위로 위반하는 범죄이다.", "부진정부작위범에는 인과관계가 필요하지 않다."], correctIndex: 2, explanation: "진정부작위범은 일정한 행위를 명하는 규범을 부작위로 위반함으로써 성립합니다. 보증인지위는 법률뿐 아니라 계약·선행행위 등에서도 발생할 수 있습니다.", source: "형법총론", difficulty: "보통" },
  { id: "cp-001", subjectId: "criminal-procedure", unit: "수사", prompt: "현행범인 체포에 관한 설명으로 옳은 것은?", choices: ["체포영장이 있어야 한다.", "누구든지 영장 없이 체포할 수 있다.", "검사만 체포할 수 있다.", "반드시 긴급체포 요건을 갖추어야 한다."], correctIndex: 1, explanation: "형사소송법 제212조에 따라 현행범인은 누구든지 영장 없이 체포할 수 있습니다.", source: "형사소송법 제212조", difficulty: "기본" },
  { id: "cp-002", subjectId: "criminal-procedure", unit: "증거", prompt: "전문법칙에 관한 설명으로 가장 적절한 것은?", choices: ["전문증거는 예외 없이 증거능력이 없다.", "피고인이 동의하면 전문증거도 증거로 할 수 있다.", "탄핵증거에도 전문법칙이 그대로 적용된다.", "진술의 임의성과는 무관하다."], correctIndex: 1, explanation: "형사소송법 제318조의 증거동의가 있으면 전문증거도 증거로 할 수 있습니다. 다만 임의성 등 다른 증거법상 요건은 별도로 검토합니다.", source: "형사소송법 제318조", difficulty: "보통" },
  { id: "co-001", subjectId: "corrections", unit: "교정의 기초", prompt: "교정의 이념에 관한 설명으로 가장 적절한 것은?", choices: ["응보와 재사회화는 논리적으로 양립할 수 없다.", "특별예방은 일반 국민에 대한 위하를 의미한다.", "사회복귀 이념은 수형자의 재사회화를 중시한다.", "회복적 사법은 피해자의 참여를 배제한다."], correctIndex: 2, explanation: "사회복귀 이념은 수형자가 책임 있는 사회 구성원으로 복귀하도록 처우와 교육을 제공하는 데 초점을 둡니다.", source: "교정학개론", difficulty: "기본" },
  { id: "co-002", subjectId: "corrections", unit: "시설내 처우", prompt: "수형자 분류의 목적으로 가장 거리가 먼 것은?", choices: ["개별처우 계획 수립", "시설 안전 확보", "재범 위험 평가", "모든 수형자에게 동일한 처우 제공"], correctIndex: 3, explanation: "분류는 수형자의 특성과 위험·필요를 파악해 개별화된 처우를 제공하기 위한 것이므로 획일적 처우와 거리가 멉니다.", source: "형의 집행 및 수용자의 처우에 관한 법률", difficulty: "기본" },
];

export function getSubject(id: string) { return subjects.find((subject) => subject.id === id); }
export function getQuestions(subjectId: string, unit?: string) { return questions.filter((question) => question.subjectId === subjectId && (!unit || question.unit === unit)); }
