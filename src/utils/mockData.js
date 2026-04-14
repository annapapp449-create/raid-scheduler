/**
 * 模拟数据 - Phase 1 静态 UI 开发用
 * Phase 2 接入 LeanCloud 后删除此文件
 */

export const mockLeader = {
  objectId: "leader_001",
  nickname: "冰火魔王",
  server: "泰坦重铸时光服 I",
  characters: ["冰火魔王", "黑暗游侠", "神圣裁决"],
  editPassword: "123456",
  shareId: "ABC12345",
  createdAt: new Date("2026-04-10"),
};

export const mockSchedules = [
  {
    objectId: "schedule_001",
    leader: { objectId: "leader_001" },
    instanceId: "naxx",
    raidSize: 25,
    characterName: "冰火魔王",
    dayOfWeek: 6,
    startTime: "20:00",
    weekKey: "2026-W16",
    server: "泰坦重铸时光服 I",
    fragmentEnabled: true,
    fragmentStatus: "reserved",
    fragmentPlayer: "暗影猎手",
    fragmentServer: "泰坦重铸时光服 I",
    signupCount: 25,
    status: "full",
    note: "P3 NAXX全通，老成员优先",
  },
  {
    objectId: "schedule_002",
    leader: { objectId: "leader_001" },
    instanceId: "swp",
    raidSize: 25,
    characterName: "神圣裁决",
    dayOfWeek: 4,
    startTime: "21:00",
    weekKey: "2026-W15",
    server: "泰坦重铸时光服 I",
    fragmentEnabled: false,
    fragmentStatus: null,
    fragmentPlayer: null,
    fragmentServer: null,
    signupCount: 25,
    status: "closed",
    note: "P5 SW已通关",
  },
  {
    objectId: "schedule_003",
    leader: { objectId: "leader_001" },
    instanceId: "toc",
    raidSize: 25,
    characterName: "黑暗游侠",
    dayOfWeek: 2,
    startTime: "20:30",
    weekKey: "2026-W17",
    server: "泰坦重铸时光服 I",
    fragmentEnabled: true,
    fragmentStatus: "open",
    fragmentPlayer: null,
    fragmentServer: null,
    signupCount: 12,
    status: "recruiting",
    note: "P4 TOC速刷，来老板",
  },
  {
    objectId: "schedule_004",
    leader: { objectId: "leader_001" },
    instanceId: "uld",
    raidSize: 25,
    characterName: "冰火魔王",
    dayOfWeek: 0,
    startTime: "19:30",
    weekKey: "2026-W18",
    server: "泰坦重铸时光服 I",
    fragmentEnabled: false,
    fragmentStatus: null,
    fragmentPlayer: null,
    fragmentServer: null,
    signupCount: 5,
    status: "recruiting",
    note: "P6 奥杜尔开荒，保留困难模式",
  },
];

