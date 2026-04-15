import { getSupabase } from './index';

const TABLE = 'leaders';

// Hash password using SHA-256 (same algorithm as LeanCloud version)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'raid_scheduler_salt_v1');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate 8-character share ID
function generateShareId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new leader
export async function createLeader({ nickname, server, characters, editPassword }) {
  const supabase = getSupabase();
  const shareId = generateShareId();
  const hashedPassword = await hashPassword(editPassword);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nickname,
      server,
      characters,
      edit_password: hashedPassword,
      share_id: shareId,
    })
    .select('id, nickname, server, characters, share_id')
    .single();

  if (error) throw new Error(`创建团长失败: ${error.message}`);

  return {
    objectId: data.id,
    nickname: data.nickname,
    server: data.server,
    characters: data.characters,
    shareId: data.share_id,
  };
}

// Get leader by shareId
export async function getLeaderByShareId(shareId) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nickname, server, characters, share_id')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error) throw new Error(`查询团长失败: ${error.message}`);
  if (!data) return null;

  return {
    objectId: data.id,
    nickname: data.nickname,
    server: data.server,
    characters: data.characters,
    shareId: data.share_id,
  };
}

// Verify edit password
export async function verifyPassword(leader, inputPassword) {
  const supabase = getSupabase();
  const hashedInput = await hashPassword(inputPassword);

  const { data, error } = await supabase
    .from(TABLE)
    .select('edit_password')
    .eq('share_id', leader.shareId)
    .maybeSingle();

  if (error) throw new Error(`验证密码失败: ${error.message}`);
  return data?.edit_password === hashedInput;
}

// Update leader profile
export async function updateLeader(objectId, updates) {
  const supabase = getSupabase();

  const dbUpdates = {};
  if (updates.nickname) dbUpdates.nickname = updates.nickname;
  if (updates.server) dbUpdates.server = updates.server;
  if (updates.characters) dbUpdates.characters = updates.characters;

  const { error } = await supabase
    .from(TABLE)
    .update(dbUpdates)
    .eq('id', objectId);

  if (error) throw new Error(`更新团长失败: ${error.message}`);
  return true;
}
