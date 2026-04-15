import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import RaidCalendar from "../components/RaidCalendar";
import DayRaidsPanel from "../components/DayRaidsPanel";
import { useToast } from "../components/Toast";
import { isSameDay, getScheduleDate } from "../utils/helpers";
import { getLeaderByShareId } from "../services/api";
import { getSchedulesByLeader } from "../services/api";
import { getSignupsBySchedule, createSignup, cancelSignup as cancelSignupService, updateSchedule } from "../services/api";

/**
 * 玩家报名页
 * 团长分享给玩家的核心页面
 */
export default function RaidSignup() {
  const { shareId } = useParams();
  const { showToast, ToastContainer } = useToast();

  const [leader, setLeader] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [signupsMap, setSignupsMap] = useState({});
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 日历状态
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // 数据加载：服务函数内部已处理 LeanCloud / localStorage 两条路
  useEffect(() => {
    async function loadData() {
      try {
        const leaderData = await getLeaderByShareId(shareId);
        if (leaderData) {
          setLeader(leaderData);
          const schedulesData = await getSchedulesByLeader(leaderData.objectId);
          setSchedules(schedulesData);

          const signups = {};
          for (const schedule of schedulesData) {
            signups[schedule.objectId] = await getSignupsBySchedule(schedule.objectId);
          }
          setSignupsMap(signups);

          // 检查 localStorage 是否有已报名记录
          Object.entries(signups).forEach(([scheduleId, scheduleSignups]) => {
            scheduleSignups.forEach((signup) => {
              const savedId = localStorage.getItem(`signup_${scheduleId}`);
              if (savedId === signup.objectId) {
                setCurrentPlayerId(signup.objectId);
              }
            });
          });
        }
        // leader 为 null 时显示"页面不存在"
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [shareId]);

  // 选中日期的团次
  const selectedDateSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const scheduleDate = getScheduleDate(schedule);
      return scheduleDate && isSameDay(scheduleDate, selectedDate);
    });
  }, [schedules, selectedDate]);

  // 报名
  const handleSignup = async (scheduleId, formData) => {
    try {
      const newSignup = await createSignup({
        scheduleId,
        playerName: formData.playerName,
        playerServer: formData.playerServer,
        playerClass: formData.playerClass,
        playerRole: formData.playerRole,
        playerSpec: formData.playerSpec,
        contactInfo: formData.contactInfo,
        wantFragment: formData.wantFragment,
      });

      setSignupsMap((prev) => ({
        ...prev,
        [scheduleId]: [...(prev[scheduleId] || []), newSignup],
      }));

      const schedule = schedules.find((s) => s.objectId === scheduleId);
      const newCount = (schedule?.signupCount || 0) + 1;
      const scheduleUpdates = {
        signupCount: newCount,
        status: newCount >= (schedule?.raidSize || 25) ? "full" : schedule?.status,
      };
      const fragmentReserved = formData.wantFragment && schedule?.fragmentStatus === "open";
      if (fragmentReserved) {
        scheduleUpdates.fragmentStatus = "reserved";
        scheduleUpdates.fragmentPlayer = formData.playerName;
        scheduleUpdates.fragmentServer = formData.playerServer;
      }

      // 持久化到数据库
      await updateSchedule(scheduleId, scheduleUpdates);

      setSchedules((prev) =>
        prev.map((s) =>
          s.objectId === scheduleId ? { ...s, ...scheduleUpdates } : s
        )
      );

      localStorage.setItem(`signup_${scheduleId}`, newSignup.objectId);
      setCurrentPlayerId(newSignup.objectId);
      showToast("报名成功", "success");
    } catch (error) {
      console.error("报名失败:", error);
      showToast("报名失败，请重试", "error");
    }
  };

  // 取消报名
  const handleCancelSignup = async (scheduleId) => {
    const signupId = localStorage.getItem(`signup_${scheduleId}`);
    if (!signupId) return;

    try {
      await cancelSignupService(signupId);

      setSignupsMap((prev) => ({
        ...prev,
        [scheduleId]: prev[scheduleId].filter((s) => s.objectId !== signupId),
      }));

      setSchedules((prev) =>
        prev.map((s) => {
          if (s.objectId === scheduleId) {
            const newCount = Math.max(0, s.signupCount - 1);
            return {
              ...s,
              signupCount: newCount,
              status: newCount < s.raidSize && s.status === "full" ? "recruiting" : s.status,
            };
          }
          return s;
        })
      );

      localStorage.removeItem(`signup_${scheduleId}`);
      setCurrentPlayerId(null);
      showToast("已取消报名", "info");
    } catch (error) {
      console.error("取消报名失败:", error);
      showToast("取消失败，请重试", "error");
    }
  };

  // 月份切换
  const handleMonthChange = (year, month) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: "100px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-card)" }} />
          <div className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-card)" }} />
          <div className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-card)" }} />
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="container" style={{ paddingTop: "100px", textAlign: "center" }}>
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-card)",
            padding: "40px 24px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>😢</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>页面不存在</h2>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>
            团长信息不存在或链接已失效
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "20px", paddingBottom: "40px" }}>
      <ToastContainer />

      {/* 团长信息头部 */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          marginBottom: "16px",
          border: "1px solid rgba(79, 195, 247, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-frost) 0%, var(--color-frost-dim) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--bg-primary)",
            }}
          >
            {leader.nickname.charAt(0)}
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {leader.nickname}
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {leader.server}
            </p>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ color: "var(--color-frost)" }}>●</span>
          选择日期查看团次并报名
        </p>
      </div>

      {/* 日历 */}
      <RaidCalendar
        schedules={schedules}
        playerSignupMap={Object.fromEntries(
          Object.entries(signupsMap)
            .filter(([_, signups]) => signups.some(s => s.objectId === currentPlayerId))
            .map(([scheduleId, signups]) => [scheduleId, signups.find(s => s.objectId === currentPlayerId)])
        )}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        month={calendarMonth}
        year={calendarYear}
        onMonthChange={handleMonthChange}
      />

      {/* 选中日期的团次 */}
      <DayRaidsPanel
        selectedDate={selectedDate}
        schedules={selectedDateSchedules}
        signupsMap={signupsMap}
        currentSignupId={currentPlayerId}
        isLeader={false}
        onSignup={handleSignup}
        onCancelSignup={handleCancelSignup}
      />

      {/* 底部提示 */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-card)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)" }}>
          报名信息仅团长可见
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
          如有问题请联系团长
        </p>
      </div>
    </div>
  );
}
