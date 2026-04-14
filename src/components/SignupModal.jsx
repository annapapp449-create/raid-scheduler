import { useState, useEffect } from "react";
import ClassIcon from "./ClassIcon";
import { CLASS_DATA, getSpecsByClassId, getSpecById } from "../utils/classRoleMap";
import { SERVERS } from "../utils/constants";

const ROLE_LABELS = {
  tank: "坦克",
  healer: "治疗",
  dps: "输出",
};

const STORAGE_KEY = "raid_signup_history";

/**
 * 报名弹窗组件
 * 流程：选择职业 → 选择天赋专精（角色定位自动识别）
 */
export default function SignupModal({
  schedule,
  raidServer,
  onSubmit,
  onClose,
  onCancelSignup,
  existingSignup,
  fragmentEnabled,
  fragmentStatus,
}) {
  const [form, setForm] = useState({
    playerName: existingSignup?.playerName || "",
    playerServer: existingSignup?.playerServer || raidServer || SERVERS[0],
    playerClass: existingSignup?.playerClass || "",
    playerSpec: existingSignup?.playerSpec || "",
    contactInfo: existingSignup?.contactInfo || "",
    wantFragment: false,
  });

  const [errors, setErrors] = useState({});
  const [nameHistory, setNameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNameHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // 保存到历史记录
  const saveToHistory = (playerName, playerClass, playerSpec, playerServer) => {
    const newEntry = {
      playerName,
      playerClass,
      playerSpec,
      playerServer,
      timestamp: Date.now(),
    };

    setNameHistory((prev) => {
      // 移除同名的旧记录
      const filtered = prev.filter((h) => h.playerName !== playerName);
      // 添加到最前面
      const updated = [newEntry, ...filtered].slice(0, 5);
      // 保存到 localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
      return updated;
    });
  };

  const availableSpecs = form.playerClass ? getSpecsByClassId(form.playerClass) : [];

  // 根据已选天赋获取角色定位
  const selectedRole = form.playerSpec
    ? getSpecById(form.playerSpec)?.role
    : null;

  const validate = () => {
    const newErrors = {};
    if (!form.playerName.trim()) newErrors.playerName = "请输入角色名";
    if (!form.playerClass) newErrors.playerClass = "请选择职业";
    if (!form.playerSpec) newErrors.playerSpec = "请选择天赋专精";
    if (raidServer && form.playerServer !== raidServer) {
      newErrors.playerServer = `仅限 ${raidServer} 玩家报名`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // 保存到历史记录
    saveToHistory(form.playerName, form.playerClass, form.playerSpec, form.playerServer);
    onSubmit({ ...form, playerRole: selectedRole });
  };

  const handleClassChange = (classId) => {
    setForm((prev) => ({ ...prev, playerClass: classId, playerSpec: "" }));
  };

  const handleSpecChange = (specId) => {
    setForm((prev) => ({ ...prev, playerSpec: specId }));
  };

  // 从历史记录填充
  const fillFromHistory = (entry) => {
    setForm((prev) => ({
      ...prev,
      playerName: entry.playerName,
      playerClass: entry.playerClass,
      playerSpec: entry.playerSpec,
      playerServer: entry.playerServer,
    }));
    setShowHistory(false);
  };

  // 根据当前输入过滤历史记录
  const filteredHistory = form.playerName
    ? nameHistory.filter((h) => h.playerName.includes(form.playerName))
    : nameHistory;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>
            {existingSignup ? "修改报名" : "我要报名"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 角色名 */}
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              角色名 *
            </label>
            <input
              type="text"
              className="input"
              placeholder="请输入游戏角色名"
              value={form.playerName}
              onChange={(e) => setForm((prev) => ({ ...prev, playerName: e.target.value }))}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              maxLength={20}
            />
            {errors.playerName && <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.playerName}</span>}

            {/* 历史记录下拉 */}
            {showHistory && filteredHistory.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--color-bone)",
                  borderRadius: "var(--radius-btn)",
                  marginTop: "4px",
                  zIndex: 100,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {filteredHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    onClick={() => fillFromHistory(entry)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      borderBottom: idx < filteredHistory.length - 1 ? "1px solid var(--bg-tertiary)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <ClassIcon classId={entry.playerClass} size={16} />
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", flex: 1 }}>
                      {entry.playerName}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {CLASS_DATA[entry.playerClass]?.label || entry.playerClass}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 服务器 */}
          {!raidServer && (
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                服务器 *
              </label>
              <select
                className="input"
                value={form.playerServer}
                onChange={(e) => setForm((prev) => ({ ...prev, playerServer: e.target.value }))}
                style={{ appearance: "none", cursor: "pointer" }}
              >
                {SERVERS.map((server) => (
                  <option key={server} value={server}>
                    {server}
                  </option>
                ))}
              </select>
            </div>
          )}
          {raidServer && (
            <div style={{ padding: "10px 14px", background: "rgba(79, 195, 247, 0.08)", borderRadius: "var(--radius-btn)", fontSize: "13px", color: "var(--color-frost)" }}>
              服务器：{raidServer}
            </div>
          )}

          {/* 职业 */}
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              职业 *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.entries(CLASS_DATA).map(([id, data]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleClassChange(id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-badge)",
                    border: "1px solid",
                    borderColor: form.playerClass === id ? data.color : "var(--color-bone)",
                    background: form.playerClass === id ? `${data.color}20` : "var(--bg-tertiary)",
                    color: form.playerClass === id ? data.color : "var(--text-primary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ClassIcon classId={id} size={20} />
                  <span style={{ fontSize: "13px" }}>{data.label}</span>
                </button>
              ))}
            </div>
            {errors.playerClass && <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.playerClass}</span>}
          </div>

          {/* 天赋专精 */}
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              天赋专精 *
            </label>
            {availableSpecs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {availableSpecs.map((spec) => {
                  const roleLabel = ROLE_LABELS[spec.role] || spec.role;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSpecChange(spec.id)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "var(--radius-btn)",
                        border: "1px solid",
                        borderColor: form.playerSpec === spec.id ? "var(--color-frost)" : "var(--color-bone)",
                        background: form.playerSpec === spec.id ? "rgba(79, 195, 247, 0.1)" : "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "14px",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>{spec.label}</span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          background: "var(--bg-secondary)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {roleLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>请先选择职业</span>
            )}
            {errors.playerSpec && <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.playerSpec}</span>}
          </div>

          {/* 角色定位（自动识别提示） */}
          {selectedRole && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(79, 195, 247, 0.08)",
                borderRadius: "var(--radius-btn)",
                border: "1px solid rgba(79, 195, 247, 0.2)",
                fontSize: "13px",
                color: "var(--color-frost)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>角色定位：</span>
              <span style={{ fontWeight: 600 }}>{ROLE_LABELS[selectedRole]}</span>
              <span style={{ color: "var(--text-muted)" }}>（根据天赋自动识别）</span>
            </div>
          )}

          {/* 联系方式 */}
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              联系方式（选填）
            </label>
            <input
              type="tel"
              className="input"
              placeholder="手机号/微信/QQ（紧急联系用）"
              value={form.contactInfo}
              onChange={(e) => setForm((prev) => ({ ...prev, contactInfo: e.target.value }))}
              maxLength={30}
            />
          </div>

          {/* 包片预约 */}
          {fragmentEnabled && fragmentStatus === "open" && (
            <div
              style={{
                padding: "12px",
                background: "rgba(255, 167, 38, 0.1)",
                borderRadius: "var(--radius-btn)",
                border: "1px solid rgba(255, 167, 38, 0.2)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "var(--color-ember)",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.wantFragment}
                  onChange={(e) => setForm((prev) => ({ ...prev, wantFragment: e.target.checked }))}
                  style={{ width: "18px", height: "18px", accentColor: "var(--color-ember)" }}
                />
                我要预约包片（橙杖碎片）
              </label>
            </div>
          )}

          {/* 提交按钮 */}
          <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }}>
            {existingSignup ? "保存修改" : "确认报名"}
          </button>

          {/* 取消报名按钮 */}
          {existingSignup && (
            <button
              type="button"
              onClick={onCancelSignup}
              className="btn btn-secondary"
              style={{ color: "var(--color-blood)", borderColor: "var(--color-blood)" }}
            >
              取消报名
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
