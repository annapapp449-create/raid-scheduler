# CLAUDE.md — 时光服开团报名工具（WoW Raid Scheduler）

> **给 Claude Code 的开发指南。** 本文档是这个项目的唯一真相来源（Single Source of Truth）。所有开发决策、代码风格、技术选型都以本文档为准。

---

## 一、项目背景与业务上下文

### 这是什么
一个面向魔兽世界时光服（WotLK）团长和玩家的 **H5 开团报名工具**，在微信内打开使用。团长创建开团计划，生成二维码/链接发到微信群，玩家扫码一键报名。

### 业务场景
时光服团长每周组织多次 25 人（或 10 人）团本。团长需要：
- 发布每周开团时间表
- 收集报名，掌握团队职业/角色配置
- 管理特殊资源分配（如纳克萨玛斯橙杖碎片包片）

玩家需要：
- 快速查看团长的开团计划
- 一键报名，不用在群里反复接龙
- 知道当前团队还缺什么职业/位置

### 核心价值主张
**替代微信群接龙。** 群接龙无法显示职业配置、无法限制人数、信息混乱。这个工具让团长 30 秒开团、玩家 10 秒报名、双方一目了然。

### MVP 边界——严格遵守
- ✅ 团长发布开团计划 + 玩家扫码报名（核心）
- ✅ 职业/角色定位展示 + 团队配置概览
- ✅ 包片预约作为可选功能（团长可为某个团开启）
- ✅ 微信 H5 直接打开，无需登录注册
- ❌ 不做装等检查（没有 API 可用）
- ❌ 不做自动分配团队位置
- ❌ 不做 DKP / 拍卖 / 分金记录
- ❌ 不做聊天/私信功能
- ❌ 不做微信小程序（先 H5 验证）

---

## 二、技术栈（严格遵守，不要自行替换）

| 层级 | 技术 | 版本要求 | 说明 |
|------|------|----------|------|
| 构建工具 | Vite | ^6.x | 快速 HMR |
| 前端框架 | React | ^19.x | 函数组件 + Hooks |
| 样式方案 | Tailwind CSS | ^4.x | 原子化 CSS，移动优先 |
| 路由 | React Router | ^7.x | Hash 模式（微信兼容） |
| 后端/数据库 | LeanCloud | JS SDK ^5.x | 国内 BaaS，免费额度 |
| 二维码生成 | qrcode.react | ^4.x | 纯前端生成 |
| 部署 | Vercel | — | 免费，自动部署 |
| 包管理器 | npm | — | 不用 yarn/pnpm |

### 关键选型理由
- **Hash 路由**：`/#/path` 在微信内置浏览器兼容性最好，不会触发 OAuth 跳转问题
- **LeanCloud**：国内直连无延迟，中文文档，免费额度足够 MVP
- **不用 TypeScript**：MVP 阶段对代码小白来说增加理解门槛，先用 JS

---

## 三、项目结构

```
raid-scheduler/
├── CLAUDE.md                   # 本文件
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                # 挂载入口
│   ├── main.css                # Tailwind 导入 + CSS 变量
│   ├── App.jsx                 # 路由定义
│   ├── leancloud.js            # LeanCloud 初始化
│   ├── pages/
│   │   ├── CreateLeader.jsx    # 团长创建页
│   │   ├── LeaderDashboard.jsx # 团长管理面板
│   │   └── RaidSignup.jsx      # 玩家报名页（分享出去的核心页面）
│   ├── components/
│   │   ├── WeekCalendar.jsx    # 周历/团次列表
│   │   ├── RaidCard.jsx        # 单个团次卡片
│   │   ├── SignupModal.jsx     # 报名弹窗
│   │   ├── SignupList.jsx      # 已报名列表（含职业图标）
│   │   ├── CompositionBar.jsx  # 团队配置进度条（坦克/治疗/输出）
│   │   ├── FragmentBadge.jsx   # 包片状态标记
│   │   ├── ClassIcon.jsx       # 职业图标组件
│   │   ├── QRCodeCard.jsx      # 二维码卡片
│   │   └── Toast.jsx           # 轻提示
│   └── utils/
│       ├── constants.js        # 职业、服务器、副本等常量
│       ├── classRoleMap.js     # 职业→可选角色定位映射
│       └── helpers.js          # 时间格式化、weekKey 生成等
```

---

## 四、游戏数据常量

### 4.1 职业与角色定位映射（WotLK）

放在 `src/utils/classRoleMap.js`：

