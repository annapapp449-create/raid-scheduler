import { WEEKDAYS } from "../utils/constants";

/**
 * 周历组件
 * 显示一周的团次列表，按日期分组
 */
export default function WeekCalendar({ schedules, signupsMap = {}, renderScheduleCard }) {
  // 按星期几分组
  const groupedByDay = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    label: WEEKDAYS[i],
    isToday: i === new Date().getDay(),
    schedules: [],
  }));

  // 填充数据
  schedules.forEach((schedule) => {
    if (groupedByDay[schedule.dayOfWeek]) {
      groupedByDay[schedule.dayOfWeek].schedules.push(schedule);
    }
  });

  // 排序：今天排最前，其余按周顺序
  const today = new Date().getDay();
  const sortedDays = [
    ...groupedByDay.filter((g) => g.dayOfWeek === today),
    ...groupedByDay.filter((g) => g.dayOfWeek !== today),
  ];

  const hasAnySchedule = schedules.length > 0;

  if (!hasAnySchedule) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📋</div>
        <p style={{ margin: "0 0 8px", fontSize: "15px" }}>暂无开团计划</p>
        <p style={{ margin: 0, fontSize: "13px" }}>请联系团长创建开团计划</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sortedDays.map(({ dayOfWeek, label, isToday, schedules: daySchedules }) => {
        if (daySchedules.length === 0) return null;

        return (
          <div key={dayOfWeek}>
            {/* 星期标签 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isToday ? "var(--color-frost)" : "var(--text-primary)",
                }}
              >
                {label}
              </span>
              {isToday && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    background: "rgba(79, 195, 247, 0.2)",
                    color: "var(--color-frost)",
                    borderRadius: "var(--radius-badge)",
                  }}
                >
                  今天
                </span>
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {daySchedules.length}个团
              </span>
            </div>

            {/* 团次卡片列表 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {daySchedules.map((schedule) =>
                renderScheduleCard(schedule, signupsMap[schedule.objectId] || [])
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
