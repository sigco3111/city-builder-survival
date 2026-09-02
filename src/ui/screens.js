// Fullscreen overlay screens: title, defeat (endless mode: there is no
// victory screen, the run score is the number of nights survived) and small
// confirmation dialogs. Only one
// screen is visible at a time; the overlay sits above the rest of the UI
// (z-index) and re-enables pointer events. No DOM access at import time.

const TITLE = '라스트 리퓨지 (Last Refuge)';

const INSTRUCTIONS = [
  ['WASD', '카메라 이동'],
  ['마우스 휠', '줌'],
  ['Q / E', '카메라 회전'],
  ['클릭', '건설'],
  ['R', '건물 회전'],
  ['ESC', '취소'],
];

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * Creates the screen manager inside `root` (the #ui overlay div).
 *
 * @param {HTMLElement} root
 * @returns {{
 *   showTitle: (onStart?: () => void, record?: number) => void,
 *   showDefeat: (stats?: object, onRestart?: () => void) => void,
 *   showConfirm: (opts?: object, onConfirm?: () => void, onCancel?: () => void) => void,
 *   hide: () => void,
 * }}
 * `stats` accepts English or Italian keys: days/giorni, kills/uccisioni,
 * survivors/sopravvissuti; an optional `record` (best nights survived) is
 * shown next to the run score. `record` in showTitle adds a best-run line
 * when greater than zero.
 */
export function createScreens(root) {
  let overlay = null;

  /** Removes the current screen, if any. */
  function hide() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function open() {
    hide();
    overlay = h('div', 'screen-overlay');
    root.appendChild(overlay);
    return overlay;
  }

  // Button that hides the screen and then fires the handler.
  function makeButton(label, onClick) {
    const btn = h('button', 'screen-btn', label);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      hide();
      onClick?.();
    });
    return btn;
  }

  function statsGrid(stats = {}) {
    const days = stats.days ?? stats.giorni ?? 0;
    const kills = stats.kills ?? stats.uccisioni ?? 0;
    const survivors = stats.survivors ?? stats.sopravvissuti ?? 0;
    const rows = [
      ['생존 일수', days],
      ['좀비 처치', kills],
      ['생존자', survivors],
    ];
    if (stats.reputation != null) rows.push(['평판', stats.reputation]);
    const grid = h('div', 'screen-stats');
    for (const [label, value] of rows) {
      const stat = h('div', 'screen-stat');
      stat.append(
        h('span', 'screen-stat-label', label),
        h('span', 'screen-stat-value', String(value))
      );
      grid.appendChild(stat);
    }
    return grid;
  }

  /** Title screen: name, tagline, controls, objective and start button. */
  function showTitle(onStart, record = 0) {
    const o = open();
    const panel = h('div', 'screen-panel');
    panel.append(
      h('h1', 'screen-title', TITLE),
      h(
        'p',
        'screen-subtitle',
        '도시는 무너졌습니다. 밤은 언데드의 것입니다. 당신의 피난처를 짓고 끝까지 버텨내세요.'
      )
    );
    const box = h('div', 'screen-instructions');
    for (const [key, action] of INSTRUCTIONS) {
      const row = h('div', 'screen-instruction');
      row.append(h('span', 'screen-key', key), h('span', null, action));
      box.appendChild(row);
    }
    panel.appendChild(box);
    panel.appendChild(
      h('p', 'screen-goal', '목표: 가능한 한 오래 살아남으세요.')
    );
    if (record > 0) {
      panel.appendChild(
        h('p', 'screen-record', `최고 기록: ${record}번째 밤까지 생존`)
      );
    }
    panel.appendChild(makeButton('게임 시작', onStart));
    o.appendChild(panel);
  }

  function endScreen({ title, subtitle, titleClass }, stats, onRestart) {
    const o = open();
    const panel = h('div', 'screen-panel');
    panel.append(
      h('h1', `screen-title ${titleClass}`, title),
      h('p', 'screen-subtitle', subtitle),
      statsGrid(stats),
      makeButton('다시 하기', onRestart)
    );
    o.appendChild(panel);
  }

  /** Defeat screen: nights survived as the run score, plus a restart button. */
  function showDefeat(stats, onRestart) {
    const days = stats?.days ?? stats?.giorni ?? 1;
    const nights = Math.max(0, days - 1); // the night you die on is not survived
    const record = stats?.record ?? null;
    const score =
      record != null
        ? `생존한 밤: ${nights} — 최고 기록: ${record}.`
        : `생존한 밤: ${nights}.`;
    endScreen(
      {
        title: '피난처가 함락되었습니다',
        subtitle: `${score} 무리가 승리했습니다.`,
        titleClass: 'screen-title--defeat',
      },
      stats,
      onRestart
    );
  }

  /**
   * Confirmation dialog: title, message and confirm/cancel buttons. Both
   * buttons close the overlay and then fire their handler. `opts` accepts
   * title, message, confirmLabel and cancelLabel.
   */
  function showConfirm(
    { title, message, confirmLabel = '확인', cancelLabel = '취소' } = {},
    onConfirm,
    onCancel
  ) {
    const o = open();
    const panel = h('div', 'screen-panel');
    panel.append(
      h('h1', 'screen-title', title),
      h('p', 'screen-subtitle', message),
      makeButton(confirmLabel, onConfirm),
      makeButton(cancelLabel, onCancel)
    );
    o.appendChild(panel);
  }

  return { showTitle, showDefeat, showConfirm, hide };
}
