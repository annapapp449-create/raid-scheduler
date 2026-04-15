/**
 * 统一服务路由
 *
 * 优先级：Supabase > LeanCloud > localStorage fallback
 * 页面只需 import 此文件，无需关心底层存储。
 */

import { isConfigured as isSupabaseConfigured } from './supabase/index';
import { isConfigured as isLeanCloudConfigured } from './leancloud/index';

// 动态选择后端
function getBackend() {
  if (isSupabaseConfigured()) return 'supabase';
  if (isLeanCloudConfigured()) return 'leancloud';
  return 'leancloud'; // leancloud service 内部会 fallback 到 localStorage
}

// ── Leader ──────────────────────────────────────────────

export async function createLeader(params) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { createLeader: fn } = await import('./supabase/leaderService');
    return fn(params);
  }
  const { createLeader: fn } = await import('./leancloud/leaderService');
  return fn(params);
}

export async function getLeaderByShareId(shareId) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getLeaderByShareId: fn } = await import('./supabase/leaderService');
    return fn(shareId);
  }
  const { getLeaderByShareId: fn } = await import('./leancloud/leaderService');
  return fn(shareId);
}

export async function verifyPassword(leader, inputPassword) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { verifyPassword: fn } = await import('./supabase/leaderService');
    return fn(leader, inputPassword);
  }
  const { verifyPassword: fn } = await import('./leancloud/leaderService');
  return fn(leader, inputPassword);
}

export async function updateLeader(objectId, updates) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { updateLeader: fn } = await import('./supabase/leaderService');
    return fn(objectId, updates);
  }
  const { updateLeader: fn } = await import('./leancloud/leaderService');
  return fn(objectId, updates);
}

export async function hashPassword(password) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { hashPassword: fn } = await import('./supabase/leaderService');
    return fn(password);
  }
  const { hashPassword: fn } = await import('./leancloud/leaderService');
  return fn(password);
}

// ── Schedule ────────────────────────────────────────────

export async function createSchedule(params) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { createSchedule: fn } = await import('./supabase/scheduleService');
    return fn(params);
  }
  const { createSchedule: fn } = await import('./leancloud/scheduleService');
  return fn(params);
}

export async function getSchedulesByLeader(leaderId) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getSchedulesByLeader: fn } = await import('./supabase/scheduleService');
    return fn(leaderId);
  }
  const { getSchedulesByLeader: fn } = await import('./leancloud/scheduleService');
  return fn(leaderId);
}

export async function getAllSchedulesByWeekKey(weekKey) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getAllSchedulesByWeekKey: fn } = await import('./supabase/scheduleService');
    return fn(weekKey);
  }
  const { getAllSchedulesByWeekKey: fn } = await import('./leancloud/scheduleService');
  return fn(weekKey);
}

export async function getSchedulesByWeekKey(weekKey) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getSchedulesByWeekKey: fn } = await import('./supabase/scheduleService');
    return fn(weekKey);
  }
  const { getSchedulesByWeekKey: fn } = await import('./leancloud/scheduleService');
  return fn(weekKey);
}

export async function updateSchedule(objectId, updates) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { updateSchedule: fn } = await import('./supabase/scheduleService');
    return fn(objectId, updates);
  }
  const { updateSchedule: fn } = await import('./leancloud/scheduleService');
  return fn(objectId, updates);
}

export async function deleteSchedule(objectId) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { deleteSchedule: fn } = await import('./supabase/scheduleService');
    return fn(objectId);
  }
  const { deleteSchedule: fn } = await import('./leancloud/scheduleService');
  return fn(objectId);
}

// ── Signup ───────────────────────────────────────────────

export async function createSignup(params) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { createSignup: fn } = await import('./supabase/signupService');
    return fn(params);
  }
  const { createSignup: fn } = await import('./leancloud/signupService');
  return fn(params);
}

export async function getSignupsBySchedule(scheduleId) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getSignupsBySchedule: fn } = await import('./supabase/signupService');
    return fn(scheduleId);
  }
  const { getSignupsBySchedule: fn } = await import('./leancloud/signupService');
  return fn(scheduleId);
}

export async function cancelSignup(objectId) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { cancelSignup: fn } = await import('./supabase/signupService');
    return fn(objectId);
  }
  const { cancelSignup: fn } = await import('./leancloud/signupService');
  return fn(objectId);
}

export async function updateSignup(objectId, updates) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { updateSignup: fn } = await import('./supabase/signupService');
    return fn(objectId, updates);
  }
  const { updateSignup: fn } = await import('./leancloud/signupService');
  return fn(objectId, updates);
}

export async function getSignupByPlayer(scheduleId, playerName) {
  const backend = getBackend();
  if (backend === 'supabase') {
    const { getSignupByPlayer: fn } = await import('./supabase/signupService');
    return fn(scheduleId, playerName);
  }
  const { getSignupByPlayer: fn } = await import('./leancloud/signupService');
  return fn(scheduleId, playerName);
}
