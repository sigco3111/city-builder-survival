// Building inspector: right-side detail panel for the selected building.
// A left click on an occupied tile (while placement is idle) selects the
// owning building — any footprint cell resolves to the whole building via
// the grid's occupiedBy id. No DOM access at import time: every element is
// built inside createInspector().

import { findBuilding, isUpgradeable, upgradeBuilding, upgradeCost, MAX_LEVEL, pushEvent } from '../sim/state.js';
import { assignWorker, unassignWorker, setBuildingEnabled, idleCount } from '../sim/survivors.js';
import { countNodesInRange, TILE_YIELDS } from '../sim/extraction.js';
import { effectiveCaps, buildingDailyOutput, canAfford } from '../sim/economy.js';
import { repairCost, startRepair } from '../sim/repair.js';
import { getModifiers } from '../sim/modifiers.js';
import { garrisonGuns, GARRISON_DAMAGE, GARRISON_FIRE_INTERVAL } from '../zombies/combat.js';
import { getCell } from '../world/grid.js';

const RESOURCE_ICONS = {
  food: '🥫',
  water: '💧',
  wood: '🪵',
  metal: '⚙️',
  energy: '⚡',
  fuel: '⛽',
  research: '🔬',
};

const icon = (resource) => RESOURCE_ICONS[resource] ?? resource;

// Multi-resource cost line: '🪵20 ⚙️10' (same format as the build menu).
function formatCost(cost) {
  const parts = Object.entries(cost).map(
    ([resource, amount]) => `${icon(resource)}${amount}`
  );
  return parts.length > 0 ? parts.join(' ') : '무료';
}

