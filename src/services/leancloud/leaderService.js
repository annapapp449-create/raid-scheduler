import AV from './index';
import { isConfigured } from './index';

const CLASS_NAME = 'Leader';

// Generate 8-character share ID
function generateShareId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash password using SHA-256
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'raid_scheduler_salt_v1');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create a new leader
export async function createLeader({ nickname, server, characters, editPassword }) {
  const shareId = generateShareId();
  const hashedPassword = await hashPassword(editPassword);

  if (isConfigured()) {
    const acl = new AV.ACL();
    acl.setReadAccess('*', true);
    acl.setWriteAccess('*', false);

    const leader = new AV.Object(CLASS_NAME);
    leader.set('nickname', nickname);
    leader.set('server', server);
    leader.set('characters', characters);
    leader.set('editPassword', hashedPassword);
    leader.set('shareId', shareId);
    leader.setACL(acl);

    const saved = await leader.save();
    return {
      objectId: saved.id,
      nickname,
      server,
      characters,
      shareId,
    };
  }

  // Fallback: localStorage
  const leader = {
    objectId: `local_${Date.now()}`,
    nickname,
    server,
    characters,
    shareId,
    editPassword: hashedPassword,
  };

  const leaders = JSON.parse(localStorage.getItem('lc_leaders') || '[]');
  leaders.push(leader);
  localStorage.setItem('lc_leaders', JSON.stringify(leaders));

  return {
    objectId: leader.objectId,
    nickname,
    server,
    characters,
    shareId,
  };
}

// Get leader by shareId
export async function getLeaderByShareId(shareId) {
  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('shareId', shareId);
    const result = await query.first();

    if (!result) return null;

    return {
      objectId: result.id,
      nickname: result.get('nickname'),
      server: result.get('server'),
      characters: result.get('characters'),
      shareId: result.get('shareId'),
    };
  }

  // Fallback: localStorage
  const leaders = JSON.parse(localStorage.getItem('lc_leaders') || '[]');
  return leaders.find(l => l.shareId === shareId) || null;
}

// Verify edit password
export async function verifyPassword(leader, inputPassword) {
  const hashedInput = await hashPassword(inputPassword);

  if (isConfigured()) {
    const query = new AV.Query(CLASS_NAME);
    query.equalTo('shareId', leader.shareId);
    const result = await query.first();
    return result?.get('editPassword') === hashedInput;
  }

  // Fallback: localStorage
  const leaders = JSON.parse(localStorage.getItem('lc_leaders') || '[]');
  const stored = leaders.find(l => l.shareId === leader.shareId);
  return stored?.editPassword === hashedInput;
}

// Update leader profile
export async function updateLeader(objectId, updates) {
  if (isConfigured()) {
    const leader = AV.Object.createWithoutData(CLASS_NAME, objectId);
    if (updates.nickname) leader.set('nickname', updates.nickname);
    if (updates.server) leader.set('server', updates.server);
    if (updates.characters) leader.set('characters', updates.characters);
    await leader.save();
    return true;
  }

  // Fallback: localStorage
  const leaders = JSON.parse(localStorage.getItem('lc_leaders') || '[]');
  const index = leaders.findIndex(l => l.objectId === objectId);
  if (index !== -1) {
    leaders[index] = { ...leaders[index], ...updates };
    localStorage.setItem('lc_leaders', JSON.stringify(leaders));
    return true;
  }
  return false;
}
