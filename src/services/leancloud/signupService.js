import AV from './index';
import { isConfigured } from './index';

const CLASS_NAME = 'Signup';

// Create a new signup
export async function createSignup({ scheduleId, playerName, playerServer, playerClass, playerRole, playerSpec, contactInfo, wantFragment }) {
  const data = {
    playerName,
    playerServer,
    playerClass,
    playerRole,
    playerSpec,
    contactInfo: contactInfo || '',
    status: 'confirmed',
  };

  if (isConfigured()) {
    const acl = new AV.ACL();
    acl.setReadAccess('*', true);
    acl.setWriteAccess('*', false);

    const signup = new AV.Object(CLASS_NAME);
    signup.set('schedule', AV.Object.createWithoutData('Schedule', scheduleId));
    Object.entries(data).forEach(([key, value]) => signup.set(key, value));
    signup.setACL(acl);

    const saved = await signup.save();
    return { objectId: saved.id, ...data };
  }

  // Fallback: localStorage
  const signup = {
    objectId: `local_${Date.now()}`,
    scheduleId,
    ...data,
    wantFragment,
  };

  const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
  signups.push(signup);
  localStorage.setItem('lc_signups', JSON.stringify(signups));

  return signup;
}

// Get signups by schedule
export async function getSignupsBySchedule(scheduleId) {
  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('schedule', AV.Object.createWithoutData('Schedule', scheduleId));
    query.equalTo('status', 'confirmed');
    const results = await query.find();

    return results.map(r => ({
      objectId: r.id,
      scheduleId: r.get('schedule')?.id,
      playerName: r.get('playerName'),
      playerServer: r.get('playerServer'),
      playerClass: r.get('playerClass'),
      playerRole: r.get('playerRole'),
      playerSpec: r.get('playerSpec'),
      contactInfo: r.get('contactInfo'),
      status: r.get('status'),
    }));
  }

  // Fallback: localStorage
  const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
  return signups.filter(s => s.scheduleId === scheduleId && s.status === 'confirmed');
}

// Cancel signup
export async function cancelSignup(objectId) {
  if (isConfigured()) {
    const signup = AV.Object.createWithoutData(CLASS_NAME, objectId);
    signup.set('status', 'cancelled');
    await signup.save();
    return true;
  }

  // Fallback: localStorage
  const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
  const index = signups.findIndex(s => s.objectId === objectId);
  if (index !== -1) {
    signups[index].status = 'cancelled';
    localStorage.setItem('lc_signups', JSON.stringify(signups));
    return true;
  }
  return false;
}

// Update signup
export async function updateSignup(objectId, updates) {
  if (isConfigured()) {
    const signup = AV.Object.createWithoutData(CLASS_NAME, objectId);
    Object.entries(updates).forEach(([key, value]) => signup.set(key, value));
    await signup.save();
    return true;
  }

  // Fallback: localStorage
  const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
  const index = signups.findIndex(s => s.objectId === objectId);
  if (index !== -1) {
    signups[index] = { ...signups[index], ...updates };
    localStorage.setItem('lc_signups', JSON.stringify(signups));
    return true;
  }
  return false;
}

// Get signup by player (for checking existing signup)
export async function getSignupByPlayer(scheduleId, playerName) {
  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('schedule', AV.Object.createWithoutData('Schedule', scheduleId));
    query.equalTo('playerName', playerName);
    query.equalTo('status', 'confirmed');
    const result = await query.first();
    return result ? { objectId: result.id } : null;
  }

  // Fallback: localStorage
  const signups = JSON.parse(localStorage.getItem('lc_signups') || '[]');
  return signups.find(s => s.scheduleId === scheduleId && s.playerName === playerName && s.status === 'confirmed') || null;
}