```javascript
/**
 * WotLK 职业→角色定位映射
 * key: 职业英文标识（用于数据存储和 CSS class）
 * label: 中文显示名
 * color: 职业代表色（暴雪官方色值）
 * roles: 该职业可担任的角色定位
 */
export const CLASS_DATA = {
  warrior:      { label: "战士",   color: "#C69B6D", roles: ["tank", "dps"] },
  paladin:      { label: "圣骑士", color: "#F48CBA", roles: ["tank", "healer", "dps"] },
  deathknight:  { label: "死亡骑士", color: "#C41E3A", roles: ["tank", "dps"] },
  hunter:       { label: "猎人",   color: "#AAD372", roles: ["dps"] },
  rogue:        { label: "盗贼",   color: "#FFF468", roles: ["dps"] },
  shaman:       { label: "萨满",   color: "#0070DD", roles: ["healer", "dps"] },
  mage:         { label: "法师",   color: "#3FC7EB", roles: ["dps"] },
  warlock:      { label: "术士",   color: "#8788EE", roles: ["dps"] },
  priest:       { label: "牧师",   color: "#FFFFFF", roles: ["healer", "dps"] },
  druid:        { label: "德鲁伊", color: "#FF7C0A", roles: ["tank", "healer", "dps"] },
};

export const ROLE_DATA = {
  tank:   { label: "坦克", color: "#4fc3f7", icon: "🛡️" },
  healer: { label: "治疗", color: "#66bb6a", icon: "💚" },
  dps:    { label: "输出", color: "#ef5350", icon: "⚔️" },
};
```

### 4.2 副本列表

放在 `src/utils/constants.js`：

```javascript
export const RAID_INSTANCES = [
  { id: "naxx25",   label: "纳克萨玛斯 25人",  size: 25, hasFragment: true },
  { id: "naxx10",   label: "纳克萨玛斯 10人",  size: 10, hasFragment: true },
  { id: "os25",     label: "黑曜石圣殿 25人",  size: 25, hasFragment: false },
  { id: "os10",     label: "黑曜石圣殿 10人",  size: 10, hasFragment: false },
  { id: "eoe25",    label: "永恒之眼 25人",    size: 25, hasFragment: false },
  { id: "eoe10",    label: "永恒之眼 10人",    size: 10, hasFragment: false },
  { id: "ulduar25", label: "奥杜尔 25人",      size: 25, hasFragment: false },
  { id: "ulduar10", label: "奥杜尔 10人",      size: 10, hasFragment: false },
];

export const SERVERS = [
  "怀旧-哈霍兰",
  "怀旧-比格沃斯",
  "怀旧-范克瑞斯",
  "怀旧-法尔班克斯",
  "怀旧-帕奇维克",
  "怀旧-沙尔图拉",
  "怀旧-维希度斯",
  "怀旧-其他（请备注）",
];

export const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
```

### 4.3 职业图标方案

**不用图片文件。** 用职业代表色 + 首字缩写做圆形徽章：

```
ClassIcon 组件渲染逻辑：
- 圆形 28×28px
- 背景色 = CLASS_DATA[classId].color
- 文字 = CLASS_DATA[classId].label 的第一个字（如"战"、"法"、"猎"）
- 文字颜色 = 深色背景用白字，浅色背景（如盗贼黄、牧师白）用黑字
- 使用相对亮度公式判断：luminance = 0.299*R + 0.587*G + 0.114*B > 186 ? 黑字 : 白字
```

---

## 五、数据模型（LeanCloud 对象）

### 5.1 RaidLeader（团长）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectId | String | 自动 | — |
| nickname | String | ✅ | 团长昵称 |
| server | String | ✅ | 服务器名 |
| characters | Array\<String\> | ✅ | 开团角色名列表（最多 10 个） |
| editPassword | String | ✅ | 6 位数字管理密码 |
| shareId | String | ✅ | 8 位随机 ID，用于分享链接 |
| createdAt | Date | 自动 | — |

