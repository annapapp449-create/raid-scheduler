# Phase 2: LeanCloud Backend Integration Plan

## Executive Summary

迁移 WoW raid scheduling app 从 localStorage mock data 到 LeanCloud 后端服务，实现持久化存储、多用户访问和实时同步。

---

## 1. Data Model Design

### Leader Class (团长)

| Field | Type | Description |
|-------|------|-------------|
| `nickname` | String | 团长显示名 (2-12 chars) |
| `server` | String | 服务器名 |
| `characters` | Array | 角色对象数组 |
| `shareId` | String | 8位公开分享ID |
| `editPassword` | String | 6位数字密码 (SHA-256 hash) |

### Schedule Class (团次)

| Field | Type | Description |
|-------|------|-------------|
| `leader` | Pointer | 指向 Leader |
| `instanceId` | String | 副本ID |
| `raidSize` | Number | 团队规模 (25) |
| `characterName` | String | 团长角色名 |
| `characterClass` | String | 团长职业 |
| `server` | String | 服务器名 |
| `dayOfWeek` | Number | 0-6 |
| `startTime` | String | "HH:mm" |
| `weekKey` | String | "YYYY-Www" |
| `signupCount` | Number | 反规范化计数 |
| `status` | String | "recruiting"/"full"/"closed" |
| `fragmentEnabled` | Boolean | 是否开启包片 |
| `fragmentStatus` | String | "open"/"reserved" |
| `teamConfig` | Object | 团队配置 |

### Signup Class (报名)

| Field | Type | Description |
|-------|------|-------------|
| `schedule` | Pointer | 指向 Schedule |
| `playerName` | String | 玩家角色名 |
| `playerServer` | String | 服务器 |
| `playerClass` | String | 职业 |
| `playerRole` | String | tank/healer/dps |
| `playerSpec` | String | 天赋专精 |
| `contactInfo` | String | 联系方式 |
| `status` | String | "confirmed"/"cancelled" |

---

## 2. SDK Integration

### 2.1 安装依赖
```bash
npm install leancloud-storage
```

### 2.2 环境变量 (.env)
```
VITE_LEANCLOUD_APP_ID=your_app_id
VITE_LEANCLOUD_APP_KEY=your_app_key
```

### 2.3 服务层结构
```
src/services/leancloud/
    ├── index.js
    ├── leaderService.js
    ├── scheduleService.js
    └── signupService.js
```

---

## 3. 实施步骤

### Step 1: 项目初始化
- [ ] 创建 LeanCloud 账号和应用
- [ ] 安装 leancloud-storage
- [ ] 创建 .env 文件
- [ ] 初始化 SDK

### Step 2: 服务层开发
- [ ] LeaderService - 团长 CRUD
- [ ] ScheduleService - 团次 CRUD
- [ ] SignupService - 报名 CRUD

### Step 3: 组件迁移
- [ ] LeaderDashboard 使用服务
- [ ] RaidSignup 使用服务
- [ ] CreateLeader 使用服务

### Step 4: 测试
- [ ] 团长创建流程
- [ ] 团次创建流程
- [ ] 报名流程
- [ ] 数据持久化

---

## 4. Security

### 4.1 密码安全
使用 Web Crypto API SHA-256 hash

### 4.2 ACL 设置
- Leader: 公开读取，仅团长可写
- Schedule: 公开读取，仅团长可写
- Signup: 团长和报名者可修改

### 4.3 输入验证
所有用户输入必须验证后才能保存
