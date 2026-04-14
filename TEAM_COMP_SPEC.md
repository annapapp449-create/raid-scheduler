# 团队配置模块 — 组件规格说明

> **给 Claude Code 的实现指南。** 本文档定义团队配置模块的完整交互逻辑、数据结构和 UI 规范。用 React 19 + Tailwind CSS 4 实现，不要用 vanilla JS。

---

## 一、模块概述

团长开团时设置 25 人团的职业/天赋需求。采用**三层渐进式配置**：
1. **第一层（必填）**：设定坦克/治疗/输出人数 — 3 个 stepper，3 秒完成
2. **第二层（选填）**：展开后指定具体天赋及数量 — 按需深入
3. **第三层（加速器）**：预设模板 + 自定义模板保存/加载

80% 的团长只用第一层，20% 的硬核团长会展开第二层。

---

## 二、WoW 职业色常量（必须严格使用）

```js
// src/constants/wowClasses.js

export const CLASS_COLORS = {
  warrior:  '#C69B6D',  // 战士 — 棕
  paladin:  '#F48CBA',  // 骑士 — 粉
  hunter:   '#AAD372',  // 猎人 — 绿
  rogue:    '#FFF468',  // 盗贼 — 黄
  priest:   '#FFFFFF',  // 牧师 — 白
  shaman:   '#0070DD',  // 萨满 — 蓝
  mage:     '#3FC7EB',  // 法师 — 浅蓝
  warlock:  '#8788EE',  // 术士 — 紫
  druid:    '#FF7C0A',  // 德鲁伊 — 橙
  dk:       '#C41E3A',  // 死骑 — 红
};
```

这些颜色是 WoW 官方职业色，玩家秒懂，**不要修改**。

---

## 三、天赋数据（完整 WotLK 80 级全天赋）

```js
// src/constants/wowSpecs.js

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

// 嗜血/英勇检查列表（这些天赋可以提供嗜血效果）
export const BLOODLUST_SPECS = [
  'resto_shaman', 'enh_shaman', 'ele_shaman',  // 萨满全天赋
  'arcane_mage', 'fire_mage', 'frost_mage',     // 法师全天赋（时间扭曲）
];
```

---

## 四、数据结构 — LeanCloud 存储

### 4.1 团队配置（嵌入在 Raid 对象中）

```js
// Raid.teamConfig 字段结构
{
  "tank": 3,
  "healer": 4,
  "dps": 18,
  "specRequirements": [
    { "specId": "holy_paladin",  "count": 2, "priority": "required" },
    { "specId": "disc_priest",   "count": 1, "priority": "required" },
    { "specId": "resto_shaman",  "count": 1, "priority": "preferred" }
  ]
}
```

**字段说明：**
- `tank/healer/dps`：各角色定位总人数，三者之和应为 25
- `specRequirements`：团长指定的天赋需求（第二层配置），可为空数组
- `priority`：三档 — `required`（必须）/ `preferred`（优先）/ `open`（可选）
- 某角色下指定天赋的 count 总和 ≤ 该角色总人数，差额为"开放位"

### 4.2 团长自定义模板（挂在 Leader 对象上）

```js
// Leader.savedTemplates 字段结构（JSON 数组，最多 5 个）
[
  {
    "name": "周三固定金团",
    "tank": 3,
    "healer": 4,
    "dps": 18,
    "specRequirements": [
      { "specId": "holy_paladin", "count": 2, "priority": "required" },
      { "specId": "disc_priest",  "count": 1, "priority": "required" }
    ]
  }
]
```

---

## 五、组件拆分

```
src/components/TeamConfig/
├── TeamConfigPanel.jsx      # 主容器：模板栏 + 三个角色区块 + 概览
├── TemplateBar.jsx          # 模板选择/保存/删除
├── RoleSection.jsx          # 单个角色区块（可展开）
├── SpecRow.jsx              # 单个天赋行（职业色圆点 + 名称 + 优先级 + stepper）
├── Stepper.jsx              # 通用 +/- 计数器
├── CompositionBar.jsx       # 底部配置概览（比例条 + 人数校验 + Buff 警告）
└── SaveTemplateModal.jsx    # 保存模板弹窗
```

---

## 六、交互规范（逐条实现）

### 6.1 第一层 — 角色人数 Stepper

- 每个角色定位显示：图标 + 名称 + Stepper（−/数字/+）
- Stepper 范围：见 ROLE_CONFIG 中的 min/max
- **总人数硬约束为 25**：
  - 调整任一角色人数时，不自动联动其他角色（团长手动调）
  - 底部实时显示 `当前 X/25`，不足为橙色，超出为红色，等于 25 为绿色
- 点击角色行空白区域（非 Stepper）展开/收起第二层

### 6.2 第二层 — 天赋指定

