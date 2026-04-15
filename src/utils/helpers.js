import { WEEKDAYS, RAID_INSTANCES } from "./constants";

/**
 * 生成 8 位随机 ID（用于分享）
 */
export const generateShareId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 格式化时间为 "HH:mm"
 */
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * 获取当前 ISO 周数
 * 返回格式: "2026-W16"
 */
export const getWeekKey = (date = new Date()) => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
};

/**
 * 获取星期几的中文表示
 */
export const getWeekdayLabel = (dayOfWeek) => {
  return WEEKDAYS[dayOfWeek] || "未知";
};

/**
 * 格式化日期显示
 * 例如: "周一 20:00"
 */
export const formatRaidTime = (dayOfWeek, startTime) => {
  return `周${WEEKDAYS[dayOfWeek]?.charAt(1) || ""} ${startTime}`;
};

/**
 * 生成团次显示名称（带阶段）
 * 例如: "[P3] 纳克萨玛斯 - 冰火"
 */
export const formatRaidTitle = (instance, characterName) => {
  return `[${instance.phase}] ${instance.label} - ${characterName}`;
};

/**
 * 防抖函数
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 复制文本到剪贴板
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
};

/**
 * 生成团分享链接（玩家报名页）
 */
export const generateShareUrl = (shareId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#/r/${shareId}`;
};

/**
 * 生成团长管理链接
 */
export const generateManageUrl = (shareId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#/leader/${shareId}`;
};

/**
 * 保存团长到本机历史（my_leaders）
 */
export const saveMyLeader = ({ shareId, nickname, server }) => {
  const saved = JSON.parse(localStorage.getItem('my_leaders') || '[]');
  const filtered = saved.filter(l => l.shareId !== shareId);
  const entry = { shareId, nickname, server, savedAt: Date.now() };
  localStorage.setItem('my_leaders', JSON.stringify([entry, ...filtered].slice(0, 10)));
};

/**
 * 读取本机历史团长列表
 */
export const getMyLeaders = () => {
  return JSON.parse(localStorage.getItem('my_leaders') || '[]');
};

/**
 * 删除本机历史团长
 */
export const removeMyLeader = (shareId) => {
  const saved = JSON.parse(localStorage.getItem('my_leaders') || '[]');
  localStorage.setItem('my_leaders', JSON.stringify(saved.filter(l => l.shareId !== shareId)));
};

/**
 * 彻底清除本机某个团长的所有数据（团长信息 + 团次 + 报名 + 历史）
 * 用于团长在本设备上重置/重新注册
 */
export const purgeLeaderData = (shareId) => {
  // 1. 从本机历史移除
  removeMyLeader(shareId);

  // 2. 找到 leader 的 objectId
  const leaders = JSON.parse(localStorage.getItem('lc_leaders') || '[]');
  const leader = leaders.find(l => l.shareId === shareId);
  const leaderObjectId = leader?.objectId;

  // 3. 从 lc_leaders 移除此团长
  localStorage.setItem('lc_leaders', JSON.stringify(leaders.filter(l => l.shareId !== shareId)));

  if (!leaderObjectId) return;

  // 4. 找出并移除该团长的团次，顺带收集 scheduleIds
  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  const leaderScheduleIds = schedules.filter(s => s.leaderId === leaderObjectId).map(s => s.objectId);
  localStorage.setItem('lc_schedules', JSON.stringify(schedules.filter(s => s.leaderId !== leaderObjectId)));

  // 5. 移除与这些团次相关的报名
  if (leaderScheduleIds.length > 0) {
    const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
    localStorage.setItem('lc_signups', JSON.stringify(signups.filter(s => !leaderScheduleIds.includes(s.scheduleId))));
    // 同时清理玩家端的本地报名记录指针
    leaderScheduleIds.forEach(sid => localStorage.removeItem(`signup_${sid}`));
  }

  // 6. 清理 session 认证标志
  sessionStorage.removeItem(`auth_${shareId}`);
};

/**
 * 按角色分组排列报名列表
 * 顺序: tank -> healer -> dps
 */
