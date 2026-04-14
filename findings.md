# 研究发现 - WoW 时光服开团报名工具

## 技术栈

| 类别 | 选择 | 理由 |
|------|------|------|
| 前端框架 | React 19 (函数组件 + Hooks) | 成熟生态 |
| 构建工具 | Vite 6.x | 快速 HMR |
| 样式方案 | Tailwind CSS v4 | 原子化 CSS |
| 路由 | React Router v7 (Hash 模式) | 微信兼容性 |
| 后端 | LeanCloud | 国内 BaaS，免费额度 |
| 部署 | Vercel | 免费自动部署 |

---

## 时光服 P1-P10 团本数据

### 副本总览

| 阶段 | 副本 ID | 中文名 | 等级 | 装等 | 内置包片 |
|------|---------|--------|------|------|----------|
| P1 | mc | 熔火之心 | 25 | 200-213 | ❌ |
| P2 | tss | 毒蛇神殿 | 25 | 219-226 | ❌ |
| P2 | brm | 风暴要塞 | 25 | 219-226 | ❌ |
| P3 | naxx | 纳克萨玛斯 | 25 | 226-232 | ✅ |
| P3 | os | 黑曜石圣殿 | 25 | 226-232 | ❌ |
| P3 | eoe | 永恒之眼 | 25 | 226-232 | ❌ |
| P4 | zg | 祖尔格拉布 | 25 | 232-238 | ❌ |
| P4 | toc | 十字军的试炼 | 25 | 232-238 | ❌ |
| P4 | vault | 阿尔卡冯的宝库 | 25 | 232-238 | ❌ |
| P5 | zam | 祖阿曼 | 25 | 238-245 | ❌ |
| P5 | swp | 太阳之井高地 | 25 | 238-245 | ❌ |
| P6 | uld | 奥杜尔 | 25 | 245-252 | ❌ |
| P7 | kara | 卡拉赞 | 25 | 251-258 | ❌ |
| P7 | gruul | 格鲁尔的巢穴 | 25 | 251-258 | ❌ |
| P7 | mag | 玛瑟里顿的巢穴 | 25 | 251-258 | ❌ |
| P8 | bwl | 黑翼之巢 | 25 | 258-265 | ❌ |
| P8 | onyxia | 奥妮克希亚的巢穴 | 25 | 258-265 | ❌ |
| P8 | aq20 | 安其拉废墟 | 25 | 258-265 | ❌ |
| P9 | aq40 | 安其拉神殿 | 25 | 265-270 | ❌ |
| P10 | icc | 冰冠堡垒 | 25 | 272-284 | ❌ |
| P10 | rs | 红玉圣殿 | 25 | 272-284 | ❌ |

### 各阶段核心内容

| 阶段 | 核心副本 | 橙武 | 特色 |
|------|----------|------|------|
| P1 | 熔火之心 | 萨弗拉斯（橙锤） | 首发阶段 |
| P2 | 毒蛇+风暴 | 逐风者之剑 | 掉落凤凰坐骑 |
| P3 | NAXX+OS+EoE | 埃提耶什（橙杖） | T3 套装 |
| P4 | ZG+TOC+宝库 | 玛尔沃鲁斯碎片 | TOC 无小怪速刷 |
| P5 | ZAM+太阳井 | 索利达尔（橙弓） | 物理系毕业 |
| P6 | 奥杜尔 | 瓦兰奈尔（橙锤） | 困难模式+零灯 |
| P7 | 卡拉赞+格鲁尔+玛瑟里顿 | — | 休闲/小号追赶 |
| P8 | BWL+奥妮克希亚+废墟 | 风剑材料 | 60级经典回归 |
| P9 | 安其拉神殿 | — | 保留开门事件 |
| P10 | 冰冠堡垒+红玉圣殿 | 影之哀伤 | 终极毕业 |

---

## 职业天赋体系（时光服 WotLK 80级）

