# 进度日志 - WoW 时光服开团报名工具

---

## 2026-04-13

### 当前阶段：Phase 1 完成

### 完成事项

#### Phase 1：项目初始化 + 静态 UI ✅

- [x] 1.1 初始化 Vite + React 项目
- [x] 1.2 安装依赖（tailwindcss, react-router-dom, qrcode.react）
- [x] 1.3 配置 Tailwind CSS v4（vite.config.js + main.css）
- [x] 1.4 配置 Hash 路由（React Router v7）
- [x] 1.5 创建常量文件
  - [x] constants.js（副本列表、服务器列表）
  - [x] classRoleMap.js（职业→角色映射）
  - [x] helpers.js（工具函数）
  - [x] mockData.js（假数据）
- [x] 1.6 实现基础组件
  - [x] ClassIcon（职业图标）
  - [x] CompositionBar（团队配置进度条）
  - [x] Toast（轻提示）
  - [x] FragmentBadge（包片状态标记）
  - [x] QRCodeCard（二维码卡片）
  - [x] SignupModal（报名弹窗）
  - [x] SignupList（已报名列表）
  - [x] RaidCard（团次卡片）
  - [x] WeekCalendar（周历组件）
- [x] 1.7 实现页面
  - [x] CreateLeader（团长创建页）
  - [x] LeaderDashboard（团长管理面板）
  - [x] RaidSignup（玩家报名页）
- [x] 1.8 打磨 RaidSignup 页面（核心体验）
- [x] 1.9 验收检查：`npm run build` 零错误 ✅

### 验证结果

```
dist/index.html                   0.71 kB │ gzip:  0.42 kB
dist/assets/index-B_ml2Vrz.css   11.62 kB │ gzip:  3.39 kB
dist/assets/index-CdSxbEp-.js   292.31 kB │ gzip: 91.21 kB
✓ built in 91ms
```

### 项目结构

```
raid-scheduler/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── main.css              # Tailwind + CSS 变量系统
│   ├── App.jsx               # Hash 路由
│   ├── leancloud.js           # LeanCloud 占位符
│   ├── pages/
│   │   ├── CreateLeader.jsx   # 团长创建页
│   │   ├── LeaderDashboard.jsx # 团长管理面板
│   │   └── RaidSignup.jsx     # 玩家报名页
│   ├── components/
│   │   ├── ClassIcon.jsx
│   │   ├── CompositionBar.jsx
│   │   ├── Toast.jsx
│   │   ├── FragmentBadge.jsx
│   │   ├── QRCodeCard.jsx
│   │   ├── SignupModal.jsx
│   │   ├── SignupList.jsx
│   │   ├── RaidCard.jsx
│   │   └── WeekCalendar.jsx
│   └── utils/
│       ├── constants.js
│       ├── classRoleMap.js
│       ├── helpers.js
│       └── mockData.js
```

---

## 2026-04-14

### 当前阶段：Phase 2 进行中

### 框架重构（依据白皮书）

根据《时光服核心规则精简白皮书》完成全面重构：

#### 变更摘要

1. **P1-P10 全阶段团本数据（21个副本）**
   - P1: 熔火之心 (MC)
   - P2: 毒蛇神殿 (TSS), 风暴要塞 (BRM)
   - P3: 纳克萨玛斯 (NAXX), 黑曜石圣殿 (OS), 永恒之眼 (EoE)
   - P4: 祖尔格拉布 (ZG), 十字军的试炼 (TOC), 阿尔卡冯的宝库
   - P5: 祖阿曼 (ZAM), 太阳之井高地 (SWP)
   - P6: 奥杜尔 (ULD)
   - P7: 卡拉赞 (Kara), 格鲁尔的巢穴 (Gruul), 玛瑟里顿的巢穴 (Mag)
   - P8: 黑翼之巢 (BWL), 奥妮克希亚的巢穴 (Ony), 安其拉废墟 (AQ20)
   - P9: 安其拉神殿 (AQ40)
   - P10: 冰冠堡垒 (ICC), 红玉圣殿 (RS)

2. **报名流程重构：天赋自动推导角色定位**
   - 选择职业 → 选择天赋专精 → 角色定位自动识别
   - 移除独立的"角色定位"选择步骤
   - classRoleMap.js 新增 `getSpecsByClassId`, `getSpecById` 函数