### 5.2 RaidSchedule（开团计划）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectId | String | 自动 | — |
| leader | Pointer\<RaidLeader\> | ✅ | 关联团长 |
| instanceId | String | ✅ | 副本 ID（对应 RAID_INSTANCES.id） |
| raidSize | Number | ✅ | 团队人数上限（10 或 25） |
| characterName | String | ✅ | 本次开团角色名 |
| dayOfWeek | Number | ✅ | 0=周日 ~ 6=周六 |
| startTime | String | ✅ | "HH:mm" 格式 |
| weekKey | String | ✅ | "2026-W16" 格式（ISO 周数） |
| fragmentEnabled | Boolean | ✅ | 是否开启包片预约（仅 hasFragment 副本可开启） |
| fragmentStatus | String | — | "open" / "reserved"（仅 fragmentEnabled=true 时有效） |
| fragmentPlayer | String | — | 包片玩家角色名 |
| fragmentServer | String | — | 包片玩家服务器 |
| signupCount | Number | ✅ | 当前报名人数（冗余字段，减少关联查询） |
| status | String | ✅ | "recruiting" / "full" / "closed" |
| note | String | — | 团长备注（最多 100 字） |
| createdAt | Date | 自动 | — |

### 5.3 Signup（报名）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectId | String | 自动 | — |
| schedule | Pointer\<RaidSchedule\> | ✅ | 关联开团计划 |
| playerName | String | ✅ | 角色名 |
| playerServer | String | ✅ | 服务器 |
| playerClass | String | ✅ | 职业 ID（如 "warrior", "mage"） |
| playerRole | String | ✅ | "tank" / "healer" / "dps" |
| contactInfo | String | — | 微信号/QQ（选填） |
| status | String | ✅ | "confirmed" / "cancelled" |
| createdAt | Date | 自动 | — |

### signupCount 维护规则
- 报名成功 → signupCount +1
- 取消报名 → signupCount -1
- signupCount >= raidSize → status 自动变 "full"
- signupCount < raidSize 且当前为 "full" → 自动恢复 "recruiting"
- 这两个操作（更新 Signup + 更新 RaidSchedule）不需要事务——MVP 阶段可接受极小概率的竞态

### ACL 权限
- 所有表：公开读
- 写操作通过前端逻辑控制
- ⚠️ MVP 不做服务端权限——安全妥协可接受

---

## 六、页面规格说明

### 路由表

| 路由 | 页面 | 用途 |
|------|------|------|
| `/#/create` | CreateLeader | 团长首次创建身份 |
| `/#/leader/{shareId}` | LeaderDashboard | 团长管理面板 |
| `/#/r/{shareId}` | RaidSignup | 玩家报名页（被分享的页面） |

### 6.1 团长创建页 `/#/create`

**表单字段**：
1. 昵称（2-12 字符）
2. 服务器（下拉选择）
3. 开团角色名（至少 1 个，动态增删，最多 10）
4. 管理密码（6 位数字，二次确认）

**提交后**：生成 shareId → 创建 RaidLeader → 跳转管理面板 `/#/leader/{shareId}?pwd={password}`。

### 6.2 团长管理面板 `/#/leader/{shareId}`

**鉴权**：URL 带 `?pwd=` 自动进入编辑模式；否则弹密码输入框。验证通过后存 `sessionStorage`，刷新不掉。

#### A. 开团计划管理

**添加团次弹窗**：
1. 选副本（下拉）→ 自动填充 raidSize
2. 选开团角色（下拉，来自团长角色列表）
3. 选星期几 + 时间
4. 包片开关（仅 hasFragment=true 的副本显示）
5. 备注（选填，100 字）

**团次卡片**显示：副本名 + 角色 + 时间 + 报名进度 `X/Y` + 配置概览 `🛡️2 💚5 ⚔️12` + 包片状态 + 操作按钮

**展开报名详情**：报名列表，按 tank → healer → dps 分组排列。每行 = ClassIcon + 角色名 + 服务器 + 定位。团长可移除报名。

#### B. 分享区

- 玩家页链接：`https://{domain}/#/r/{shareId}`
- 二维码
- 复制链接按钮

#### C. 信息编辑

修改昵称、服务器、角色列表、管理密码。

### 6.3 玩家报名页 `/#/r/{shareId}`（核心页面）

**页面结构**：

**Header**：团长昵称 + 服务器

**团次列表**（按 dayOfWeek 排序，当天排最前）：

每个 `RaidCard` 包含：
- 状态色条（左边框 4px）：绿=招募中 / 橙=已满 / 灰=已关闭
- 副本名 + 开团角色 + 「周X HH:mm」
- `CompositionBar`：三段式进度条显示坦克/治疗/输出
- 报名进度：`19/25`
- 包片状态（如有）
- 团长备注（如有）
- 「我要报名」按钮 / 「已满员」标签 / 「已关闭」标签