export const mockSignups = {
  schedule_001: [
    // 坦克 3人
    { objectId: "s001", playerName: "冰霜领主", playerServer: "泰坦重铸时光服 I", playerClass: "deathknight", playerRole: "tank", playerSpec: "dk_frost", contactInfo: "", status: "confirmed" },
    { objectId: "s002", playerName: "死亡骑士T", playerServer: "泰坦重铸时光服 I", playerClass: "deathknight", playerRole: "tank", playerSpec: "dk_blood", contactInfo: "", status: "confirmed" },
    { objectId: "s003", playerName: "德鲁伊坦克", playerServer: "泰坦重铸时光服 I", playerClass: "druid", playerRole: "tank", playerSpec: "druid_feral", contactInfo: "", status: "confirmed" },
    // 治疗 6人
    { objectId: "s004", playerName: "圣光庇护", playerServer: "泰坦重铸时光服 I", playerClass: "paladin", playerRole: "healer", playerSpec: "paladin_holy", contactInfo: "", status: "confirmed" },
    { objectId: "s005", playerName: "自然之愈", playerServer: "泰坦重铸时光服 I", playerClass: "druid", playerRole: "healer", playerSpec: "druid_restoration", contactInfo: "", status: "confirmed" },
    { objectId: "s006", playerName: "暗影牧师", playerServer: "泰坦重铸时光服 I", playerClass: "priest", playerRole: "healer", playerSpec: "priest_disc", contactInfo: "shadow456", status: "confirmed" },
    { objectId: "s007", playerName: "风暴之怒", playerServer: "泰坦重铸时光服 I", playerClass: "shaman", playerRole: "healer", playerSpec: "shaman_restoration", contactInfo: "", status: "confirmed" },
    { objectId: "s008", playerName: "戒律牧师", playerServer: "泰坦重铸时光服 I", playerClass: "priest", playerRole: "healer", playerSpec: "priest_disc", contactInfo: "", status: "confirmed" },
    { objectId: "s009", playerName: "奶德", playerServer: "泰坦重铸时光服 I", playerClass: "druid", playerRole: "healer", playerSpec: "druid_restoration", contactInfo: "", status: "confirmed" },
    // DPS 16人
    { objectId: "s010", playerName: "暗影猎手", playerServer: "泰坦重铸时光服 I", playerClass: "hunter", playerRole: "dps", playerSpec: "hunter_marks", contactInfo: "yin123", status: "confirmed" },
    { objectId: "s011", playerName: "火焰风暴", playerServer: "泰坦重铸时光服 I", playerClass: "mage", playerRole: "dps", playerSpec: "mage_fire", contactInfo: "fire123", status: "confirmed" },
    { objectId: "s012", playerName: "盗贼之王", playerServer: "泰坦重铸时光服 I", playerClass: "rogue", playerRole: "dps", playerSpec: "rogue_combat", contactInfo: "rogue789", status: "confirmed" },
    { objectId: "s013", playerName: "术士领主", playerServer: "泰坦重铸时光服 I", playerClass: "warlock", playerRole: "dps", playerSpec: "warlock_destro", contactInfo: "", status: "confirmed" },
    { objectId: "s014", playerName: "战士之心", playerServer: "泰坦重铸时光服 I", playerClass: "warrior", playerRole: "dps", playerSpec: "warrior_fury", contactInfo: "", status: "confirmed" },
    { objectId: "s015", playerName: "猎人印记", playerServer: "泰坦重铸时光服 I", playerClass: "hunter", playerRole: "dps", playerSpec: "hunter_surv", contactInfo: "", status: "confirmed" },
    { objectId: "s016", playerName: "法师冰霜", playerServer: "泰坦重铸时光服 I", playerClass: "mage", playerRole: "dps", playerSpec: "mage_frost", contactInfo: "frostmage", status: "confirmed" },
    { objectId: "s017", playerName: "萨满元素", playerServer: "泰坦重铸时光服 I", playerClass: "shaman", playerRole: "dps", playerSpec: "shaman_elem", contactInfo: "shaman123", status: "confirmed" },
    { objectId: "s018", playerName: "牧师暗影", playerServer: "泰坦重铸时光服 I", playerClass: "priest", playerRole: "dps", playerSpec: "priest_shadow", contactInfo: "", status: "confirmed" },
    { objectId: "s019", playerName: "盗贼敏锐", playerServer: "泰坦重铸时光服 I", playerClass: "rogue", playerRole: "dps", playerSpec: "rogue_sub", contactInfo: "", status: "confirmed" },
    { objectId: "s020", playerName: "术士痛苦", playerServer: "泰坦重铸时光服 I", playerClass: "warlock", playerRole: "dps", playerSpec: "warlock_affli", contactInfo: "warlock666", status: "confirmed" },
    { objectId: "s021", playerName: "法师奥术", playerServer: "泰坦重铸时光服 I", playerClass: "mage", playerRole: "dps", playerSpec: "mage_arcane", contactInfo: "", status: "confirmed" },
    { objectId: "s022", playerName: "战士武器", playerServer: "泰坦重铸时光服 I", playerClass: "warrior", playerRole: "dps", playerSpec: "warrior_arms", contactInfo: "", status: "confirmed" },
    { objectId: "s023", playerName: "萨满增强", playerServer: "泰坦重铸时光服 I", playerClass: "shaman", playerRole: "dps", playerSpec: "shaman_enhance", contactInfo: "", status: "confirmed" },
    { objectId: "s024", playerName: "惩戒骑士", playerServer: "泰坦重铸时光服 I", playerClass: "paladin", playerRole: "dps", playerSpec: "paladin_ret", contactInfo: "", status: "confirmed" },
    { objectId: "s025", playerName: "暗牧", playerServer: "泰坦重铸时光服 I", playerClass: "priest", playerRole: "dps", playerSpec: "priest_shadow", contactInfo: "", status: "confirmed" },
  ],
  schedule_002: Array.from({ length: 25 }, (_, i) => ({
    objectId: `s2_${i}`,
    playerName: `成员${i + 1}`,
    playerServer: "泰坦重铸时光服 I",
    playerClass: ["warrior", "paladin", "deathknight", "hunter", "rogue", "shaman", "mage", "warlock", "priest", "druid"][i % 10],
    playerRole: i < 3 ? "tank" : i < 9 ? "healer" : "dps",
    playerSpec: null,
    contactInfo: "",
    status: "confirmed",
  })),
  schedule_003: [
    { objectId: "s3_1", playerName: "法师奥术", playerServer: "泰坦重铸时光服 I", playerClass: "mage", playerRole: "dps", playerSpec: "mage_arcane", contactInfo: "", status: "confirmed" },
    { objectId: "s3_2", playerName: "萨满恢复", playerServer: "泰坦重铸时光服 I", playerClass: "shaman", playerRole: "healer", playerSpec: "shaman_restoration", contactInfo: "shaman789", status: "confirmed" },
    { objectId: "s3_3", playerName: "牧师神圣", playerServer: "泰坦重铸时光服 I", playerClass: "priest", playerRole: "healer", playerSpec: "priest_holy", contactInfo: "", status: "confirmed" },
    { objectId: "s3_4", playerName: "德鲁伊平衡", playerServer: "泰坦重铸时光服 I", playerClass: "druid", playerRole: "dps", playerSpec: "druid_balance", contactInfo: "balance123", status: "confirmed" },
    { objectId: "s3_5", playerName: "战士武器", playerServer: "泰坦重铸时光服 I", playerClass: "warrior", playerRole: "dps", playerSpec: "warrior_arms", contactInfo: "", status: "confirmed" },
    { objectId: "s3_6", playerName: "圣骑士惩戒", playerServer: "泰坦重铸时光服 I", playerClass: "paladin", playerRole: "dps", playerSpec: "paladin_ret", contactInfo: "", status: "confirmed" },
    { objectId: "s3_7", playerName: "术士毁灭", playerServer: "泰坦重铸时光服 I", playerClass: "warlock", playerRole: "dps", playerSpec: "warlock_destro", contactInfo: "", status: "confirmed" },
    { objectId: "s3_8", playerName: "猎人兽王", playerServer: "泰坦重铸时光服 I", playerClass: "hunter", playerRole: "dps", playerSpec: "hunter_beast", contactInfo: "", status: "confirmed" },
  ],
  schedule_004: [
    { objectId: "s4_1", playerName: "DK邪恶", playerServer: "泰坦重铸时光服 I", playerClass: "deathknight", playerRole: "dps", playerSpec: "dk_unholy", contactInfo: "", status: "confirmed" },
    { objectId: "s4_2", playerName: "盗贼刺杀", playerServer: "泰坦重铸时光服 I", playerClass: "rogue", playerRole: "dps", playerSpec: "rogue_ass", contactInfo: "assrogue", status: "confirmed" },
    { objectId: "s4_3", playerName: "奶德", playerServer: "泰坦重铸时光服 I", playerClass: "druid", playerRole: "healer", playerSpec: "druid_restoration", contactInfo: "", status: "confirmed" },
  ],
};

/**
 * 获取报名的组成统计
 */
export const getSignupComposition = (signups) => {
  const composition = { tank: 0, healer: 0, dps: 0 };
  signups.forEach((signup) => {
    if (composition[signup.playerRole] !== undefined) {
      composition[signup.playerRole]++;
    }
  });
  return composition;
};