3. **RaidCard 显示升级**
   - 显示阶段标签 [P3]
   - 显示装等 iLvl 226-232

4. **SignupList 显示升级**
   - 显示天赋专精（如"防护"、"神圣"）而非仅角色定位

#### 已修改文件

- `src/utils/constants.js` — 21个副本数据（phase, ilvl, bossCount）
- `src/utils/classRoleMap.js` — 30个天赋专精（10职业×3天赋）
- `src/utils/helpers.js` — 新增 `getRaidsByPhase`，更新 `formatRaidTitle`
- `src/utils/mockData.js` — 更新为新副本ID
- `src/components/SignupModal.jsx` — 重构为天赋选择流程
- `src/components/SignupList.jsx` — 显示天赋专精
- `src/components/RaidCard.jsx` — 显示阶段和装等
- `src/pages/LeaderDashboard.jsx` — 副本下拉显示阶段和装等
- `findings.md` — 完整更新
- `task_plan.md` — 完整更新

#### 构建验证

```
dist/index.html                   0.71 kB │ gzip:  0.42 kB
dist/assets/index-B_ml2Vrz.css   11.62 kB │ gzip:  3.39 kB
dist/assets/index-OoW3Pybl.js   298.51 kB │ gzip: 92.73 kB
✓ built in 80ms
```

### 日历视图重构

根据用户需求，将顶部导航改为日历视图（类似电影院选座）：

#### 新增组件

- **`src/components/RaidCalendar.jsx`** — 月历组件
  - 月份网格视图（6周 = 42天）
  - 每天一个单元格，带状态颜色
  - 颜色编码：🟢可报名(绿) / 🟠已满(橙) / ⚫无团(灰)
  - 月份切换导航（上一月/下一月/今天）
  - 选中日期高亮（蓝色边框）
  - Raid 数量徽章

- **`src/components/DayRaidsPanel.jsx`** — 选中日期团次面板
  - 显示选中日期的所有团次 RaidCard
  - 空状态提示
  - 团长视角显示"添加团次"按钮

#### 日期工具函数 (helpers.js)

- `isSameDay(date1, date2)` — 比较两日期是否同一天
- `isToday(date)` — 判断是否今天
- `isPast(date)` — 判断是否过去
- `getMonthDays(year, month)` — 获取月历网格数据
- `getDateFromWeekKey(weekKey, dayOfWeek)` — 从 weekKey+dayOfWeek 获取实际日期
- `getScheduleDate(schedule)` — 获取 schedule 对应的实际日期
- `getDayRaidStatus(schedules)` — 获取某天聚合 raid 状态
- `getMonthName(month)` — 月份中文名

#### 页面更新

- **`RaidSignup.jsx`** — 替换 WeekCalendar 为 RaidCalendar + DayRaidsPanel
- **`LeaderDashboard.jsx`** — 同上，增加"添加团次"按钮

#### 构建验证

```
dist/index.html                   0.71 kB │ gzip:  0.42 kB
dist/assets/index-DFQqwZWk.css   11.70 kB │ gzip:  3.41 kB
dist/assets/index-32jxBoNU.js   305.22 kB │ gzip: 94.42 kB
✓ built in 86ms
```

### 服务器验证实现

根据用户需求"团长设置好服务器 只有该服务器和阵营的玩家才可以报名的"，完成以下实现：

#### 已修改文件

- `src/components/SignupModal.jsx`
  - 新增 `raidServer` prop
  - 当 `raidServer` 存在时，隐藏服务器下拉选择，改为显示只读服务器标签
  - validate 函数新增服务器校验：玩家服务器必须与 raidServer 匹配

- `src/components/RaidCard.jsx`
  - 向 SignupModal 传递 `raidServer={schedule.server}`

#### 构建验证

```
dist/index.html                   0.71 kB │ gzip:  0.42 kB
dist/assets/index-95JuyC17.css   11.67 kB │ gzip:  3.40 kB
dist/assets/index-gXlzTayd.js   305.00 kB │ gzip: 94.35 kB
✓ built in 80ms
```

### 下一步

- Phase 2.5：安装 leancloud-storage
- 需要人类提供 LeanCloud 凭证
