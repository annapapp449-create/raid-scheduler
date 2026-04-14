/**
 * 时光服团本数据（P1-P10 全阶段）
 * 统一 25 人难度，装备数值基于 80 级框架重制
 */
export const RAID_INSTANCES = [
  // P1
  { id: "mc", label: "熔火之心", shortLabel: "MC", phase: "P1", size: 25, tier: "T1", ilvl: "200-213", hasFragment: false, bossCount: 10 },
  // P2
  { id: "tss", label: "毒蛇神殿", shortLabel: "毒蛇", phase: "P2", size: 25, tier: "T2", ilvl: "219-226", hasFragment: false, bossCount: 6 },
  { id: "brm", label: "风暴要塞", shortLabel: "风暴", phase: "P2", size: 25, tier: "T2", ilvl: "219-226", hasFragment: false, bossCount: 4 },
  // P3
  { id: "naxx", label: "纳克萨玛斯", shortLabel: "NAXX", phase: "P3", size: 25, tier: "T3", ilvl: "226-232", hasFragment: true, bossCount: 15 },
  { id: "os", label: "黑曜石圣殿", shortLabel: "OS", phase: "P3", size: 25, tier: "T3", ilvl: "226-232", hasFragment: false, bossCount: 3 },
  { id: "eoe", label: "永恒之眼", shortLabel: "EoE", phase: "P3", size: 25, tier: "T3", ilvl: "226-232", hasFragment: false, bossCount: 3 },
  // P4
  { id: "zg", label: "祖尔格拉布", shortLabel: "ZG", phase: "P4", size: 25, tier: "T4", ilvl: "232-238", hasFragment: false, bossCount: 9 },
  { id: "toc", label: "十字军的试炼", shortLabel: "TOC", phase: "P4", size: 25, tier: "T4", ilvl: "232-238", hasFragment: false, bossCount: 5 },
  { id: "vault", label: "阿尔卡冯的宝库", shortLabel: "宝库", phase: "P4", size: 25, tier: "T4", ilvl: "232-238", hasFragment: false, bossCount: 1 },
  // P5
  { id: "zam", label: "祖阿曼", shortLabel: "ZAM", phase: "P5", size: 25, tier: "T5", ilvl: "238-245", hasFragment: false, bossCount: 4 },
  { id: "swp", label: "太阳之井高地", shortLabel: "SW", phase: "P5", size: 25, tier: "T5", ilvl: "238-245", hasFragment: false, bossCount: 6 },
  // P6
  { id: "uld", label: "奥杜尔", shortLabel: "ULD", phase: "P6", size: 25, tier: "T6", ilvl: "245-252", hasFragment: false, bossCount: 14 },
  // P7
  { id: "kara", label: "卡拉赞", shortLabel: "Kara", phase: "P7", size: 25, tier: "T7", ilvl: "251-258", hasFragment: false, bossCount: 11 },
  { id: "gruul", label: "格鲁尔的巢穴", shortLabel: "Gruul", phase: "P7", size: 25, tier: "T7", ilvl: "251-258", hasFragment: false, bossCount: 2 },
  { id: "mag", label: "玛瑟里顿的巢穴", shortLabel: "Mag", phase: "P7", size: 25, tier: "T7", ilvl: "251-258", hasFragment: false, bossCount: 1 },
  // P8
  { id: "bwl", label: "黑翼之巢", shortLabel: "BWL", phase: "P8", size: 25, tier: "T8", ilvl: "258-265", hasFragment: false, bossCount: 8 },
  { id: "onyxia", label: "奥妮克希亚的巢穴", shortLabel: "Ony", phase: "P8", size: 25, tier: "T8", ilvl: "258-265", hasFragment: false, bossCount: 1 },
  { id: "aq20", label: "安其拉废墟", shortLabel: "AQ20", phase: "P8", size: 25, tier: "T8", ilvl: "258-265", hasFragment: false, bossCount: 6 },
  // P9
  { id: "aq40", label: "安其拉神殿", shortLabel: "AQ40", phase: "P9", size: 25, tier: "T9", ilvl: "265-270", hasFragment: false, bossCount: 9 },
  // P10
  { id: "icc", label: "冰冠堡垒", shortLabel: "ICC", phase: "P10", size: 25, tier: "T10", ilvl: "272-284", hasFragment: false, bossCount: 12 },
  { id: "rs", label: "红玉圣殿", shortLabel: "RS", phase: "P10", size: 25, tier: "T10", ilvl: "272-284", hasFragment: false, bossCount: 1 },
];

export const PHASES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"];

/**
 * 服务器列表
 */
export const SERVERS = [
  "泰坦重铸时光服 I",
  "泰坦重铸时光服 II",
  "泰坦重铸时光服 III",
  "泰坦重铸时光服 IV",
  "泰坦重铸时光服 V",
  "泰坦重铸时光服 VI",
];

/**
 * 星期列表
 */
export const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * 状态配置
 */
export const STATUS_CONFIG = {
  recruiting: { label: "招募中", color: "plague" },
  full: { label: "已满员", color: "ember" },
  closed: { label: "已关闭", color: "bone" },
};

/**
 * 团队配置目标（用于 CompositionBar）
 * 25人团标准配置：2-3坦克 + 5-6治疗 + 16-18 DPS
 */
export const COMPOSITION_TARGETS = {
  tank: { min: 2, max: 3, ideal: 3 },
  healer: { min: 5, max: 6, ideal: 6 },
  dps: { min: 16, max: 18, ideal: 16 },
};

/**
 * 获取副本信息
 */
export const getRaidInstance = (instanceId) => {
  return RAID_INSTANCES.find((r) => r.id === instanceId) || null;
};

/**
 * 获取服务器列表（包含"其他"的备注字段）
 */
export const getServerWithNote = (server) => {
  if (server.includes("其他")) {
    return server;
  }
  return server;
};