**点击「我要报名」→ SignupModal**：
1. 角色名（必填）
2. 服务器（下拉）
3. 职业（下拉，带职业色圆点）→ 选择后过滤可选定位
4. 角色定位（下拉，仅该职业可用定位）
5. 联系方式（选填）
6. 若 fragmentEnabled 且 fragmentStatus="open"：「我要包片」勾选框
7. 确认报名

**报名后**：
- 卡片标记「✅ 已报名 - 角色名」
- 「取消报名」按钮
- localStorage 存 `{ scheduleObjectId: signupObjectId }` 识别身份

**展开已报名列表**（点击卡片下方的报名人数区域）：
- 按定位分组：坦克 → 治疗 → 输出
- 每行：ClassIcon + 角色名 + 服务器
- 自己的行高亮

---

## 七、UI 设计规范

### 设计方向
**暗黑·冰冠风格** —— 深色底、冰霜蓝主调、克制装饰。目标：工具感 > 游戏感，信息密度高但不杂乱。

### 色板

```css
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --bg-tertiary: #242836;

  --text-primary: #e8eaed;
  --text-secondary: #9aa0b0;
  --text-muted: #5a6175;

  --color-frost: #4fc3f7;
  --color-plague: #66bb6a;
  --color-ember: #ffa726;
  --color-bone: #444a5a;
  --color-blood: #ef5350;

  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.6);

  --radius-card: 12px;
  --radius-btn: 8px;
  --radius-badge: 6px;
}
```

### 字体
```css
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
```

### 移动优先
- 基准宽度 375px，最大内容宽度 480px 居中
- 触摸目标 ≥ 44×44px
- 卡片间距 12px，内边距 16px
- 字号：页标题 22px、卡片标题 17px、正文 15px、辅助 13px

### CompositionBar 规格

```
三段横向进度条，总宽 100%

每段：emoji + 填充条 + 数字 "X/Y"
坦克色：--color-frost     目标（25人）：3    目标（10人）：2
治疗色：--color-plague     目标（25人）：6    目标（10人）：3
输出色：--color-blood(0.7) 目标（25人）：16   目标（10人）：5

⚠️ 目标数仅用于进度条显示比例，不硬性限制报名。
```

### RaidCard 状态
- recruiting：左边框 `--color-plague`，按钮 `--color-frost`
- full：左边框 `--color-ember`，按钮灰色禁用
- closed：整卡片 opacity 0.5

### ClassIcon
- 圆形 28×28px，背景=职业色，白/黑单字
- 亮度判断：`luminance = 0.299*R + 0.587*G + 0.114*B > 186 ? 黑 : 白`
- 列表中间距 -4px 堆叠效果

---

## 八、LeanCloud 配置（人类手动操作）

### 8.1 注册
1. https://console.leancloud.cn/ 注册
2. 创建应用 → 开发版
3. 设置 → 应用凭证 → 记录 AppID / AppKey / REST API 服务器地址

### 8.2 安全域名
设置 → 安全中心 → Web 安全域名 → 添加 `http://localhost:5173` + 正式域名

### 8.3 初始化

`src/leancloud.js`：
```javascript
import AV from 'leancloud-storage';

AV.init({
  appId: 'YOUR_APP_ID',
  appKey: 'YOUR_APP_KEY',
  serverURL: 'YOUR_SERVER_URL',
});

export default AV;
```

---

## 九、开发阶段与验收标准

### Phase 1：项目初始化 + 静态 UI（2-3 天）

**任务**：
1. `npm create vite@latest raid-scheduler -- --template react`
2. 安装依赖：tailwindcss @tailwindcss/vite react-router-dom qrcode.react
3. 配置 Tailwind v4（在 vite.config.js 添加 @tailwindcss/vite 插件，在 main.css 添加 `@import "tailwindcss"`）
4. 配置 hash 路由（在 App.jsx 中使用 HashRouter）
5. 创建常量文件（constants.js、classRoleMap.js）
6. 实现基础组件：ClassIcon、CompositionBar、Toast
7. 用硬编码假数据实现三个页面完整 UI
8. 重点打磨 RaidSignup（玩家报名页）

**假数据建议**：创建一个 `src/utils/mockData.js`，包含 1 个团长、3 个团次（1个招募中+1个满员+1个已关闭）、每个团次 5-20 条报名记录。Phase 2 接入真数据后删除此文件。

