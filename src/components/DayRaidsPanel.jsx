import RaidCard from "./RaidCard";

/**
 * DayRaidsPanel 组件
 * 显示选中日期的团次列表
 *
 * @param {Object} props
 * @param {Date} props.selectedDate - 选中的日期
 * @param {Array} props.schedules - 该日期的所有团次
 * @param {Object} props.signupsMap - { scheduleId: signups[] }
 * @param {string|null} props.currentSignupId - 当前玩家的报名 ID
 * @param {boolean} props.isLeader - 是否为团长视角
 * @param {Function} props.onSignup - 报名回调
 * @param {Function} props.onCancelSignup - 取消报名回调
 * @param {Function} props.onRemoveSignup - 移除报名回调（团长用）
 */
export default function DayRaidsPanel({
  selectedDate,
  schedules = [],
  signupsMap = {},
  currentSignupId,
  isLeader = false,
  onSignup,
  onCancelSignup,
  onRemoveSignup,
}) {
  if (!selectedDate) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        选择一个日期查看团次
      </div>
    );
  }

  const dateStr = `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 周${["日", "一", "二", "三", "四", "五", "六"][selectedDate.getDay()]}`;

  if (schedules.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-card)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {dateStr}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          暂无团次安排
        </div>
        {isLeader && (
          <div
            style={{
              marginTop: "12px",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            点击下方"添加团次"发布新团
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {dateStr}
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          共 {schedules.length} 个团
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.map((schedule) => (
          <RaidCard
            key={schedule.objectId}
            schedule={schedule}
            signups={signupsMap[schedule.objectId] || []}
            currentSignupId={currentSignupId}
            isLeader={isLeader}
            onSignup={isLeader ? undefined : onSignup}
            onCancelSignup={isLeader ? undefined : onCancelSignup}
            onRemoveSignup={isLeader ? onRemoveSignup : undefined}
          />
        ))}
      </div>
    </div>
  );
}
