// First-run tutorial: a small non-blocking hint card anchored above the
// bottom build menu. It walks a brand-new colony through the first day —
// camera, first beds, food & water, worker assignment, night prep — purely
// by watching state deltas and the drained events (read-only: nothing here
// touches the sim, and the game never pauses). Shown once ever: the
// 'cbs-tutorial-seen' localStorage flag is written when the last step is
// reached or the player skips, so a later ?new=1 run does not show it again.
// No DOM access at import time — everything is built inside
// createTutorial().

import { BUILDING_DEFS } from '../buildings/definitions.js';

const SEEN_KEY = 'cbs-tutorial-seen';
const CAMERA_STEP_SECONDS = 8; // step 1 also closes on the first camera input
const GOODBYE_SECONDS = 6; // how long the closing 'Good luck!' card stays up

/** True once the tutorial has been completed or skipped on this browser. */
export function tutorialSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    // Storage unavailable: don't nag every session — treat it as seen.
    return true;
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage unavailable: the flag just won't persist.
  }
}

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * Creates the tutorial card inside `root` (the #ui overlay div).
 *
 * @param {HTMLElement} root
 * @returns {{
 *   update: (dt: number, state: object, cameraInput?: boolean) => void,
 *   onEvents: (events: Array<object>) => void,
 *   el: HTMLElement,
 * }}
 * update(dt, state, cameraInput) is meant to be called once per frame with
 * real (unscaled) dt; cameraInput tells whether the player panned/rotated/
 * zoomed the camera this frame. onEvents receives the events drained from
 * state.events (see drainEvents in main.js).
 */
export function createTutorial(root) {
  // Building names follow BUILDING_DEFS, so the card always matches the
  // build menu labels.
  const defName = (id, fallback) => BUILDING_DEFS[id]?.name ?? fallback;

  const steps = [
    `👋 환영합니다! 이곳은 당신의 정착지입니다. WASD로 카메라를 움직이고, 마우스 휠로 줌, Q / E로 회전할 수 있습니다.`,
    `생존자에게는 침대가 필요합니다. 아래 메뉴에서 ${defName('tent', 'Tent')} 또는 ${defName('house', 'House')}를 지어주세요.`,
    `이제 보급을 확보하세요: ${defName('garden', 'Garden')}이나 ${defName('farm', 'Farm')} 같은 식량 공급원과 ${defName('well', 'Well')}을 건설하세요.`,
    `건물은 직원이 있어야 작동합니다: 상단 바의 👷 패널을 열거나 건물을 선택한 뒤 +/− 버튼으로 작업자를 배치하세요.`,
    `밤에는 좀비가 몰려옵니다. 벽(${defName('palisade', 'Palisade')})과 ${defName('tower', 'Watch Tower')}를 세우고, 전력망(${defName('solar', 'Solar Panel')}, ${defName('wind', 'Wind Turbine')}, ${defName('generator', 'Generator')})을 충전 상태로 유지하세요.`,
    `🍀 행운을 빕니다! 가능한 한 많은 밤을 살아남으세요.`,
  ];

  let index = 0;
  let stepTime = 0;
  let done = false;
  let sawBuild = false; // first 'build' event (any building) closes step 2

  const rootEl = h('div', 'tutorial');
  const card = h('div', 'tutorial-card');
  const stepEl = h('div', 'tutorial-step');
  const textEl = h('div', 'tutorial-text');
  const skipBtn = h('button', 'tutorial-skip', '튜토리얼 건너뛰기');
  skipBtn.type = 'button';
  card.append(stepEl, textEl, skipBtn);
  rootEl.appendChild(card);
  root.appendChild(rootEl);

  function render() {
    stepEl.textContent = `단계 ${index + 1} / ${steps.length}`;
    textEl.textContent = steps[index];
  }

  function dismiss(persist) {
    done = true;
    rootEl.remove();
    if (persist) markTutorialSeen();
  }

  skipBtn.addEventListener('click', () => dismiss(true));

  const hasFoodSource = (state) =>
    state.buildings.some((b) => (BUILDING_DEFS[b.defId]?.produces?.food ?? 0) > 0);
  const hasWell = (state) => state.buildings.some((b) => b.defId === 'well');

  function stepComplete(state, cameraInput) {
    switch (index) {
      case 0: // welcome + camera: a few seconds or the first camera input
        return cameraInput || stepTime >= CAMERA_STEP_SECONDS;
      case 1: // first building placed
        return sawBuild;
      case 2: // a food source and a well standing
        return hasFoodSource(state) && hasWell(state);
      case 3: // any building staffed
        return state.buildings.some((b) => b.workers.length > 0);
      case 4: // the first night has started
        return state.phase === 'night';
      default: // closing card: a few seconds, then it goes away by itself
        return stepTime >= GOODBYE_SECONDS;
    }
  }

  /** Advances the step machine; called once per frame with real dt. */
  function update(dt, state, cameraInput = false) {
    if (done) return;
    if (state.gameOver) {
      dismiss(false); // run over: no flag, the next fresh game shows it again
      return;
    }
    stepTime += dt;
    if (!stepComplete(state, cameraInput)) return;
    if (index === steps.length - 1) {
      dismiss(false); // the flag was written when the closing card appeared
      return;
    }
    index += 1;
    stepTime = 0;
    render();
    if (index === steps.length - 1) markTutorialSeen(); // tutorial completed
  }

  /** Observes the events drained from state.events (see main.js). */
  function onEvents(events) {
    if (done) return;
    for (const e of events) {
      if (e.type === 'build') sawBuild = true;
    }
  }

  render();
  return { update, onEvents, el: rootEl };
}