// Rates are projected per day and often fractional (site efficiency):
// one decimal when needed, plain integer otherwise.
const fmtRate = (rate) => {
  const rounded = Math.round(rate * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

// Proximity-row wording for every def with a site-efficiency rule: row
// label plus the adjectives for full/reduced output. Future defs fall back
// to a generic wording.
const PROXIMITY_ROWS = {
  well: { label: '수맥 (Water table)', rich: '풍부', poor: '깊음' },
  hunt: { label: '사냥터 (Hunting grounds)', rich: '풍부', poor: '부족' },
  fish: { label: '물고기 풍부도 (Fish abundance)', rich: '많음', poor: '적음' },
  ranch: { label: '근처 가축 무리 (Nearby herds)', rich: '있음', poor: '멀음' },
};
const PROXIMITY_ROW_FALLBACK = { label: '입지 수율 (Site yield)', rich: '최대', poor: '감소' };

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * Creates the inspector panel inside `root` (the #ui overlay div).
 *
 * @param {HTMLElement} root
 * @param {object} deps
 * @param {object} deps.state game state (live reference, mutated by the sim)
 * @param {object} deps.grid grid from world/grid.js
 * @param {object} deps.input input from core/input.js createInput()
 * @param {object} deps.placement placement controller: mode() and
 *   demolishBuilding(building) (refund + removal handled there)
 * @param {object} deps.visuals building visuals: setEnabled() follows the
 *   on/off toggle (tinta grigia da spento)
 * @param {object} deps.defs building definitions map (BUILDING_DEFS)
 * @returns {{
 *   update: () => void,
 *   deselect: () => void,
 *   selected: () => (object | null),
 *   el: HTMLElement,
 * }}
 * update() is meant to run once per frame: it refreshes the live numbers and
 * closes the panel when the building is gone or placement leaves idle mode.
 */
export function createInspector(root, { state, grid, input, placement, visuals, defs }) {
  let selectedId = null;
  // References to the dynamic elements of the current selection; rebuilt by
  // select() together with the panel content.
  let dyn = {};

  const rootEl = h('div', 'inspector');
  root.appendChild(rootEl);

  // Appends a label/value info row and returns the value element (so dynamic
  // rows can be refreshed without rebuilding the panel).
  function addRow(rows, label, value) {
    const r = h('div', 'inspector-row');
    r.appendChild(h('span', 'inspector-row-label', label));
    const v = h('span', 'inspector-row-value', value);
    r.appendChild(v);
    rows.appendChild(r);
    return v;
  }

  // Rebuilds the whole panel for the newly selected building.
  function select(b) {
    selectedId = b.id;
    dyn = {};
    rootEl.textContent = '';
    const def = defs[b.defId] ?? {};

    const head = h('div', 'inspector-head');
    dyn.titleEl = h('span', 'inspector-title', def.name ?? b.defId);
    head.appendChild(dyn.titleEl);
    const closeBtn = h('button', 'inspector-close', '✖');
    closeBtn.type = 'button';
    closeBtn.title = '닫기';
    closeBtn.addEventListener('click', deselect);
    head.appendChild(closeBtn);
    rootEl.appendChild(head);

    if (def.desc) rootEl.appendChild(h('div', 'inspector-desc', def.desc));

    // HP bar.
    const hpRow = h('div', 'inspector-hp');
    const hpBar = h('span', 'inspector-hp-bar');
    dyn.hpFill = h('span', 'inspector-hp-fill');
    hpBar.appendChild(dyn.hpFill);
    dyn.hpText = h('span', 'inspector-hp-text');
    hpRow.append(hpBar, dyn.hpText);
    rootEl.appendChild(hpRow);

    // Repair button: live prorated cost, refreshed by refreshDynamic().
    // Affordability is advisory (greyed, never disabled): every click either
    // starts the repair or explains what's missing, no silent dead clicks.
    dyn.repairBtn = h('button', 'inspector-repair');
    dyn.repairBtn.type = 'button';
    dyn.repairBtn.addEventListener('click', () => {
      const cur = findBuilding(state, selectedId);
      if (!cur) return;
      const cost = repairCost(cur, defs[cur.defId]);
      if (!canAfford(state, { cost })) {
        pushEvent(state, 'fuel', `자원 부족: 수리에 ${formatCost(cost)} 필요.`);
      } else {
        startRepair(state, cur, defs[cur.defId]);
      }
      update();
    });
    rootEl.appendChild(dyn.repairBtn);

    // Conditional info rows, driven by the definition. Production rows are
    // dynamic: they show the effective per-day rate (staffing, modifiers and
    // site efficiency folded in), refreshed by refreshDynamic().
    const rows = h('div', 'inspector-rows');
    dyn.produceRows = [];
    for (const [resource, amount] of Object.entries(def.produces ?? {})) {
      const suffix = resource === 'energy' && def.energyDayOnly ? ' (낮에만)' : '';
      const valueEl = addRow(rows, '생산', '');
      dyn.produceRows.push({ valueEl, resource, base: amount, suffix });
    }
    for (const [resource, amount] of Object.entries(def.consumes ?? {})) {
      addRow(rows, '소비', `${icon(resource)} ${amount}/일`);
    }
    if (def.requiresEnergy) addRow(rows, '필요', `⚡ ${def.requiresEnergy}/일`);
    if (def.extracts) {
      addRow(rows, '채굴', `${icon(TILE_YIELDS[def.extracts]?.resource)} ${def.extractRate}/일`);
      dyn.nodesValue = addRow(rows, '사거리 내 남은 자원', '');
    }
    if (def.researchRate) addRow(rows, '연구', `🔬 ${def.researchRate}/일`);
    if (def.proximity) {
      dyn.proxRow = PROXIMITY_ROWS[b.defId] ?? PROXIMITY_ROW_FALLBACK;
      dyn.effValue = addRow(rows, dyn.proxRow.label, '');
    }
    if (Object.keys(def.capBonus ?? {}).length > 0) {
      dyn.capValue = addRow(rows, '전력망 용량', '');
    }
    if (def.isTrap) addRow(rows, '함정 피해', `발동당 ${def.trapDamage}`);
    if (b.defId === 'clinic') addRow(rows, '효과', '배고픔·갈증 −15% (직원 배치 시)');
    if (b.defId === 'radio') addRow(rows, '효과', '매일 새벽 +1 생존자 (직원 배치 시)');
    if (b.defId === 'spotlight') addRow(rows, '효과', '타워 +20% 피해 (전력망 활성 시)');
    if (b.defId === 'streetlamp') addRow(rows, '효과', '수비대와 민병대 +25% 피해 (전력망 활성 시)');
    if (b.defId === 'motor') addRow(rows, '효과', '채굴 +25% (전력망 활성 시)');
    if (b.defId === 'road') addRow(rows, '효과', '도로 하나당 채굴 +2% (최대 +40%)');
    if (b.defId === 'garage') addRow(rows, '효과', '채굴 +50% (직원 배치 시)');
    if (b.defId === 'ranch') addRow(rows, '효과', '농장 +15%, 채굴 +10% (직원 배치 시)');
    // Self-defense row: garrison for staffed buildings, militia for the HQ.
    if (!def.isTower && (def.jobs > 0 || b.defId === 'hq')) {
      dyn.garrisonValue = addRow(rows, b.defId === 'hq' ? '민병대' : '수비대', '');
    }
    if (rows.children.length > 0) rootEl.appendChild(rows);

    // Worker management (manual assignment switches the building out of
    // auto-assign inside survivors.js).
    if (def.jobs > 0) {
      const wrap = h('div', 'inspector-workers');
      dyn.minusBtn = h('button', 'inspector-worker-btn', '−');
      dyn.minusBtn.type = 'button';
      dyn.minusBtn.title = '작업자 1명 해제';
      dyn.minusBtn.addEventListener('click', () => {
        const cur = findBuilding(state, selectedId);
        if (cur && unassignWorker(state, cur.id)) update();
      });
      dyn.workersText = h('span', 'inspector-workers-text');
      dyn.plusBtn = h('button', 'inspector-worker-btn', '+');
      dyn.plusBtn.type = 'button';
      dyn.plusBtn.title = '작업자 1명 배치';
      dyn.plusBtn.addEventListener('click', () => {
        const cur = findBuilding(state, selectedId);
        if (cur && assignWorker(state, cur.id, defs)) update();
      });
      dyn.autoBadge = h('span', 'inspector-auto', 'auto');
      dyn.autoBadge.title = '자동 작업자 배치가 활성화되어 있습니다';
      wrap.append(dyn.minusBtn, dyn.workersText, dyn.plusBtn, dyn.autoBadge);
      rootEl.appendChild(wrap);
    }

    const demolishBtn = h('button', 'inspector-demolish', '🔨 철거');
    demolishBtn.type = 'button';
    demolishBtn.title = '이 건물 철거 (일부 환불)';
    demolishBtn.addEventListener('click', () => {
      const cur = findBuilding(state, selectedId);
      if (!cur) {
        deselect();
        return;
      }
      placement.demolishBuilding(cur); // refund + grid/visuals removal
      deselect();
    });

    // On/off toggle next to Demolish: switching off frees the workers and
    // greys out the model via visuals.setEnabled.
    dyn.toggleBtn = h('button', 'inspector-toggle');
    dyn.toggleBtn.type = 'button';
    dyn.toggleBtn.addEventListener('click', () => {
      const cur = findBuilding(state, selectedId);
      if (!cur) return;
      const on = cur.enabled === false;
      setBuildingEnabled(state, cur, on);
      visuals?.setEnabled(cur.id, on);
      update();
    });

    // Potenziamento: solo per edifici che producono, estraggono o torri.
    // Funziona anche da spento: il livello resta alla riattivazione.
    // Affordability advisory come per la riparazione (niente click morti).
    if (isUpgradeable(def)) {
      dyn.upgradeBtn = h('button', 'inspector-upgrade');
      dyn.upgradeBtn.type = 'button';
      dyn.upgradeBtn.addEventListener('click', () => {
        const cur = findBuilding(state, selectedId);
        if (!cur) return;
        const cost = upgradeCost(cur, defs[cur.defId]);
        if (!canAfford(state, { cost })) {
          pushEvent(state, 'fuel', `자원 부족: 업그레이드에 ${formatCost(cost)} 필요.`);
        } else if (upgradeBuilding(state, cur, defs[cur.defId])) {
          // maxHp è cresciuto: rinfresca la tinta danno col nuovo rapporto.
          visuals?.setDamaged(cur.id, cur.maxHp > 0 ? Math.max(0, cur.hp) / cur.maxHp : 1);
        }
        update();
      });
    }

    const actions = h('div', 'inspector-actions');
    actions.append(dyn.toggleBtn);
    if (dyn.upgradeBtn) actions.append(dyn.upgradeBtn);
    actions.append(demolishBtn);
    rootEl.appendChild(actions);

    rootEl.classList.add('open');
    refreshDynamic(b);
  }

  // Refreshes the live numbers (hp, workers, nodes, caps) in place.
  function refreshDynamic(b) {
    const def = defs[b.defId] ?? {};
    const off = b.enabled === false;
    if (dyn.titleEl) {
      // Badge livello: ★2/★3 accanto al nome per gli edifici potenziati.
      const level = b.level ?? 1;
      dyn.titleEl.textContent =
        isUpgradeable(def) && level > 1 ? `${def.name ?? b.defId} ★${level}` : def.name ?? b.defId;
    }
    if (dyn.hpFill) {
      const ratio = b.maxHp > 0 ? Math.max(0, b.hp) / b.maxHp : 0;
      dyn.hpFill.style.width = `${ratio * 100}%`;
      dyn.hpFill.classList.toggle('inspector-hp-fill--low', ratio < 0.5);
    }
    if (dyn.hpText) dyn.hpText.textContent = `${Math.max(0, Math.ceil(b.hp))}/${b.maxHp}`;
    if (dyn.repairBtn) {
      const cost = repairCost(b, def);
      dyn.repairBtn.textContent = b.repairing
        ? '🔧 수리 중…'
        : b.hp < b.maxHp
          ? `🔧 수리 (${formatCost(cost)})`
          : '🔧 수리';
      dyn.repairBtn.title = '시간이 지나며 HP를 회복합니다: 비용은 피해량에 비례합니다';
      dyn.repairBtn.disabled = b.repairing || b.hp >= b.maxHp;
      dyn.repairBtn.setAttribute(
        'aria-disabled',
        String(!dyn.repairBtn.disabled && !canAfford(state, { cost }))
      );
    }
    if (dyn.toggleBtn) {
      dyn.toggleBtn.textContent = off ? '⏻ 다시 켜기' : '⏻ 끄기';
      dyn.toggleBtn.title = off
        ? '이 건물을 다시 켭니다'
        : '건물을 끕니다: 생산·소비가 멈추고 작업자가 해제됩니다';
      dyn.toggleBtn.classList.toggle('inspector-toggle--off', off);
    }
    if (dyn.upgradeBtn) {
      const level = b.level ?? 1;
      const maxed = level >= MAX_LEVEL;
      const cost = upgradeCost(b, def);
      dyn.upgradeBtn.textContent = maxed
        ? '⬆ 최대 레벨'
        : `⬆ 업그레이드 (${formatCost(cost)})`;
      dyn.upgradeBtn.title = maxed
        ? `이 건물은 최대 레벨입니다 (★${MAX_LEVEL})`
        : `건물을 ★${level + 1}로 업그레이드: 생산·채굴·피해 +50%, HP 증가`;
      dyn.upgradeBtn.disabled = maxed;
      dyn.upgradeBtn.setAttribute('aria-disabled', String(!maxed && !canAfford(state, { cost })));
    }
    if (dyn.workersText) dyn.workersText.textContent = `👷 ${b.workers.length}/${def.jobs}`;
    if (dyn.plusBtn) {
      dyn.plusBtn.disabled = off || idleCount(state) === 0 || b.workers.length >= def.jobs;
    }
    if (dyn.minusBtn) dyn.minusBtn.disabled = off || b.workers.length === 0;
    if (dyn.autoBadge) dyn.autoBadge.style.display = b.autoAssign ? '' : 'none';
    if (dyn.produceRows) {
      const output = buildingDailyOutput(b, def, getModifiers(state, grid));
      for (const row of dyn.produceRows) {
        const rate = output[row.resource] ?? 0;
        row.valueEl.textContent =
          Math.abs(rate - row.base) < 0.05
            ? `${icon(row.resource)} ${fmtRate(rate)}/일${row.suffix}`
            : `${icon(row.resource)} ${fmtRate(rate)}/일 (기본 ${row.base})${row.suffix}`;
      }
    }
    if (dyn.nodesValue) {
      dyn.nodesValue.textContent = String(countNodesInRange(grid, b, def.extracts));
    }
    if (dyn.effValue) {
      const eff = b.efficiency ?? 1;
      const word = eff >= 1 ? dyn.proxRow.rich : dyn.proxRow.poor;
      dyn.effValue.textContent = `${word} ×${eff.toFixed(1)}`;
    }
    if (dyn.capValue) {
      // Effective caps (base + every capBonus on the map), one readout per
      // resource this building boosts: '⚡ 150' for a battery.
      const caps = effectiveCaps(state, defs);
      dyn.capValue.textContent = Object.keys(def.capBonus ?? {})
        .map((resource) => `${icon(resource)} ${Math.floor(caps[resource] ?? 0)}`)
        .join(' · ');
    }
    if (dyn.garrisonValue) {
      const guns = garrisonGuns(b, def, idleCount(state));
      const dps = (GARRISON_DAMAGE * guns) / GARRISON_FIRE_INTERVAL;
      dyn.garrisonValue.textContent =
        guns > 0
          ? `${guns}정 소총 · ${fmtRate(dps)} DPS`
          : b.defId === 'hq'
            ? '경비 중인 쉬는 생존자가 없습니다'
            : '직원 없이는 무방비';
    }
  }

  /** Closes the panel and drops the selection. */
  function deselect() {
    selectedId = null;
    dyn = {};
    rootEl.classList.remove('open');
  }

  /** The currently selected building object, or null. */
  function selected() {
    return selectedId == null ? null : findBuilding(state, selectedId);
  }

  /** Per-frame refresh; auto-closes when the selection becomes invalid. */
  function update() {
    if (selectedId == null) return;
    if (placement.mode() !== 'idle') {
      deselect(); // placement/demolish started: the panel gets out of the way
      return;
    }
    const b = findBuilding(state, selectedId);
    if (!b) {
      deselect(); // destroyed or demolished elsewhere
      return;
    }
    refreshDynamic(b);
  }

  // Click selection: only while placement is idle. An occupied tile selects
  // its building (occupiedBy or trap — for traps, which don't block the tile —
  // is the building id, so any footprint cell works); anything else (empty
  // tile, off-map click, active placement) deselects.
  function handleClick(payload) {
    if (placement.mode() !== 'idle') {
      deselect();
      return;
    }
    const cell = payload?.inBounds ? getCell(grid, payload.tileX, payload.tileZ) : null;
    const buildingId = cell?.occupiedBy ?? cell?.trap ?? null;
    const b = buildingId != null ? findBuilding(state, buildingId) : null;
    if (b) select(b);
    else deselect();
  }

  input.on('click', handleClick);

  return { update, deselect, selected, el: rootEl };
}