### 10职业 × 3天赋专精

| 职业 | 天赋1 | 天赋2 | 天赋3 |
|------|-------|-------|-------|
| 战士 | 武器战 (DPS) | 狂暴战 (DPS) | 防护 (坦克) |
| 圣骑士 | 神圣 (治疗) | 防护 (坦克) | 惩戒 (DPS) |
| 死亡骑士 | 血魄 (坦克) | 冰霜 (DPS) | 邪恶 (DPS) |
| 猎人 | 野兽控制 (DPS) | 射击 (DPS) | 生存 (DPS) |
| 盗贼 | 刺杀 (DPS) | 战斗 (DPS) | 敏锐 (DPS) |
| 萨满 | 元素 (DPS) | 增强 (DPS) | 恢复 (治疗) |
| 法师 | 奥术 (DPS) | 火焰 (DPS) | 冰霜 (DPS) |
| 术士 | 痛苦 (DPS) | 恶魔学 (DPS) | 毁灭 (DPS) |
| 牧师 | 戒律 (治疗) | 神圣 (治疗) | 暗影 (DPS) |
| 德鲁伊 | 平衡 (DPS) | 野性熊/猫 (坦克/DPS) | 恢复 (治疗) |

### 角色定位规则

- **选择天赋专精后，角色定位自动识别**（坦克/治疗/DPS）
- 无需单独选择角色定位
- 数据模型中 `playerRole` 由 `playerSpec` 推导得出

---

## 数据模型

### RaidSchedule（开团计划）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| instanceId | String | ✅ | 副本 ID（如 naxx, toc, icc）|
| raidSize | Number | ✅ | 固定 25 |
| characterName | String | ✅ | 本次开团角色名 |
| dayOfWeek | Number | ✅ | 0=周日 ~ 6=周六 |
| startTime | String | ✅ | "HH:mm" |
| weekKey | String | ✅ | "2026-W16" |
| fragmentEnabled | Boolean | ✅ | 是否开启包片 |
| fragmentStatus | String | — | "open" / "reserved" |
| signupCount | Number | ✅ | 当前报名人数 |
| status | String | ✅ | "recruiting" / "full" / "closed" |

### Signup（报名）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| schedule | Pointer | ✅ | 关联团次 |
| playerName | String | ✅ | 角色名 |
| playerServer | String | ✅ | 服务器 |
| playerClass | String | ✅ | 职业 ID |
| playerSpec | String | ✅ | 天赋专精 ID（如 paladin_holy） |
| playerRole | String | ✅ | tank / healer / dps（自动从 spec 推导）|
| contactInfo | String | — | 联系方式（选填） |
| status | String | ✅ | "confirmed" / "cancelled" |

---

## 路由设计

| 路由 | 页面 | 用途 |
|------|------|------|
| /#/create | CreateLeader | 团长首次创建身份 |
| /#/leader/{shareId} | LeaderDashboard | 团长管理面板 |
| /#/r/{shareId} | RaidSignup | 玩家扫码报名页 |

---

## UI 设计方向

**主题**：暗黑·冰冠风格
**色板**：

```css
--bg-primary: #0f1117;
--bg-secondary: #1a1d27;
--bg-tertiary: #242836;
--text-primary: #e8eaed;
--text-secondary: #9aa0b0;
--color-frost: #4fc3f7;
--color-plague: #66bb6a;
--color-ember: #ffa726;
--color-blood: #ef5350;
```

---

## 决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-04-13 | Hash 路由 | 微信内置浏览器兼容性最好 |
| 2026-04-13 | LeanCloud 作为后端 | 国内直连无延迟，中文文档 |
| 2026-04-14 | 沿用白皮书 P1-P10 阶段 | 时光服专属 10 阶段团本规划 |
| 2026-04-14 | 天赋自动推导角色定位 | 选天赋即确定角色定位，无需额外选择 |
