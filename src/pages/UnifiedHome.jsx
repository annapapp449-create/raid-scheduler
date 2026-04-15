import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSchedulesByWeekKey } from "../services/api";
import { getMyLeaders, getWeekKey } from "../utils/helpers";
import { RAID_INSTANCES, WEEKDAYS } from "../utils/constants";
import ClassIcon from "../components/ClassIcon";
import { useToast } from "../components/Toast";

/**
 * 统一首页（公开看板）
 *
 * - 展示本周所有团长的开团（按星期分组）
 * - 顶部识别本机团长身份，提供快捷入口
 * - 点击任意团次 → 跳转到该团长的报名页 /r/:shareId
 */
export default function UnifiedHome() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = 本周, ±1 = 上/下周
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myLeaders, setMyLeaders] = useState([]);

  // 根据偏移量计算目标周的 weekKey
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + weekOffset * 7);
  const weekKey = getWeekKey(targetDate);

  useEffect(() => {
    setMyLeaders(getMyLeaders());
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setSchedules([]);
    getAllSchedulesByWeekKey(weekKey)
      .then(setSchedules)
      .catch((err) => {
        console.error("加载失败:", err);
        showToast("加载失败，请稍后重试", "error");
      })
      .finally(() => setIsLoading(false));
  }, [weekKey]);

  // 按 dayOfWeek 分组，只保留有团次的天
  const byDay = [0, 1, 2, 3, 4, 5, 6]
    .map((dow) => ({
      dow,
      label: WEEKDAYS[dow],
      schedules: schedules.filter((s) => s.dayOfWeek === dow),
    }))
    .filter((d) => d.schedules.length > 0);

  const myLeaderShareIds = new Set(myLeaders.map((l) => l.shareId));
  const hasMyLeader = myLeaders.length > 0;

  // 周标签
  const weekLabel =
    weekOffset === 0 ? "本周" : weekOffset === 1 ? "下周" : weekOffset === -1 ? "上周" : `${weekKey}`;

  return (
    <div className="container" style={{ paddingTop: "20px", paddingBottom: "48px" }}>
      <ToastContainer />

      {/* 顶部：标题 + 我的面板入口 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--color-frost)",
          }}
        >
          本周开团
        </h1>
        {hasMyLeader ? (
          <button
            onClick={() =>
              myLeaders.length === 1
                ? navigate(`/leader/${myLeaders[0].shareId}`)
                : navigate("/create")
            }
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            我的面板
          </button>
        ) : (
          <button
            onClick={() => navigate("/create")}
            className="btn btn-primary"
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            我要开团
          </button>
        )}
      </div>

      {/* 周导航 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-card)",
          padding: "10px 8px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "22px",
            cursor: "pointer",
            padding: "4px 12px",
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {weekLabel}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            {weekKey}
          </p>
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "22px",
            cursor: "pointer",
            padding: "4px 12px",
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

      {/* 内容区 */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingTop: "8px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "72px", borderRadius: "var(--radius-card)" }}
            />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: "36px", margin: "0 0 12px" }}>⚔️</p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              margin: "0 0 20px",
            }}
          >
            {weekLabel}暂无开团
          </p>
          {!hasMyLeader && (
            <button
              onClick={() => navigate("/create")}
              className="btn btn-primary"
            >
              成为第一个开团的人
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {byDay.map(({ dow, label, schedules: daySchedules }) => (
            <div key={dow}>
              {/* 星期标题 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--bg-tertiary)",
                  }}
                />
                <span
                  style={{ fontSize: "12px", color: "var(--text-muted)" }}
                >
                  {daySchedules.length} 团
                </span>
              </div>

              {/* 当天团次列表 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {daySchedules.map((schedule) => {
                  const instance = RAID_INSTANCES.find(
                    (r) => r.id === schedule.instanceId
                  );
                  const isMyRaid = myLeaderShareIds.has(schedule.leaderShareId);
                  const isFull = schedule.signupCount >= schedule.raidSize;
                  const isClosed = schedule.status === "closed";

                  return (
                    <div
                      key={schedule.objectId}
                      onClick={() =>
                        navigate(`/r/${schedule.leaderShareId}`)
                      }
                      style={{
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-card)",
                        padding: "12px 14px",
                        cursor: "pointer",
                        border: isMyRaid
                          ? "1px solid rgba(79,195,247,0.4)"
                          : "1px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "border-color 0.15s, background 0.15s",
                        opacity: isClosed ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = isMyRaid
                          ? "var(--color-frost)"
                          : "var(--color-bone)";
                        e.currentTarget.style.background =
                          "var(--bg-tertiary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isMyRaid
                          ? "rgba(79,195,247,0.4)"
                          : "transparent";
                        e.currentTarget.style.background =
                          "var(--bg-secondary)";
                      }}
                    >
                      {/* 职业图标 */}
                      <div style={{ flexShrink: 0 }}>
                        <ClassIcon
                          classId={schedule.characterClass}
                          size={36}
                        />
                      </div>

                      {/* 主信息 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "3px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {schedule.leaderNickname || "未知团长"}
                          </span>
                          {isMyRaid && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                background: "rgba(79,195,247,0.15)",
                                color: "var(--color-frost)",
                                borderRadius: "999px",
                                flexShrink: 0,
                              }}
                            >
                              我的
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {instance?.label || schedule.instanceName}
                          {" · "}
                          {schedule.leaderServer || schedule.server}
                          {" · "}
                          {schedule.startTime}
                        </p>
                      </div>

                      {/* 报名进度 + 状态 */}
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: isFull
                              ? "var(--color-blood)"
                              : "var(--color-frost)",
                          }}
                        >
                          {schedule.signupCount}/{schedule.raidSize}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {isClosed
                            ? "已关闭"
                            : isFull
                            ? "已满"
                            : "招募中"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
