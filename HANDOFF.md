# 开团小工具 — 交接文档

> 编写日期：2026-04-15
> 状态：代码已完成，**尚未 commit / push**，Supabase 后端**尚未配置**

---

## 一、本次改动概览

本次做了两件事：

| # | 改动 | 状态 |
|---|------|------|
| 1 | `#/create` 页增加「清除本机信息并重新注册」功能 | 代码完成，未提交 |
| 2 | 接入 Supabase 后端，解决分享链接跨设备打不开的问题 | 代码完成，需配置 Supabase 账号 |

---

## 二、变更文件清单

### 修改的文件

| 文件 | 改动内容 |
|------|----------|
| `src/pages/CreateLeader.jsx` | 新增 `single` 视图（唯一团长快速入口）+ 清除确认弹窗；import 切到 `api.js` |
| `src/pages/LeaderDashboard.jsx` | import 切到 `api.js`；移除 `isConfigured` 依赖 |
| `src/pages/RaidSignup.jsx` | import 切到 `api.js` |
| `.env.example` | 新增 Supabase 配置模板 |
| `package.json` | 新增依赖 `@supabase/supabase-js` |

### 新增的文件

| 文件 | 说明 |
|------|------|
| `src/services/api.js` | **统一服务路由层**，自动选择 Supabase / LeanCloud / localStorage |
| `src/services/supabase/index.js` | Supabase 客户端初始化，`isConfigured()` 检测 |
| `src/services/supabase/leaderService.js` | 团长 CRUD（Supabase 实现） |
| `src/services/supabase/scheduleService.js` | 团次 CRUD（Supabase 实现） |
| `src/services/supabase/signupService.js` | 报名 CRUD（Supabase 实现） |
| `supabase-schema.sql` | Supabase 建表 SQL + RLS 策略 + 索引 |

---

## 三、功能详情

### 3.1 清除本机信息功能

**问题**：原来只有 1 个团长时，`#/create` 页会直接跳转到管理页，用户无法清除/重置本机身份。

**改动**：

- 不再自动跳转，改为显示「欢迎回来」快速入口页（`view === "single"`）
- 页面展示团长卡片（点击进入管理页）+ 「创建新的团长身份」按钮
- 底部增加「清除本机信息并重新注册」链接
- 点击后弹出确认弹窗（非 `window.confirm`，是自定义模态框），说明清除范围
- 确认后调用 `purgeLeaderData(shareId)`，清除 `my_leaders`、`lc_leaders`、关联团次、报名记录、session 认证
- 管理列表（多团长）的「移除」按钮也改用相同的确认弹窗

### 3.2 Supabase 后端接入

**问题**：所有数据存在创建者的 localStorage，分享链接在别人设备上显示「页面不存在」。

**架构**：

```
页面组件
  ↓ import
src/services/api.js          ← 统一路由层
  ↓ 自动选择
src/services/supabase/       ← 优先（如果配置了 VITE_SUPABASE_URL）
src/services/leancloud/      ← 次选（如果配置了 VITE_LEANCLOUD_APP_ID）
  └─ localStorage fallback   ← 兜底（两个都没配置时）
```

**选择逻辑**（`api.js` 中的 `getBackend()`）：
1. 检测 `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → 用 Supabase
2. 否则检测 `VITE_LEANCLOUD_APP_ID` + `VITE_LEANCLOUD_APP_KEY` → 用 LeanCloud
3. 都没配置 → LeanCloud 服务内部 fallback 到 localStorage（仅限本机）

**字段映射**：Supabase 用 `snake_case`（如 `share_id`），应用层用 `camelCase`（如 `shareId`），每个 service 文件内部有 `mapRow()` 做转换。

---

## 四、待完成：Supabase 配置步骤

### 第 1 步：注册 Supabase

1. 打开 https://supabase.com → Sign Up（支持 GitHub 登录）
2. 创建新项目
   - Organization: 随意
   - Project Name: `raid-scheduler`
   - Database Password: 记好（代码不会用到，但管理时需要）
   - Region: 选 `Southeast Asia (Singapore)` 或离用户近的

### 第 2 步：建表

1. 进入项目 → 左侧菜单 **SQL Editor**
2. 新建一个 Query
3. 把项目根目录 `supabase-schema.sql` 文件的**全部内容**粘贴进去
4. 点 **Run** 执行
5. 成功后在左侧 **Table Editor** 中应能看到 `leaders`、`schedules`、`signups` 三张表

### 第 3 步：获取凭据

1. 左侧菜单 → **Project Settings** → **API**
2. 复制两个值：
   - **Project URL**：形如 `https://xxxxx.supabase.co`
   - **anon public** key：形如 `eyJhbGciOiJI...` 的长字符串

