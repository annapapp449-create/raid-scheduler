import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import RaidCalendar from "../components/RaidCalendar";
import DayRaidsPanel from "../components/DayRaidsPanel";
import QRCodeCard from "../components/QRCodeCard";
import { mockLeader, mockSchedules, mockSignups } from "../utils/mockData";
import { RAID_INSTANCES, SERVERS, WEEKDAYS } from "../utils/constants";
import { generateShareUrl, getWeekKey, isSameDay, getScheduleDate } from "../utils/helpers";
import { useToast } from "../components/Toast";

/**
 * 团长管理面板
 */
export default function LeaderDashboard() {
  const { shareId } = useParams();
  const [searchParams] = useSearchParams();
  const { showToast, ToastContainer } = useToast();

  // 鉴权状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // 数据状态
  const [leader, setLeader] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [signupsMap, setSignupsMap] = useState({});

  // UI 状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 日历状态
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // 模拟数据加载
  useEffect(() => {
    setLeader(mockLeader);
    setSchedules(mockSchedules);
    setSignupsMap(mockSignups);
  }, [shareId]);

  // 验证密码
  useEffect(() => {
    const pwd = searchParams.get("pwd");
    if (pwd && pwd === mockLeader.editPassword) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      sessionStorage.setItem(`auth_${shareId}`, "true");
    } else if (sessionStorage.getItem(`auth_${shareId}`) === "true") {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
    }
  }, [shareId, searchParams]);

  const handlePasswordSubmit = () => {
    if (passwordInput === mockLeader.editPassword) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setAuthError("");
      sessionStorage.setItem(`auth_${shareId}`, "true");
    } else {
      setAuthError("密码错误");
      setPasswordInput("");
    }
  };

  // 选中日期的团次
  const selectedDateSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const scheduleDate = getScheduleDate(schedule);
      return scheduleDate && isSameDay(scheduleDate, selectedDate);
    });
  }, [schedules, selectedDate]);

  // 添加团次弹窗表单
  const [newSchedule, setNewSchedule] = useState({
    instanceId: RAID_INSTANCES[0].id,
    characterName: "",
    server: SERVERS[0],
    dayOfWeek: 0,
    startTime: "20:00",
    fragmentEnabled: false,
    note: "",
  });

  const handleOpenAddModal = () => {
    // 根据选中的日期预填 dayOfWeek
    setNewSchedule((prev) => ({
      ...prev,
      dayOfWeek: selectedDate.getDay(),
      characterName: leader?.characters[0] || "",
    }));
    setShowAddModal(true);
  };

  const handleAddSchedule = () => {
    const instance = RAID_INSTANCES.find((r) => r.id === newSchedule.instanceId);
    const schedule = {
      objectId: `schedule_${Date.now()}`,
      leader: { objectId: leader?.objectId },
      instanceId: newSchedule.instanceId,
      raidSize: instance?.size || 25,
      characterName: newSchedule.characterName || leader?.characters[0],
      server: newSchedule.server,
      dayOfWeek: parseInt(newSchedule.dayOfWeek),
      startTime: newSchedule.startTime,
      weekKey: getWeekKey(),
      fragmentEnabled: newSchedule.fragmentEnabled && instance?.hasFragment,
      fragmentStatus: null,
      fragmentPlayer: null,
      fragmentServer: null,
      signupCount: 0,
      status: "recruiting",
      note: newSchedule.note,
    };

    setSchedules((prev) => [...prev, schedule]);
    setSignupsMap((prev) => ({ ...prev, [schedule.objectId]: [] }));
    setShowAddModal(false);
    showToast("团次添加成功", "success");
  };

  const handleRemoveSignup = (scheduleId, signupId) => {
    setSignupsMap((prev) => ({
      ...prev,
      [scheduleId]: prev[scheduleId].filter((s) => s.objectId !== signupId),
    }));
    setSchedules((prev) =>
      prev.map((s) => (s.objectId === scheduleId ? { ...s, signupCount: s.signupCount - 1 } : s))
    );
    showToast("已移除报名", "info");
  };

  // 月份切换
  const handleMonthChange = (year, month) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  if (!leader) {
    return (
      <div className="container" style={{ paddingTop: "100px", textAlign: "center" }}>
        <div className="skeleton" style={{ width: "200px", height: "24px", margin: "0 auto 16px" }} />
        <div className="skeleton" style={{ width: "150px", height: "16px", margin: "0 auto" }} />
      </div>
    );
  }

  // 密码输入弹窗
  if (showPasswordModal) {
    return (
      <div className="container" style={{ paddingTop: "100px" }}>
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-card)",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: "20px" }}>管理面板</h2>
          <p style={{ margin: "0 0 24px", color: "var(--text-secondary)", fontSize: "14px" }}>
            请输入管理密码
          </p>
          <input
            type="password"
            className="input"
            placeholder="6位管理密码"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            style={{ marginBottom: "16px", textAlign: "center", fontSize: "18px", letterSpacing: "8px" }}
          />
          {authError && (
            <p style={{ margin: "0 0 16px", color: "var(--color-blood)", fontSize: "13px" }}>{authError}</p>
          )}
          <button onClick={handlePasswordSubmit} className="btn btn-primary" style={{ width: "100%" }}>
            进入管理
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const shareUrl = generateShareUrl(shareId);

  return (
    <div className="container" style={{ paddingTop: "24px", paddingBottom: "40px" }}>
      <ToastContainer />

      {/* 团长信息 */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>{leader.nickname}</h2>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--text-secondary)" }}>
          {leader.server} · {leader.characters.length}个角色
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {leader.characters.map((char, i) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-badge)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* 日历 */}
      <RaidCalendar
        schedules={schedules}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        month={calendarMonth}
        year={calendarYear}
        onMonthChange={handleMonthChange}
      />

      {/* 操作按钮 */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          + 添加团次
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="btn btn-secondary"
          style={{ flex: 1 }}
        >
          分享给玩家
        </button>
      </div>

      {/* 选中日期的团次 */}
      <DayRaidsPanel
        selectedDate={selectedDate}
        schedules={selectedDateSchedules}
        signupsMap={signupsMap}
        currentSignupId={null}
        isLeader={true}
        onRemoveSignup={handleRemoveSignup}
      />

      {/* 添加团次弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid var(--bg-tertiary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>添加团次</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* 副本选择 */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  副本 *
                </label>
                <select
                  className="input"
                  value={newSchedule.instanceId}
                  onChange={(e) => {
                    const instance = RAID_INSTANCES.find((r) => r.id === e.target.value);
                    setNewSchedule((prev) => ({
                      ...prev,
                      instanceId: e.target.value,
                      fragmentEnabled: instance?.hasFragment ? prev.fragmentEnabled : false,
                    }));
                  }}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {RAID_INSTANCES.map((instance) => (
                    <option key={instance.id} value={instance.id}>
                      [{instance.phase}] {instance.label} (iLvl {instance.ilvl})
                    </option>
                  ))}
                </select>
              </div>

              {/* 服务器 */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  服务器 *
                </label>
                <select
                  className="input"
                  value={newSchedule.server}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, server: e.target.value }))}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {SERVERS.map((server) => (
                    <option key={server} value={server}>
                      {server}
                    </option>
                  ))}
                </select>
              </div>

              {/* 开团角色 */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  开团角色 *
                </label>
                <select
                  className="input"
                  value={newSchedule.characterName || leader?.characters[0]}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, characterName: e.target.value }))}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {leader?.characters.map((char, i) => (
                    <option key={i} value={char}>
                      {char}
                    </option>
                  ))}
                </select>
              </div>

              {/* 星期和时间 */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    星期 *
                  </label>
                  <select
                    className="input"
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                    style={{ appearance: "none", cursor: "pointer" }}
                  >
                    {WEEKDAYS.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    时间 *
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* 包片开关 */}
              {RAID_INSTANCES.find((r) => r.id === newSchedule.instanceId)?.hasFragment && (
                <div
                  style={{
                    padding: "12px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-btn)",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newSchedule.fragmentEnabled}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({ ...prev, fragmentEnabled: e.target.checked }))
                      }
                      style={{ width: "18px", height: "18px", accentColor: "var(--color-frost)" }}
                    />
                    开启包片预约
                  </label>
                </div>
              )}

              {/* 备注 */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  备注（选填）
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="可填写团队要求、注意事项等"
                  value={newSchedule.note}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, note: e.target.value }))}
                  maxLength={100}
                />
              </div>

              <button onClick={handleAddSchedule} className="btn btn-primary" style={{ marginTop: "8px" }}>
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid var(--bg-tertiary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>分享给玩家</h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <QRCodeCard url={shareUrl} title="微信扫码报名" onCopy={showToast} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
