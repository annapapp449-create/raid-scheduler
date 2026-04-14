import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import RaidCalendar from "../components/RaidCalendar";
import DayRaidsPanel from "../components/DayRaidsPanel";
import QRCodeCard from "../components/QRCodeCard";
import ClassIcon from "../components/ClassIcon";
import { TeamConfigPanel } from "../components/TeamConfig";
import { getLeaderByShareId, verifyPassword } from "../services/leancloud/leaderService";
import { getSchedulesByLeader, createSchedule, deleteSchedule as deleteScheduleService } from "../services/leancloud/scheduleService";
import { getSignupsBySchedule } from "../services/leancloud/signupService";
import { mockLeader, mockSchedules, mockSignups } from "../utils/mockData";
import { RAID_INSTANCES, SERVERS, WEEKDAYS } from "../utils/constants";
import { CLASS_DATA, getSpecsByClassId, getSpecById } from "../utils/classRoleMap";
import { generateShareUrl, getWeekKey, isSameDay, getScheduleDate } from "../utils/helpers";
import { useToast } from "../components/Toast";
import { isConfigured } from "../services/leancloud";

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
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [recentTeamConfigs, setRecentTeamConfigs] = useState([]);
  const [lastSelectedInstance, setLastSelectedInstance] = useState(null);
  const [instancePresets, setInstancePresets] = useState([]);

  // UI 状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstanceDropdown, setShowInstanceDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 日历状态
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // 数据加载
  useEffect(() => {
    async function loadData() {
      if (isConfigured()) {
        try {
          // 从 LeanCloud 加载
          const leaderData = await getLeaderByShareId(shareId);
          if (leaderData) {
            setLeader(leaderData);
            const schedulesData = await getSchedulesByLeader(leaderData.objectId);
            setSchedules(schedulesData);

            // 加载各团次的报名
            const signups = {};
            for (const schedule of schedulesData) {
              signups[schedule.objectId] = await getSignupsBySchedule(schedule.objectId);
            }
            setSignupsMap(signups);
          }
        } catch (error) {
          console.error("加载数据失败:", error);
          // Fallback to mock data
          setLeader(mockLeader);
          setSchedules(mockSchedules);
          setSignupsMap(mockSignups);
        }
      } else {
        // 使用 mock 数据（无 LeanCloud 配置时）
        setLeader(mockLeader);
        setSchedules(mockSchedules);
        setSignupsMap(mockSignups);
      }
    }
    loadData();
  }, [shareId]);

  // 验证密码
  useEffect(() => {
    const pwd = searchParams.get("pwd");

    if (isConfigured()) {
      // LeanCloud 模式
      if (pwd) {
        // 验证 URL 中的密码
        getLeaderByShareId(shareId).then((leaderData) => {
          if (leaderData) {
            verifyPassword(leaderData, pwd).then((valid) => {
              if (valid) {
                setIsAuthenticated(true);
                setShowPasswordModal(false);
                sessionStorage.setItem(`auth_${shareId}`, "true");
              }
            });
          }
        });
      } else if (sessionStorage.getItem(`auth_${shareId}`) === "true") {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
      }
    } else {
      // Mock 模式
      if (pwd && pwd === mockLeader.editPassword) {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        sessionStorage.setItem(`auth_${shareId}`, "true");
      } else if (sessionStorage.getItem(`auth_${shareId}`) === "true") {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
      }
    }
  }, [shareId, searchParams]);

  // 点击外部关闭副本下拉
  useEffect(() => {
    if (!showAddModal) {
      setShowInstanceDropdown(false);
    }
  }, [showAddModal]);

  const handlePasswordSubmit = async () => {
    if (isConfigured()) {
      const leaderData = await getLeaderByShareId(shareId);
      if (leaderData) {
        const valid = await verifyPassword(leaderData, passwordInput);
        if (valid) {
          setIsAuthenticated(true);
          setShowPasswordModal(false);
          setAuthError("");
          sessionStorage.setItem(`auth_${shareId}`, "true");
        } else {
          setAuthError("密码错误");
          setPasswordInput("");
        }
      }
    } else {
      if (passwordInput === mockLeader.editPassword) {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        setAuthError("");
        sessionStorage.setItem(`auth_${shareId}`, "true");
      } else {
        setAuthError("密码错误");
        setPasswordInput("");
      }
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
    instanceIds: [],
    characterName: "",
    characterClass: "",
    characterSpec: "",
    server: SERVERS[0],
    dayOfWeek: 0,
    startTime: "20:00",
    fragmentEnabled: false,
    note: "",
    teamConfig: { tank: 3, healer: 4, dps: 18, specRequirements: [] },
  });

  const handleOpenAddModal = () => {
    const firstChar = leader?.characters?.[0];
    setNewSchedule((prev) => ({
      ...prev,
      instanceIds: lastSelectedInstance || prev.instanceIds,
      dayOfWeek: selectedDate.getDay() - 1, // 0-indexed from Monday (Monday=0, Tuesday=1, ...)
      weekKey: getWeekKey(selectedDate),
      characterName: firstChar?.name || "",
      characterClass: firstChar?.classId || "",
      characterSpec: firstChar?.specId || "",
      teamConfig: { tank: 3, healer: 4, dps: 18, specRequirements: [] },
    }));
    setShowAddModal(true);
  };

  const handleAddSchedule = async () => {
    if (newSchedule.instanceIds.length === 0) {
      showToast("请至少选择一个副本", "error");
      return;
    }
    if (!newSchedule.characterName.trim()) {
      showToast("请输入开团角色名", "error");
      return;
    }
    const instances = RAID_INSTANCES.filter((r) => newSchedule.instanceIds.includes(r.id));
    const totalSize = instances.reduce((sum, inst) => sum + (inst.size || 25), 0);
    const firstInstance = instances[0];

    const scheduleData = {
      leaderId: leader.objectId,
      instanceId: newSchedule.instanceIds[0],
      instanceName: firstInstance?.name || "",
      raidSize: totalSize,
      characterName: newSchedule.characterName,
      characterClass: newSchedule.characterClass,
      characterSpec: newSchedule.characterSpec,
      server: newSchedule.server,
      dayOfWeek: parseInt(newSchedule.dayOfWeek),
      startTime: newSchedule.startTime,
      weekKey: newSchedule.weekKey || getWeekKey(selectedDate),
      teamConfig: newSchedule.teamConfig,
      fragmentEnabled: newSchedule.fragmentEnabled && instances.some((inst) => inst.hasFragment),
    };

    try {
      const schedule = await createSchedule(scheduleData);

      setSchedules((prev) => [...prev, schedule]);
      setSignupsMap((prev) => ({ ...prev, [schedule.objectId]: [] }));

      // 记录到最近使用的配置
      const tc = newSchedule.teamConfig;
      if (tc) {
        setRecentTeamConfigs((prev) => {
          const filtered = prev.filter(
            (r) => !(r.tank === tc.tank && r.healer === tc.healer && r.dps === tc.dps && JSON.stringify(r.specRequirements) === JSON.stringify(tc.specRequirements))
          );
          return [{ ...tc, usedAt: Date.now() }, ...filtered].slice(0, 3);
        });
      }

      // 记住副本选择
      if (newSchedule.instanceIds.length > 0) {
        setLastSelectedInstance(newSchedule.instanceIds);
      }

      setShowAddModal(false);
      showToast("团次添加成功", "success");
    } catch (error) {
      console.error("添加团次失败:", error);
      showToast("添加失败，请重试", "error");
    }
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

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      if (isConfigured()) {
        await deleteScheduleService(scheduleId);
      }
      setSchedules((prev) => prev.filter((s) => s.objectId !== scheduleId));
      setSignupsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[scheduleId];
        return newMap;
      });
      showToast("已取消开团", "info");
    } catch (error) {
      console.error("删除团次失败:", error);
      showToast("删除失败，请重试", "error");
    }
  };

  // 模板管理
  const handleSaveTemplate = (template) => {
    setSavedTemplates((prev) => {
      if (prev.length >= 5) {
        showToast("最多保存5个模板", "error");
        return prev;
      }
      const exists = prev.find((t) => t.name === template.name);
      if (exists) {
        // 更新已存在的模板
        return prev.map((t) => (t.name === template.name ? template : t));
      }
      return [...prev, template];
    });
    showToast("模板已保存", "success");
  };

  const handleDeleteTemplate = (templateName) => {
    setSavedTemplates((prev) => prev.filter((t) => t.name !== templateName));
    showToast("模板已删除", "info");
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
                color: CLASS_DATA[char.classId]?.color || "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ClassIcon classId={char.classId} size={16} />
              {char.name}
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
        onDeleteSchedule={handleDeleteSchedule}
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
              {/* 副本选择（多选下拉） */}
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  副本（可多选）*
                </label>
                {/* 副本预设快捷选择 */}
                {instancePresets.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "8px",
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {instancePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setNewSchedule((prev) => ({
                            ...prev,
                            instanceIds: [...preset],
                          }));
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          fontSize: "11px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {preset.map((id) => RAID_INSTANCES.find((i) => i.id === id)?.shortLabel || id).join("+")}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setInstancePresets((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "10px",
                            flexShrink: 0,
                          }}
                        >
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {/* 显示已选副本 */}
                <div
                  onClick={() => setShowInstanceDropdown(!showInstanceDropdown)}
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--color-bone)",
                    borderRadius: "var(--radius-btn)",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: newSchedule.instanceIds.length > 0 ? "var(--text-primary)" : "var(--text-muted)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {newSchedule.instanceIds.length === 0
                      ? "选择副本"
                      : newSchedule.instanceIds.length === 1
                      ? RAID_INSTANCES.find((i) => i.id === newSchedule.instanceIds[0])?.label
                      : `${newSchedule.instanceIds.length}个副本`}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {newSchedule.instanceIds.length > 0 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (instancePresets.length < 5) {
                            setInstancePresets((prev) => [...prev, newSchedule.instanceIds]);
                            showToast("已保存快捷配置", "success");
                          } else {
                            showToast("最多保存5个快捷配置", "error");
                          }
                        }}
                        style={{
                          fontSize: "11px",
                          color: "var(--color-gold)",
                          cursor: "pointer",
                        }}
                      >
                        保存
                      </span>
                    )}
                    <span style={{ transform: showInstanceDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                  </div>
                </div>
                {/* 下拉选项 */}
                {showInstanceDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: "300px",
                      overflowY: "auto",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--color-bone)",
                      borderRadius: "var(--radius-btn)",
                      marginTop: "4px",
                      zIndex: 100,
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {RAID_INSTANCES.map((instance) => {
                      const isChecked = newSchedule.instanceIds.includes(instance.id);
                      return (
                        <label
                          key={instance.id}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 12px",
                            background: isChecked ? "rgba(79, 195, 247, 0.1)" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewSchedule((prev) => ({
                                  ...prev,
                                  instanceIds: [...prev.instanceIds, instance.id],
                                }));
                              } else {
                                setNewSchedule((prev) => ({
                                  ...prev,
                                  instanceIds: prev.instanceIds.filter((id) => id !== instance.id),
                                }));
                              }
                            }}
                            style={{ width: "18px", height: "18px", accentColor: "var(--color-frost)" }}
                          />
                          <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                            [{instance.phase}] {instance.label}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>
                            iLvl {instance.ilvl}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
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
                {/* 角色名输入 + 历史下拉 */}
                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="输入角色名或选择历史"
                    value={newSchedule.characterName}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, characterName: e.target.value }))}
                    maxLength={20}
                    style={{ paddingRight: "40px" }}
                  />
                  <select
                    value=""
                    onChange={(e) => {
                      const char = leader?.characters?.find((c) => c.name === e.target.value);
                      if (char) {
                        setNewSchedule((prev) => ({
                          ...prev,
                          characterName: char.name,
                          characterClass: char.classId || "",
                          characterSpec: char.specId || "",
                        }));
                      }
                    }}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "var(--bg-tertiary)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      appearance: "none",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <option value="">历史</option>
                    {leader?.characters?.map((char, i) => (
                      <option key={i} value={char.name}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* 职业选择 */}
                <select
                  className="input"
                  value={newSchedule.characterClass}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, characterClass: e.target.value, characterSpec: "" }))}
                  style={{ appearance: "none", cursor: "pointer", marginBottom: "8px" }}
                >
                  <option value="">选择职业</option>
                  {Object.entries(CLASS_DATA).map(([id, data]) => (
                    <option key={id} value={id}>
                      {data.label}
                    </option>
                  ))}
                </select>
                {/* 天赋选择 */}
                {newSchedule.characterClass && (
                  <select
                    className="input"
                    value={newSchedule.characterSpec}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, characterSpec: e.target.value }))}
                    style={{ appearance: "none", cursor: "pointer", marginBottom: "8px" }}
                  >
                    <option value="">选择天赋</option>
                    {getSpecsByClassId(newSchedule.characterClass).map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                )}
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

              {/* 团队配置 */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  团队配置
                </label>
                <TeamConfigPanel
                  value={newSchedule.teamConfig}
                  onChange={(teamConfig) => setNewSchedule((prev) => ({ ...prev, teamConfig }))}
                  savedTemplates={savedTemplates}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  recentConfigs={recentTeamConfigs}
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