**验收标准**：
- [ ] `npm run dev` 零错误
- [ ] 三路由可访问
- [ ] 375px 宽无横向滚动
- [ ] 10 个职业图标颜色和对比度正确
- [ ] CompositionBar 在 0 人和满员时显示正常
- [ ] 报名弹窗：选职业后定位下拉正确过滤
- [ ] 深色主题严格遵循色板

### Phase 2：接入 LeanCloud（2-3 天）

**前置**：人类已将 LeanCloud 凭证填入 leancloud.js

**任务**：
1. `npm install leancloud-storage`
2. 团长创建：表单 → RaidLeader → shareId → 跳转
3. 团长管理：增/删团次、查看/移除报名
4. 玩家报名：查询团次 + 报名列表、提交报名、取消报名
5. signupCount 维护（报名+1，取消-1，满员自动切状态）
6. weekKey 自动生成
7. 包片功能：开关 + 预约/取消
8. 删除 mockData.js

**验收标准**：
- [ ] 全链路可跑通：创建团长 → 添加团次 → 玩家报名 → 团长看到报名
- [ ] 取消报名后 signupCount 和 status 正确
- [ ] 满员后新报名被阻止（按钮灰色）
- [ ] 包片预约/取消正确
- [ ] 刷新不丢数据
- [ ] 所有 LeanCloud 操作有 .catch() + 用户提示
- [ ] 查询有 .limit()

### Phase 3：分享 + 部署 + 打磨（1-2 天）

**任务**：
1. 分享链接 + 二维码
2. meta 标签（og:title, og:description, viewport）
3. 空状态 UI（无团次 / 无报名时的引导文案）
4. 加载状态（skeleton 或 spinner）
5. 错误状态（网络失败友好提示）
6. build + 部署 Vercel
7. LeanCloud 添加正式域名

**验收标准**：
- [ ] 微信内打开正常
- [ ] 二维码扫码正确跳转
- [ ] 空状态有引导 UI
- [ ] 异步操作有 loading
- [ ] 网络失败有提示
- [ ] Vercel 部署成功

---

## 十、代码质量与自检

### 10.1 每次修改后
```bash
npm run build
```
零错误零警告才能继续。

### 10.2 检查清单

**React**：
- [ ] 全部函数组件 + Hooks
- [ ] useEffect 依赖数组完整
- [ ] state 不可变更新
- [ ] 列表用 objectId 做 key
- [ ] useEffect 内不直接 async

**Tailwind**：
- [ ] 无独立 CSS 文件（除 main.css）
- [ ] 颜色用 CSS 变量
- [ ] 无内联硬编码色值

**LeanCloud**：
- [ ] 查询有 .catch()
- [ ] 查询有 .limit()
- [ ] Pointer 用 createWithoutData()
- [ ] 写操作后更新本地 state

**移动端**：
- [ ] 不依赖 hover 做核心交互
- [ ] 弹窗不超出视口
- [ ] 触摸目标 ≥ 44×44px

### 10.3 禁止
- ❌ TypeScript
- ❌ 状态管理库
- ❌ SSR
- ❌ UI 组件库
- ❌ localStorage 存敏感信息
- ❌ 中文文案散落组件——集中管理

---

## 十一、给 Claude Code 的指令协议

### 开发模式（「开始 Phase X」）
1. 读本文档对应 Phase
2. 列任务清单
3. 逐任务执行，每完成一个 `npm run build` 验证
4. 全部完成后核对验收标准
5. 未通过项自动修复

### 审查模式（「审查代码」/「review」）
1. `npm run build`
2. 逐条跑第十节清单
3. 输出表格：✅/❌ + 问题
4. 提供修复方案
5. 确认后执行

### 调试模式（「白屏」/「报错」/「数据不对」）
1. `npm run build`
2. 查 leancloud.js 配置
3. 查 CORS / 安全域名
4. 查查询条件
5. console.log 定位

---

## 十二、部署

### Vercel
1. 推 GitHub
2. Vercel 导入 → Vite → `npm run build` → `dist`
3. 域名加入 LeanCloud 安全域名

### 国内备选
- Cloudflare Pages
- 阿里云 OSS（需备案）

---

## 十三、未来迭代（当前不做）

1. 碎片自报 + 拼单
2. 排班模板复制到下周
3. 装等门槛
4. DKP / 分金
5. 微信小程序
6. JSSDK 自定义分享卡片
7. 团长信誉系统
8. 开团前提醒
9. 支持正式服
10. 国际化

---

*文档版本：v2.0 | 最后更新：2026-04-13*
