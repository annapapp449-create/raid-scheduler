// WoW 天赋数据 - WotLK 80级全天赋

export const TANK_SPECS = [
  { id: 'prot_warrior',  name: '防战', cls: 'warrior' },
  { id: 'prot_paladin',  name: '防骑', cls: 'paladin' },
  { id: 'blood_dk',      name: '血DK', cls: 'dk' },
  { id: 'bear_druid',    name: '熊德', cls: 'druid' },
];

export const HEALER_SPECS = [
  { id: 'holy_paladin',  name: '奶骑', cls: 'paladin' },
  { id: 'disc_priest',   name: '戒律', cls: 'priest' },
  { id: 'holy_priest',   name: '神牧', cls: 'priest' },
  { id: 'resto_shaman',  name: '奶萨', cls: 'shaman' },
  { id: 'resto_druid',   name: '奶德', cls: 'druid' },
];

export const DPS_SPECS = [
  // 战士
  { id: 'fury_warrior',    name: '狂暴战', cls: 'warrior' },
  { id: 'arms_warrior',    name: '武器战', cls: 'warrior' },
  // 骑士
  { id: 'ret_paladin',     name: '惩戒骑', cls: 'paladin' },
  // 猎人
  { id: 'bm_hunter',       name: '兽王猎', cls: 'hunter' },
  { id: 'mm_hunter',       name: '射击猎', cls: 'hunter' },
  { id: 'sv_hunter',       name: '生存猎', cls: 'hunter' },
  // 盗贼
  { id: 'assa_rogue',      name: '刺杀贼', cls: 'rogue' },
  { id: 'combat_rogue',    name: '战斗贼', cls: 'rogue' },
  { id: 'sub_rogue',       name: '敏锐贼', cls: 'rogue' },
  // 牧师
  { id: 'shadow_priest',   name: '暗牧',   cls: 'priest' },
  // 萨满
  { id: 'ele_shaman',      name: '元素萨', cls: 'shaman' },
  { id: 'enh_shaman',      name: '增强萨', cls: 'shaman' },
  // 法师
  { id: 'arcane_mage',     name: '奥法',   cls: 'mage' },
  { id: 'fire_mage',       name: '火法',   cls: 'mage' },
  { id: 'frost_mage',      name: '冰法',   cls: 'mage' },
  // 术士
  { id: 'affliction_lock', name: '痛苦术', cls: 'warlock' },
  { id: 'demo_lock',       name: '恶魔术', cls: 'warlock' },
  { id: 'destro_lock',     name: '毁灭术', cls: 'warlock' },
  // 德鲁伊
  { id: 'moonkin',         name: '鸟德',   cls: 'druid' },
  { id: 'feral_druid',     name: '猫德',   cls: 'druid' },
  // 死骑
  { id: 'unholy_dk',       name: '邪DK',   cls: 'dk' },
  { id: 'frost_dk',        name: '冰DK',   cls: 'dk' },
];

// 角色定位配置
export const ROLE_CONFIG = [
  { key: 'tank',   label: '坦克', icon: '🛡', specs: TANK_SPECS,   min: 1, max: 4,  defaultCount: 3 },
  { key: 'healer', label: '治疗', icon: '✚',  specs: HEALER_SPECS, min: 2, max: 8,  defaultCount: 4 },
  { key: 'dps',    label: '输出', icon: '⚔',  specs: DPS_SPECS,    min: 0, max: 23, defaultCount: 18 },
];

// 嗜血/英勇检查列表
export const BLOODLUST_SPECS = [
  'resto_shaman', 'enh_shaman', 'ele_shaman',  // 萨满全天赋
  'arcane_mage', 'fire_mage', 'frost_mage',     // 法师全天赋（时间扭曲）
];

// 根据 specId 获取角色key
export const getRoleKeyBySpecId = (specId) => {
  for (const role of ROLE_CONFIG) {
    if (role.specs.some(spec => spec.id === specId)) {
      return role.key;
    }
  }
  return null;
};

// 预设模板
export const PRESET_TEMPLATE = {
  name: '金团标配',
  tank: 3,
  healer: 4,
  dps: 18,
  specRequirements: [],
};
