import { getSupabase } from './index';

const TABLE = 'schedules';

// Create a new schedule
export async function createSchedule({
  leaderId, instanceId, instanceName, raidSize,
  characterName, characterClass, server,
  dayOfWeek, startTime, weekKey, teamConfig,
  fragmentEnabled = false,
}) {
  const supabase = getSupabase();

  const row = {
    leader_id: leaderId,
    instance_id: instanceId,
    instance_name: instanceName,
    raid_size: raidSize,
    character_name: characterName,
    character_class: characterClass,
    server,
    day_of_week: dayOfWeek,
    start_time: startTime,
    week_key: weekKey,
    signup_count: 0,
    status: 'recruiting',
    fragment_enabled: fragmentEnabled,
    fragment_status: fragmentEnabled ? 'open' : null,
    team_config: teamConfig,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`创建团次失败: ${error.message}`);

  return mapRow(data);
}

// Get schedules by leader
export async function getSchedulesByLeader(leaderId) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('leader_id', leaderId)
    .order('week_key', { ascending: false });

  if (error) throw new Error(`查询团次失败: ${error.message}`);
  return (data || []).map(mapRow);
}

// Get all schedules by weekKey with leader info (for unified home)
export async function getAllSchedulesByWeekKey(weekKey) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*, leaders(id, nickname, server, share_id)')
    .eq('week_key', weekKey)
    .order('day_of_week', { ascending: true });

  if (error) throw new Error(`查询本周开团失败: ${error.message}`);
  return (data || []).map(row => ({
    ...mapRow(row),
    leaderNickname: row.leaders?.nickname ?? null,
    leaderServer: row.leaders?.server ?? null,
    leaderShareId: row.leaders?.share_id ?? null,
  }));
}

// Get schedules by weekKey
export async function getSchedulesByWeekKey(weekKey) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('week_key', weekKey);

  if (error) throw new Error(`查询团次失败: ${error.message}`);
  return (data || []).map(mapRow);
}

// Update schedule
export async function updateSchedule(objectId, updates) {
  const supabase = getSupabase();

  const dbUpdates = {};
  const fieldMap = {
    signupCount: 'signup_count',
    status: 'status',
    fragmentEnabled: 'fragment_enabled',
    fragmentStatus: 'fragment_status',
    fragmentPlayer: 'fragment_player',
    fragmentServer: 'fragment_server',
    teamConfig: 'team_config',
    instanceId: 'instance_id',
    instanceName: 'instance_name',
    raidSize: 'raid_size',
    characterName: 'character_name',
    characterClass: 'character_class',
    server: 'server',
    dayOfWeek: 'day_of_week',
    startTime: 'start_time',
    weekKey: 'week_key',
  };

  Object.entries(updates).forEach(([key, value]) => {
    const dbKey = fieldMap[key] || key;
    dbUpdates[dbKey] = value;
  });

  const { error } = await supabase
    .from(TABLE)
    .update(dbUpdates)
    .eq('id', objectId);

  if (error) throw new Error(`更新团次失败: ${error.message}`);
  return true;
}

// Delete schedule
export async function deleteSchedule(objectId) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', objectId);

  if (error) throw new Error(`删除团次失败: ${error.message}`);
  return true;
}

// Map DB row (snake_case) to app object (camelCase)
function mapRow(row) {
  return {
    objectId: row.id,
    leaderId: row.leader_id,
    instanceId: row.instance_id,
    instanceName: row.instance_name,
    raidSize: row.raid_size,
    characterName: row.character_name,
    characterClass: row.character_class,
    server: row.server,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    weekKey: row.week_key,
    signupCount: row.signup_count,
    status: row.status,
    fragmentEnabled: row.fragment_enabled,
    fragmentStatus: row.fragment_status,
    teamConfig: row.team_config,
  };
}
