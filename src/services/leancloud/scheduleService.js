import AV from './index';
import { isConfigured } from './index';

const CLASS_NAME = 'Schedule';

// Create a new schedule
export async function createSchedule({ leaderId, instanceId, instanceIds, instanceName, raidSize, characterName, characterClass, server, dayOfWeek, startTime, weekKey, teamConfig, fragmentEnabled = false }) {
  const allInstanceIds = instanceIds || (instanceId ? [instanceId] : []);
  const data = {
    instanceId: allInstanceIds[0] || instanceId,
    instanceIds: allInstanceIds,
    instanceName,
    raidSize,
    characterName,
    characterClass,
    server,
    dayOfWeek,
    startTime,
    weekKey,
    signupCount: 0,
    status: 'recruiting',
    fragmentEnabled,
    fragmentStatus: fragmentEnabled ? 'open' : null,
    teamConfig,
  };

  if (isConfigured()) {
    const acl = new AV.ACL();
    acl.setReadAccess('*', true);
    acl.setWriteAccess('*', false);

    const schedule = new AV.Object(CLASS_NAME);
    schedule.set('leader', AV.Object.createWithoutData('Leader', leaderId));
    Object.entries(data).forEach(([key, value]) => schedule.set(key, value));
    schedule.setACL(acl);

    const saved = await schedule.save();
    return { objectId: saved.id, ...data };
  }

  // Fallback: localStorage
  const schedule = {
    objectId: `local_${Date.now()}`,
    leaderId,
    ...data,
  };

  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  schedules.push(schedule);
  localStorage.setItem('lc_schedules', JSON.stringify(schedules));

  return schedule;
}

// Get schedules by leader
export async function getSchedulesByLeader(leaderId) {
  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('leader', AV.Object.createWithoutData('Leader', leaderId));
    query.descending('weekKey');
    const results = await query.find();

    return results.map(r => ({
      objectId: r.id,
      leaderId: r.get('leader')?.id,
      instanceId: r.get('instanceId'),
      instanceName: r.get('instanceName'),
      raidSize: r.get('raidSize'),
      characterName: r.get('characterName'),
      characterClass: r.get('characterClass'),
      server: r.get('server'),
      dayOfWeek: r.get('dayOfWeek'),
      startTime: r.get('startTime'),
      weekKey: r.get('weekKey'),
      signupCount: r.get('signupCount'),
      status: r.get('status'),
      fragmentEnabled: r.get('fragmentEnabled'),
      fragmentStatus: r.get('fragmentStatus'),
      fragmentPlayer: r.get('fragmentPlayer'),
      fragmentServer: r.get('fragmentServer'),
      teamConfig: r.get('teamConfig'),
    }));
  }

  // Fallback: localStorage
  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  return schedules.filter(s => s.leaderId === leaderId);
}

// Get schedules by weekKey
export async function getSchedulesByWeekKey(weekKey) {
  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('weekKey', weekKey);
    const results = await query.find();

    return results.map(r => ({
      objectId: r.id,
      leaderId: r.get('leader')?.id,
      instanceId: r.get('instanceId'),
      instanceName: r.get('instanceName'),
      raidSize: r.get('raidSize'),
      characterName: r.get('characterName'),
      characterClass: r.get('characterClass'),
      server: r.get('server'),
      dayOfWeek: r.get('dayOfWeek'),
      startTime: r.get('startTime'),
      weekKey: r.get('weekKey'),
      signupCount: r.get('signupCount'),
      status: r.get('status'),
      fragmentEnabled: r.get('fragmentEnabled'),
      fragmentStatus: r.get('fragmentStatus'),
      fragmentPlayer: r.get('fragmentPlayer'),
      fragmentServer: r.get('fragmentServer'),
      teamConfig: r.get('teamConfig'),
    }));
  }

  // Fallback: localStorage
  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  return schedules.filter(s => s.weekKey === weekKey);
}

// Update schedule
export async function updateSchedule(objectId, updates) {
  if (isConfigured()) {
    const schedule = AV.Object.createWithoutData(CLASS_NAME, objectId);
    Object.entries(updates).forEach(([key, value]) => schedule.set(key, value));
    await schedule.save();
    return true;
  }

  // Fallback: localStorage
  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  const index = schedules.findIndex(s => s.objectId === objectId);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    localStorage.setItem('lc_schedules', JSON.stringify(schedules));
    return true;
  }
  return false;
}

// Delete schedule
export async function deleteSchedule(objectId) {
  if (isConfigured()) {
    const schedule = AV.Object.createWithoutData(CLASS_NAME, objectId);
    await schedule.destroy();
    return true;
  }

  // Fallback: localStorage
  const schedules = JSON.parse(localStorage.getItem('lc_schedules') || '[]');
  const filtered = schedules.filter(s => s.objectId !== objectId);
  localStorage.setItem('lc_schedules', JSON.stringify(filtered));
  return true;
}