- 展开后显示该角色下所有可用天赋
- 每行：职业色圆点 + 天赋名（用职业色渲染文字）+ 优先级标签 + mini Stepper
- mini Stepper：
  - 加号上限 = 该角色总人数 − 该角色下已指定天赋数之和
  - 减号下限 = 0
  - 当 count 从 0 → 1 时自动设置优先级为 `preferred`
  - 当 count 从 1 → 0 时自动移除优先级标签
- 优先级标签：
  - 点击循环切换：`required` → `preferred` → `open` → `required`
  - 视觉样式：required 红底红字 / preferred 金底金字 / open 灰底灰字
- 角色行标题旁显示 `(指定 X 开放 Y)`，X = 已指定天赋数之和，Y = 角色总人数 − X

### 6.3 第三层 — 模板系统

**预设模板（硬编码，1 个）：**
- 金团标配：3 坦 / 4 奶 / 18 DPS，无天赋指定

**自定义模板：**
- 点击「保存当前配置为模板」→ 弹窗输入名称（最多 12 字）→ 保存
- 自定义模板上限 5 个
- 自定义模板标签带 ✕ 删除按钮，预设模板不可删除
- 点击任意模板标签 → 一键填充配置（覆盖当前所有设置）
- 当前激活的模板标签高亮（金色边框）
- 手动修改任何配置后，模板高亮自动取消（表示已偏离模板）

### 6.4 底部概览

- **配比条**：三色横条（蓝=坦克，绿=治疗，红=输出），宽度按比例
- **人数校验**：`X/25`，颜色根据状态变化
- **Buff 警告**（非阻塞）：
  - 仅当团长展开了第二层并指定了至少一个天赋时才检查
  - 检查逻辑：specRequirements 中是否包含 BLOODLUST_SPECS 中的任一天赋
  - 缺少时显示：`缺少嗜血/英勇 — 建议加萨满或法师`
  - 橙色底色，不阻止保存

---

## 七、样式规范

### 暗色主题色板（与全站一致）

```
背景主色：  #1a1a2e
卡片表面：  #16213e
卡片深色：  #1f2f50
边框色：    #2a3a5c
文字主色：  #e8e8e8
文字次要：  #8899aa
金色强调：  #ffd100
绿色（通过）：#00ff96
红色（错误）：#ff4444
橙色（警告）：#ff8c00
```

### Tailwind 自定义类建议

在 `tailwind.config.js` 的 `extend.colors` 中注册上述色板，命名如 `wow-bg`、`wow-surface`、`wow-gold` 等，方便全项目复用。

### 关键 UI 细节

- Stepper 按钮 30×30px，圆角左/右分离
- 职业色圆点 9×9px 实心圆
- 天赋名文字颜色 = 该职业的 CLASS_COLOR（不是白色）
- 优先级标签 padding 2px 6px，圆角 3px
- 展开箭头 ▼，展开时旋转 180°，transition 0.2s
- 模板标签 padding 5px 10px，圆角 6px
- 保存模板弹窗：遮罩层 + 居中卡片，输入框 focus 时边框变金色
- Toast 提示：顶部居中，绿色背景黑字，1.5s 后淡出

---

## 八、Props 接口

```jsx
// TeamConfigPanel 接收的 props
<TeamConfigPanel
  value={teamConfig}           // 当前配置，结构见 4.1
  onChange={(newConfig) => {}}  // 配置变更回调
  savedTemplates={templates}   // 团长已保存的模板数组
  onSaveTemplate={(tpl) => {}} // 保存新模板回调
  onDeleteTemplate={(idx) => {}}// 删除模板回调
/>
```

**TeamConfigPanel 是受控组件**，状态由父组件管理（开团页面）。这样配置数据可以和开团表单的其他字段一起提交到 LeanCloud。

---

## 九、验收标准

1. ✅ 默认显示 3 坦 / 4 奶 / 18 DPS，总计 25
2. ✅ Stepper 在 min/max 范围内正确工作，到达边界时按钮禁用（视觉置灰）
3. ✅ 点击角色行展开/收起天赋面板，带旋转箭头动画
4. ✅ 天赋 mini stepper 不允许超过该角色总人数
5. ✅ 优先级标签点击循环切换，视觉样式随状态变化
6. ✅ 天赋数量归零时优先级标签消失
7. ✅ 金团标配模板一键填充，高亮激活
8. ✅ 保存自定义模板：弹窗 → 输入名称 → 保存 → 标签栏出现
9. ✅ 自定义模板上限 5 个，超出时 toast 提示
10. ✅ 删除自定义模板正常工作
11. ✅ 手动修改配置后模板高亮取消
12. ✅ 底部配比条比例正确，颜色正确
13. ✅ 人数校验颜色：25=绿，<25=橙，>25=红
14. ✅ Buff 警告仅在展开且有指定天赋时才触发检查
15. ✅ 所有天赋名使用对应职业色渲染
16. ✅ 手机端（375px 宽度）布局正常，无溢出
17. ✅ 全部 WotLK 天赋无遗漏：坦克 4 + 治疗 5 + 输出 22 = 31 个天赋
团队配置模块的实现细节见 TEAM_COMP_SPEC.md