### 第 4 步：配置本地环境

在项目根目录创建 `.env` 文件（不要提交到 git）：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...你的key
```

### 第 5 步：配置 Cloudflare Pages

1. 登录 Cloudflare Dashboard → Pages → `raid-scheduler` 项目
2. Settings → Environment variables
3. 添加两个变量（Production 和 Preview 都加）：
   - `VITE_SUPABASE_URL` = 你的 Project URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key
4. 重新部署（Deployments → 最新一次 → Retry deployment）

### 第 6 步：验证

1. 本地 `npm run dev`，访问 `#/create`，注册一个团长
2. 开团后复制分享链接
3. 用另一台设备（或浏览器无痕模式）打开分享链接
4. 应该能看到团长信息和团次，而不是「页面不存在」

---

## 五、数据模型（Supabase 表结构）

### leaders

| 列 | 类型 | 说明 |
|----|------|------|
| id | uuid (PK) | 自动生成 |
| nickname | text | 团长昵称 |
| server | text | 服务器 |
| characters | jsonb | 角色列表，如 `[{"name":"角色1"}]` |
| edit_password | text | SHA-256 哈希后的管理密码 |
| share_id | text (unique) | 8位分享码，用于 URL |
| created_at | timestamptz | 创建时间 |

### schedules

| 列 | 类型 | 说明 |
|----|------|------|
| id | uuid (PK) | 自动生成 |
| leader_id | uuid (FK → leaders.id) | 所属团长，CASCADE 删除 |
| instance_id | text | 副本 ID |
| instance_name | text | 副本名称 |
| raid_size | int | 团队人数（默认 25） |
| character_name | text | 开团角色名 |
| character_class | text | 开团角色职业 |
| server | text | 服务器 |
| day_of_week | int | 星期几（0-6） |
| start_time | text | 开始时间（如 "20:00"） |
| week_key | text | 周标识（如 "2026-W16"） |
| signup_count | int | 当前报名人数 |
| status | text | recruiting / full / closed |
| fragment_enabled | boolean | 是否启用碎片 |
| fragment_status | text | open / reserved |
| team_config | jsonb | 团队配置 |
| created_at | timestamptz | 创建时间 |

### signups

| 列 | 类型 | 说明 |
|----|------|------|
| id | uuid (PK) | 自动生成 |
| schedule_id | uuid (FK → schedules.id) | 所属团次，CASCADE 删除 |
| player_name | text | 玩家昵称 |
| player_server | text | 玩家服务器 |
| player_class | text | 职业 |
| player_role | text | 角色（tank/healer/dps） |
| player_spec | text | 专精 |
| contact_info | text | 联系方式 |
| status | text | confirmed / cancelled |
| created_at | timestamptz | 创建时间 |

---

## 六、注意事项

1. **未提交的改动**：所有改动尚未 git commit。确认 Supabase 配置无误后再提交推送。
2. **向后兼容**：LeanCloud 代码保留，如果将来要切回只需改环境变量。
3. **Supabase 免费额度**：500MB 数据库 + 500 万次请求/月，个人使用完全够。
4. **密码安全**：管理密码使用 SHA-256 + salt 哈希存储，明文不入库。
5. **RLS 策略**：当前设置为全部开放读写（因为没有用户认证体系）。如果将来需要更严格的权限控制，可以在 Supabase Dashboard 修改 RLS 策略。
6. **`purgeLeaderData`**（`src/utils/helpers.js`）：此函数只清除 localStorage 中的数据。Supabase 接入后，远端数据不会被清除——这是预期行为，因为「清除本机信息」的目的是让当前设备忘记团长身份，而非删除远端数据。

---

## 七、快速命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建（已验证通过）
npm run build

# 查看改动
git diff --stat
```
