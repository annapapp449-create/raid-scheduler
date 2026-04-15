import { getSupabase } from './index';

const TABLE = 'signups';

// Create a new signup
export async function createSignup({
  scheduleId, playerName, playerServer,
  playerClass, playerRole, playerSpec,
  contactInfo, wantFragment,
}) {
  const supabase = getSupabase();

  const row = {
    schedule_id: scheduleId,
    player_name: playerName,
    player_server: playerServer,
    player_class: playerClass,
    player_role: playerRole,
    player_spec: playerSpec,
    contact_info: contactInfo || '',
    status: 'confirmed',
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`报名失败: ${error.message}`);

  return mapRow(data);
}

// Get signups by schedule
export async function getSignupsBySchedule(scheduleId) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('schedule_id', scheduleId)
    .eq('status', 'confirmed');

  if (error) throw new Error(`查询报名失败: ${error.message}`);
  return (data || []).map(mapRow);
}

// Cancel signup (soft delete via status)
export async function cancelSignup(objectId) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'cancelled' })
    .eq('id', objectId);

  if (error) throw new Error(`取消报名失败: ${error.message}`);
  return true;
}

// Update signup
export async function updateSignup(objectId, updates) {
  const supabase = getSupabase();

  const dbUpdates = {};
  const fieldMap = {
    playerName: 'player_name',
    playerServer: 'player_server',
    playerClass: 'player_class',
    playerRole: 'player_role',
    playerSpec: 'player_spec',
    contactInfo: 'contact_info',
    status: 'status',
  };

  Object.entries(updates).forEach(([key, value]) => {
    const dbKey = fieldMap[key] || key;
    dbUpdates[dbKey] = value;
  });

  const { error } = await supabase
    .from(TABLE)
    .update(dbUpdates)
    .eq('id', objectId);

  if (error) throw new Error(`更新报名失败: ${error.message}`);
  return true;
}

// Get signup by player (for duplicate check)
export async function getSignupByPlayer(scheduleId, playerName) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('schedule_id', scheduleId)
    .eq('player_name', playerName)
    .eq('status', 'confirmed')
    .maybeSingle();

  if (error) throw new Error(`查询报名失败: ${error.message}`);
  return data ? { objectId: data.id } : null;
}

// Map DB row (snake_case) to app object (camelCase)
function mapRow(row) {
  return {
    objectId: row.id,
    scheduleId: row.schedule_id,
    playerName: row.player_name,
    playerServer: row.player_server,
    playerClass: row.player_class,
    playerRole: row.player_role,
    playerSpec: row.player_spec,
    contactInfo: row.contact_info,
    status: row.status,
  };
}