export const groupSignupsByRole = (signups) => {
  const groups = {
    tank: [],
    healer: [],
    dps: [],
  };

  signups.forEach((signup) => {
    const role = signup.playerRole;
    if (groups[role]) {
      groups[role].push(signup);
    }
  });

  return groups;
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

/**
 * 获取指定阶段的副本列表
 */
export const getRaidsByPhase = (phase) => {
  return RAID_INSTANCES.filter((r) => r.phase === phase);
};

// ============================================
// 日历日期工具函数
// ============================================

/**
 * 获取日期对应的星期几 (0=周日, 1=周一, ..., 6=周六)
 */
export const getDayOfWeek = (date) => {
  return date.getDay();
};

/**
 * 比较两个日期是否同一天（忽略时间）
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 判断日期是否为今天
 */
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * 判断日期是否在过去（不包含今天）
 */
export const isPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

/**
 * 获取某年某月的第一天
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1);
};

/**
 * 获取某年某月的最后一天
 */
export const getLastDayOfMonth = (year, month) => {
  return new Date(year, month, 0);
};

/**
 * 获取某年某月的日历网格（6周 = 42天）
 * 返回数组，每项包含 { date, isCurrentMonth, isPast }
 */
export const getMonthDays = (year, month) => {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  const startDayOfWeek = firstDay.getDay(); // 0=周日
  const daysInMonth = lastDay.getDate();

  const days = [];

  // 上月的填充日期
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevMonthYear = month === 1 ? year - 1 : year;
  const prevMonthLastDay = getLastDayOfMonth(prevMonthYear, prevMonth).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevMonthYear, prevMonth - 1, prevMonthLastDay - i);
    days.push({ date, isCurrentMonth: false, isPast: true });
  }

  // 当月的日期
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    days.push({ date, isCurrentMonth: true, isPast: isPast(date) });
  }

  // 下月的填充日期（补满42天）
  const remaining = 42 - days.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;

  for (let d = 1; d <= remaining; d++) {
    const date = new Date(nextMonthYear, nextMonth - 1, d);
    days.push({ date, isCurrentMonth: false, isPast: false });
  }

  return days;
};

/**
 * 根据 weekKey 和 dayOfWeek 获取实际日期
 * weekKey 格式: "2026-W16"
 * dayOfWeek: 0=周日, 1=周一, ..., 6=周六
 */
export const getDateFromWeekKey = (weekKey, dayOfWeek) => {
  const match = weekKey.match(/(\d{4})-W(\d{2})/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // 找到该年的第一天
  const firstDayOfYear = new Date(year, 0, 1);

  // 找到该年第一周的周一
  let monday = new Date(firstDayOfYear);
  const dayOfWeekMonday = monday.getDay();
  const diffToMonday = dayOfWeekMonday === 0 ? -6 : 1 - dayOfWeekMonday;
  monday.setDate(monday.getDate() + diffToMonday);

  // 跳到目标周
  monday.setDate(monday.getDate() + (week - 1) * 7);

  // 找到该周的指定星期几
  const result = new Date(monday);
  result.setDate(monday.getDate() + dayOfWeek);

  return result;
};

/**
 * 将 schedule 转换为实际日期
 * schedule: { weekKey, dayOfWeek, ... }
 */
export const getScheduleDate = (schedule) => {
  return getDateFromWeekKey(schedule.weekKey, schedule.dayOfWeek);
};

/**
 * 获取 schedule 的日期状态
 * 返回: 'recruiting' | 'full' | 'closed' | 'empty'
 */
export const getScheduleStatus = (schedule) => {
  if (!schedule) return 'empty';
  return schedule.status;
};

/**
 * 判断某天的 raid 状态（聚合多个 schedule）
 * 返回: 'has_recruiting' | 'all_full' | 'all_closed' | 'empty'
 */
export const getDayRaidStatus = (schedules) => {
  if (!schedules || schedules.length === 0) return 'empty';

  const hasOpen = schedules.some((s) => s.status === 'recruiting' && s.signupCount < 25);
  const hasFull = schedules.some((s) => s.status === 'full' || s.status === 'closed');
  const allClosed = schedules.every((s) => s.status === 'closed');

  if (allClosed) return 'all_closed';
  if (hasOpen) return 'has_recruiting';
  if (hasFull) return 'all_full';
  return 'empty';
};

/**
 * 获取月份的中文名称
 */
export const getMonthName = (month) => {
  const names = ["一月", "二月", "三月", "四月", "五月", "六月",
                 "七月", "八月", "九月", "十月", "十一月", "十二月"];
  return names[month - 1] || "";
};

/**
 * 格式化日期显示 (用于标题)
 */
export const formatDateShort = (date) => {
  return `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`;
};
