// Tech tree: research point generation, spending and unlock checks.
// Pure logic, no I/O.

import { pushEvent } from './state.js';

const DAY_LENGTH = 90; // seconds per game day (mirrors state.js CONFIG)

export const TECHS = {
  forestry: {
    name: '식림 (Forestry)',
    desc: '식림장의 건물을 해금합니다: 풀밭에 새 나무를 심습니다.',
    cost: 10,
    effects: {},
    unlocks: ['forester'],
  },
  batteries: {
    name: '에너지 저장 (Energy Storage)',
    desc: '축전지의 건물을 해금합니다: 잉여 에너지를 저장합니다.',
    cost: 15,
    effects: {},
    unlocks: ['battery'],
  },
  solar2: {
    name: '고급 태양광 (Advanced Photovoltaics)',
    desc: '태양광 발전소의 건물을 해금합니다: 기본 패널보다 훨씬 효율적입니다.',
    cost: 15,
    effects: {},
    unlocks: ['solar-plant'],
  },
  mining: {
    name: '심층 채굴 (Deep Mining)',
    desc: '광산의 건물을 해금합니다: 광맥에서 금속을 채굴합니다.',
    cost: 20,
    effects: {},
    unlocks: ['mine'],
  },
  efficiency: {
    name: '효율 (Efficiency)',
    desc: '채굴 시설이 자원을 25% 더 많이 생산합니다.',
    cost: 20,
    effects: { extractProd: 1.25 },
    unlocks: [],
  },
  medicine: {
    name: '의학 (Medicine)',
    desc: '배고픔과 갈증이 30% 더 천천히 증가합니다.',
    cost: 25,
    effects: { hungerRate: 0.7, thirstRate: 0.7 },
    unlocks: [],
  },
  ballistics: {
    name: '사격학 (Ballistics)',
    desc: '타워의 피해가 50% 증가하고 사거리가 늘어납니다. 저격포탑의 건물을 해금합니다.',
    cost: 25,
    effects: { towerDamage: 1.5, towerRangeMul: 1.17 },
    unlocks: ['sniper'],
  },
  concrete: {
    name: '철근 콘크리트 (Reinforced Concrete)',
    desc: '콘크리트 벽의 건물을 해금합니다: 궁극의 수동 방어입니다.',
    cost: 25,
    effects: {},
    unlocks: ['concrete-wall'],
  },
};

// Advances research by dt seconds: every lab (def.researchRate > 0) adds
// researchRate * (workers / jobs) * dt / dayLength points. Power is not
// required. Returns the updated total.
export function tickResearch(state, dt, DEFS) {
  let gain = 0;
  for (const b of state.buildings) {
    const def = DEFS[b.defId];
    if (!def || !(def.researchRate > 0)) continue;
    const ratio = def.jobs ? Math.min(b.workers.length, def.jobs) / def.jobs : 1;
    if (ratio <= 0) continue;
    gain += (def.researchRate * ratio * dt) / DAY_LENGTH;
  }
  if (gain > 0) {
    state.researchPoints = (state.researchPoints ?? 0) + gain;
  }
  return state.researchPoints ?? 0;
}

// True when the tech exists, is not yet researched and is affordable.
export function canResearch(state, id) {
  const tech = TECHS[id];
  if (!tech) return false;
  if (state.researched?.includes(id)) return false;
  return (state.researchPoints ?? 0) >= tech.cost;
}

// Spends the points and unlocks the tech. Returns true on success
// (points are left untouched on failure).
export function research(state, id) {
  if (!canResearch(state, id)) return false;
  const tech = TECHS[id];
  state.researchPoints -= tech.cost;
  state.researched = state.researched ?? [];
  state.researched.push(id);
  pushEvent(state, 'research', `연구 완료: ${tech.name}.`);
  return true;
}

// True when the building definition is available given the researched techs.
export function isUnlocked(state, def) {
  return !def.requiresTech || (state.researched ?? []).includes(def.requiresTech);
}
