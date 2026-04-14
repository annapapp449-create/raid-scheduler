// WoW 天赋数据 - WotLK 80级全天赋

export const TANK_SPECS = [
  { id: 'warrior_prot',      name: '防战', cls: 'warrior' },
  { id: 'paladin_prot',      name: '防骑', cls: 'paladin' },
  { id: 'dk_blood',          name: '血DK', cls: 'dk' },
  { id: 'druid_feral_bear',  name: '熊德', cls: 'druid' },
];

export const HEALER_SPECS = [
  { id: 'paladin_holy',      name: '奶骑', cls: 'paladin' },
  { id: 'priest_disc',       name: '戒律', cls: 'priest' },
  { id: 'priest_holy',       name: '神牧', cls: 'priest' },
  { id: 'shaman_restoration', name: '奶萨', cls: 'shaman' },
  { id: 'druid_restoration',  name: '奶德', cls: 'druid' },
];

export const DPS_SPECS = [
  // 战士
  { id: 'warrior_fury',    name: '狂暴战', cls: 'warrior' },
  { id: 'warrior_arms',    name: '武器战', cls: 'warrior' },
  // 骑士
  { id: 'paladin_ret',     name: '惩戒骑', cls: 'paladin' },
  // 猎人
  { id: 'hunter_beast',    name: '兽王猎', cls: 'hunter' },
  { id: 'hunter_marks',    name: '射击猎', cls: 'hunter' },
  { id: 'hunter_surv',     name: '生存猎', cls: 'hunter' },
  // 盗贼
  { id: 'rogue_ass',       name: '刺杀贼', cls: 'rogue' },
  { id: 'rogue_combat',    name: '战斗贼', cls: 'rogue' },
  { id: 'rogue_sub',       name: '敏锐贼', cls: 'rogue' },
  // 牧师
  { id: 'priest_shadow',   name: '暗牧',   cls: 'priest' },
  // 萨满
  { id: 'shaman_elem',     name: '元素萨', cls: 'shaman' },
  { id: 'shaman_enhance',  name: '增强萨', cls: 'shaman' },
  // 法师
  { id: 'mage_arcane',     name: '奥法',   cls: 'mage' },
  { id: 'mage_fire',       name: '火法',   cls: 'mage' },
  { id: 'mage_frost',      name: '冰法',   cls: 'mage' },
  // 术士
  { id: 'warlock_affli',   name: '痛苦术', cls: 'warlock' },
  { id: 'warlock_demo',    name: '恶魔术', cls: 'warlock' },
  { id: 'warlock_destro',  name: '毁灭术', cls: 'warlock' },
  // 德鲁伊
  { id: 'druid_balance',   name: '鸟德',   cls: 'druid' },
  { id: 'druid_feral_cat', name: '猫德',   cls: 'druid' },
  // 死骑
  { id: 'dk_unholy',       name: '邪DK',   cls: 'dk' },
  { id: 'dk_frost',        name: '冰DK',   cls: 'dk' },
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
