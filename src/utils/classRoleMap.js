/**
 * WotLK 80级职业数据
 * key: 职业英文标识（用于数据存储和 CSS class）
 * label: 中文显示名
 * color: 职业代表色（暴雪官方色值）
 * specs: 天赋专精列表
 */
export const CLASS_DATA = {
  warrior: {
    label: "战士",
    color: "#C69B6D",
    specs: [
      { id: "warrior_arms", label: "武器战", role: "dps" },
      { id: "warrior_fury", label: "狂暴战", role: "dps" },
      { id: "warrior_prot", label: "防护", role: "tank" },
    ],
  },
  paladin: {
    label: "圣骑士",
    color: "#F48CBA",
    specs: [
      { id: "paladin_holy", label: "神圣", role: "healer" },
      { id: "paladin_prot", label: "防护", role: "tank" },
      { id: "paladin_ret", label: "惩戒", role: "dps" },
    ],
  },
  deathknight: {
    label: "死亡骑士",
    color: "#C41E3A",
    specs: [
      { id: "dk_blood", label: "血魄", role: "tank" },
      { id: "dk_frost", label: "冰霜", role: "dps" },
      { id: "dk_unholy", label: "邪恶", role: "dps" },
    ],
  },
  hunter: {
    label: "猎人",
    color: "#AAD372",
    specs: [
      { id: "hunter_beast", label: "野兽控制", role: "dps" },
      { id: "hunter_marks", label: "射击", role: "dps" },
      { id: "hunter_surv", label: "生存", role: "dps" },
    ],
  },
  rogue: {
    label: "盗贼",
    color: "#FFF468",
    specs: [
      { id: "rogue_ass", label: "刺杀", role: "dps" },
      { id: "rogue_combat", label: "战斗", role: "dps" },
      { id: "rogue_sub", label: "敏锐", role: "dps" },
    ],
  },
  shaman: {
    label: "萨满",
    color: "#0070DD",
    specs: [
      { id: "shaman_elem", label: "元素", role: "dps" },
      { id: "shaman_enhance", label: "增强", role: "dps" },
      { id: "shaman_restoration", label: "恢复", role: "healer" },
    ],
  },
  mage: {
    label: "法师",
    color: "#3FC7EB",
    specs: [
      { id: "mage_arcane", label: "奥术", role: "dps" },
      { id: "mage_fire", label: "火焰", role: "dps" },
      { id: "mage_frost", label: "冰霜", role: "dps" },
    ],
  },
  warlock: {
    label: "术士",
    color: "#8788EE",
    specs: [
      { id: "warlock_affli", label: "痛苦", role: "dps" },
      { id: "warlock_demo", label: "恶魔学", role: "dps" },
      { id: "warlock_destro", label: "毁灭", role: "dps" },
    ],
  },
  priest: {
    label: "牧师",
    color: "#FFFFFF",
    specs: [
      { id: "priest_disc", label: "戒律", role: "healer" },
      { id: "priest_holy", label: "神圣", role: "healer" },
      { id: "priest_shadow", label: "暗影", role: "dps" },
    ],
  },
  druid: {
    label: "德鲁伊",
    color: "#FF7C0A",
    specs: [
      { id: "druid_balance", label: "平衡", role: "dps" },
      { id: "druid_feral", label: "野性（熊/猫）", role: "tank" },
      { id: "druid_restoration", label: "恢复", role: "healer" },
    ],
  },
};

/**
 * 角色定位数据
 */
export const ROLE_DATA = {
  tank: { label: "坦克", color: "#4fc3f7", bgColor: "rgba(79, 195, 247, 0.15)" },
  healer: { label: "治疗", color: "#66bb6a", bgColor: "rgba(102, 187, 106, 0.15)" },
  dps: { label: "输出", color: "#ef5350", bgColor: "rgba(239, 83, 80, 0.15)" },
};

/**
 * 根据职业 ID 获取职业数据
 */
export const getClassById = (classId) => {
  return CLASS_DATA[classId] || null;
};

/**
 * 根据职业 ID 获取天赋专精列表
 */
export const getSpecsByClassId = (classId) => {
  const classInfo = CLASS_DATA[classId];
  return classInfo ? classInfo.specs : [];
};

/**
 * 根据职业 ID 获取可选角色（从 specs 推导）
 */
export const getAvailableRoles = (classId) => {
  const specs = getSpecsByClassId(classId);
  const roles = [...new Set(specs.map((s) => s.role))];
  return roles;
};

/**
 * 根据天赋 ID 获取天赋数据
 */
export const getSpecById = (specId) => {
  for (const classId of Object.keys(CLASS_DATA)) {
    const spec = CLASS_DATA[classId].specs.find((s) => s.id === specId);
    if (spec) return { ...spec, classId };
  }
  return null;
};

/**
 * 根据职业颜色计算文字颜色（黑或白）
 * 使用相对亮度公式：luminance = 0.299*R + 0.587*G + 0.114*B
 */
export const getTextColorForBackground = (hexColor) => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? "#1a1d27" : "#ffffff";
};

/**
 * 获取职业缩写的第一个字
 */
export const getClassAbbrev = (classId) => {
  const classInfo = CLASS_DATA[classId];
  if (!classInfo) return "?";
  // 取中文名的第一个字
  return classInfo.label.charAt(0);
};
