import { useMemo } from "react";
import { getMonthDays, isToday, isSameDay, getDayRaidStatus, getMonthName, getScheduleDate } from "../utils/helpers";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const STATUS_STYLES = {
  has_recruiting: {
    background: "rgba(102, 187, 106, 0.25)",
    border: "rgba(102, 187, 106, 0.5)",
    text: "#66bb6a",
  },
  all_full: {
    background: "rgba(255, 167, 38, 0.25)",
    border: "rgba(255, 167, 38, 0.5)",
    text: "#ffa726",
  },
  all_closed: {
    background: "rgba(239, 83, 80, 0.15)",
    border: "rgba(239, 83, 80, 0.4)",
    text: "#ef5350",
  },
  empty: {
    background: "var(--bg-tertiary)",
    border: "transparent",
    text: "var(--text-muted)",
  },
};

/**
 * RaidCalendar 月历组件
 *
 * @param {Object} props
 * @param {Array} props.schedules - RaidSchedule 数组
 * @param {Object} props.playerSignupMap - { scheduleId: signup } 玩家已报名的团次
 * @param {Date} props.selectedDate - 当前选中的日期
 * @param {Function} props.onSelectDate - 选择日期的回调
 * @param {number} props.month - 当前月份 (1-12)
 * @param {number} props.year - 当前年份
 * @param {Function} props.onMonthChange - 月份切换回调 (year, month) => {}
 */
export default function RaidCalendar({
  schedules = [],
  playerSignupMap = {},
  selectedDate,
  onSelectDate,
  month,
  year,
  onMonthChange,
}) {
  // 按日期分组 schedule
  const schedulesByDate = useMemo(() => {
    const map = {};
    schedules.forEach((schedule) => {
      const date = getScheduleDate(schedule);
      if (!date || isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(schedule);
    });
    return map;
  }, [schedules]);

  // 获取日历网格
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  // 上一个月
  const goToPrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange?.(newYear, newMonth);
  };

  // 下一个月
  const goToNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange?.(newYear, newMonth);
  };

  // 跳转到今天
  const goToToday = () => {
    const today = new Date();
    onMonthChange?.(today.getFullYear(), today.getMonth() + 1);
    onSelectDate?.(today);
  };

  // 获取某天的状态
  const getDayStatus = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const daySchedules = schedulesByDate[key] || [];
    return getDayRaidStatus(daySchedules);
  };

  // 获取某天的 raid 数量
  const getDayRaidCount = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const daySchedules = schedulesByDate[key] || [];
    return daySchedules.length;
  };

  // 获取某天玩家已报名的团次数量
  const getDayPlayerSignupCount = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const daySchedules = schedulesByDate[key] || [];
    // 计算这些团次中有多少是玩家已报名的
    return daySchedules.filter(s => playerSignupMap[s.objectId]).length;
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-card)",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      {/* 头部：月份导航 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={goToPrevMonth}
          style={{
            background: "var(--bg-tertiary)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-primary)",
            width: "36px",
            height: "36px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)" }}>
            {getMonthName(month)} {year}
          </span>
          <button
            onClick={goToToday}
            style={{
              background: "rgba(79, 195, 247, 0.1)",
              border: "none",
              borderRadius: "6px",
              color: "var(--color-frost)",
              fontSize: "12px",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            今天
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          style={{
            background: "var(--bg-tertiary)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-primary)",
            width: "36px",
            height: "36px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>
      </div>

      {/* 星期标签 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          marginBottom: "8px",
        }}
      >
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: i === 0 ? "var(--color-blood)" : "var(--text-muted)",
              fontWeight: 500,
              padding: "4px 0",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {days.map(({ date, isCurrentMonth, isPast }, index) => {
          const status = getDayStatus(date);
          const raidCount = getDayRaidCount(date);
          const playerSignupCount = getDayPlayerSignupCount(date);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const style = STATUS_STYLES[status] || STATUS_STYLES.empty;

          return (
            <button
              key={index}
              onClick={() => onSelectDate?.(date)}
              disabled={isPast && !isTodayDate}
              style={{
                position: "relative",
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                border: isSelected
                  ? "2px solid var(--color-frost)"
                  : isTodayDate
                  ? "2px solid rgba(79, 195, 247, 0.4)"
                  : "1px solid transparent",
                background: isPast && !isTodayDate ? "var(--bg-tertiary)" : style.background,
                opacity: isPast && !isTodayDate ? 0.4 : 1,
                cursor: isPast && !isTodayDate ? "default" : "pointer",
                transition: "all 0.15s ease",
                padding: "4px",
                minHeight: "44px",
              }}
            >
              {/* 日期数字 */}
              <span
                style={{
                  fontSize: isSelected ? "15px" : "14px",
                  fontWeight: isSelected ? 700 : isTodayDate ? 600 : 400,
                  color: isPast && !isTodayDate
                    ? "var(--text-muted)"
                    : isSelected
                    ? "var(--color-frost)"
                    : "var(--text-primary)",
                }}
              >
                {date.getDate()}
              </span>

              {/* 玩家已报名的小圆点 */}
              {playerSignupCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "2px",
                  }}
                >
                  {Array.from({ length: Math.min(playerSignupCount, 3) }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--color-plague)",
                      }}
                    />
                  ))}
                  {playerSignupCount > 3 && (
                    <span
                      style={{
                        fontSize: "8px",
                        color: "var(--color-plague)",
                        marginLeft: "1px",
                      }}
                    >
                      +
                    </span>
                  )}
                </div>
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}
