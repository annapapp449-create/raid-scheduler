import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SERVERS } from "../utils/constants";
import { createLeader } from "../services/leancloud/leaderService";
import {
  saveMyLeader,
  getMyLeaders,
  removeMyLeader,
  generateManageUrl,
  copyToClipboard,
} from "../utils/helpers";

/**
 * 团长创建页
 * - 顶部显示本机已保存的团长（我的开团）
 * - 注册成功后展示管理链接，引导保存
 */
export default function CreateLeader() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: "",
    server: SERVERS[0],
    characters: [""],
    editPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myLeaders, setMyLeaders] = useState([]);
  const [createdLeader, setCreatedLeader] = useState(null); // 注册成功后的数据
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMyLeaders(getMyLeaders());
  }, []);

  const addCharacter = () => {
    if (form.characters.length >= 10) return;
    setForm((prev) => ({ ...prev, characters: [...prev.characters, ""] }));
  };

  const removeCharacter = (index) => {
    if (form.characters.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }));
  };

  const updateCharacter = (index, value) => {
    setForm((prev) => ({
      ...prev,
      characters: prev.characters.map((c, i) => (i === index ? value : c)),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nickname.trim()) newErrors.nickname = "请输入昵称";
    else if (form.nickname.length < 2 || form.nickname.length > 12)
      newErrors.nickname = "昵称长度 2-12 字符";
    if (!form.server) newErrors.server = "请选择服务器";
    if (form.characters.filter((c) => c.trim()).length === 0)
      newErrors.characters = "请至少填写一个角色名";
    if (!form.editPassword) newErrors.editPassword = "请设置管理密码";
    else if (!/^\d{6}$/.test(form.editPassword))
      newErrors.editPassword = "管理密码必须为6位数字";
    if (form.editPassword !== form.confirmPassword)
      newErrors.confirmPassword = "两次密码输入不一致";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const validCharacters = form.characters
        .filter((c) => c.trim())
        .map((name) => ({ name }));

      const leader = await createLeader({
        nickname: form.nickname.trim(),
        server: form.server,
        characters: validCharacters,
        editPassword: form.editPassword,
      });

      // 保存到本机历史
      saveMyLeader({
        shareId: leader.shareId,
        nickname: leader.nickname,
        server: leader.server,
      });

      setCreatedLeader({ ...leader, editPassword: form.editPassword });
    } catch (error) {
      console.error("创建失败:", error);
      setErrors({ submit: "创建失败，请重试" });
      setIsSubmitting(false);
    }
  };

  const handleDeleteMyLeader = (shareId) => {
    removeMyLeader(shareId);
    setMyLeaders(getMyLeaders());
  };

  const handleCopyManageUrl = async (shareId) => {
    const url = generateManageUrl(shareId);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(shareId);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── 注册成功页 ──────────────────────────────────────────
  if (createdLeader) {
    const manageUrl = generateManageUrl(createdLeader.shareId);
    return (
      <div className="container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        {/* 成功标题 */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-frost)", margin: "0 0 8px" }}>
            团长身份已创建！
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            {createdLeader.nickname} · {createdLeader.server}
          </p>
        </div>

        {/* 管理链接卡片 */}
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-card)",
            padding: "20px",
            marginBottom: "16px",
            border: "1px solid rgba(79,195,247,0.25)",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: "13px", color: "var(--color-frost)", fontWeight: 600 }}>
            📌 你的管理链接
          </p>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--text-secondary)" }}>
            下次打开此链接即可进入管理页（需输入密码）
          </p>
          <div
            style={{
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-btn)",
              padding: "10px 12px",
              fontSize: "12px",
              color: "var(--text-muted)",
              wordBreak: "break-all",
              marginBottom: "10px",
              lineHeight: 1.6,
            }}
          >
            {manageUrl}
          </div>
          <button
            onClick={() => handleCopyManageUrl(createdLeader.shareId)}
            className="btn btn-secondary"
            style={{ width: "100%", marginBottom: "8px" }}
          >
            {copied === createdLeader.shareId ? "✅ 已复制" : "复制管理链接"}
          </button>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
            建议：将链接发送给自己或保存到微信收藏
          </p>
        </div>

        {/* 密码提示 */}
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-card)",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "24px" }}>🔑</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13px", color: "var(--text-secondary)" }}>
              管理密码
            </p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, letterSpacing: "6px", color: "var(--text-primary)" }}>
              {createdLeader.editPassword}
            </p>
          </div>
        </div>

        {/* 进入管理页 */}
        <button
          onClick={() => navigate(`/leader/${createdLeader.shareId}?pwd=${createdLeader.editPassword}`)}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          进入管理页 →
        </button>
      </div>
    );
  }

  // ── 主页面 ──────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>

      {/* 我的开团（历史记录） */}
      {myLeaders.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
            📋 我的开团
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myLeaders.map((l) => (
              <div
                key={l.shareId}
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-card)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* 头像 */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-frost) 0%, var(--color-frost-dim) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--bg-primary)",
                    flexShrink: 0,
                  }}
                >
                  {l.nickname.charAt(0)}
                </div>
                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {l.nickname}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.server}
                  </p>
                </div>
                {/* 操作 */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleCopyManageUrl(l.shareId)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "var(--radius-btn)",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--color-bone)",
                      color: copied === l.shareId ? "var(--color-frost)" : "var(--text-secondary)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {copied === l.shareId ? "✅" : "复制链接"}
                  </button>
                  <button
                    onClick={() => navigate(`/leader/${l.shareId}`)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-btn)",
                      background: "var(--color-frost)",
                      border: "none",
                      color: "var(--bg-primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    进入
                  </button>
                  <button
                    onClick={() => handleDeleteMyLeader(l.shareId)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "var(--radius-btn)",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    title="从本机移除"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "20px", borderTop: "1px solid var(--bg-tertiary)", paddingTop: "20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
              ＋ 创建新的团长身份
            </p>
          </div>
        </div>
      )}

      {/* 页面标题 */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-frost)", margin: "0 0 8px" }}>
          创建团长身份
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          填写您的信息，开始组织开团
        </p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 昵称 */}
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            团长昵称 *
          </label>
          <input
            type="text"
            className="input"
            placeholder="2-12 字符，用于玩家识别"
            value={form.nickname}
            onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
            maxLength={12}
          />
          {errors.nickname && <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.nickname}</span>}
        </div>

        {/* 服务器 */}
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            服务器 *
          </label>
          <select
            className="input"
            value={form.server}
            onChange={(e) => setForm((prev) => ({ ...prev, server: e.target.value }))}
            style={{ appearance: "none", cursor: "pointer" }}
          >
            {SERVERS.map((server) => (
              <option key={server} value={server}>{server}</option>
            ))}
          </select>
          {errors.server && <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.server}</span>}
        </div>

        {/* 开团角色 */}
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            开团角色名 *
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {form.characters.map((char, index) => (
              <div key={index} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="input"
                  placeholder={`角色 ${index + 1}`}
                  value={char}
                  onChange={(e) => updateCharacter(index, e.target.value)}
                  maxLength={20}
                  style={{ flex: 1 }}
                />
                {form.characters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCharacter(index)}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-btn)",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--color-bone)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.characters.length < 10 && (
            <button
              type="button"
              onClick={addCharacter}
              style={{
                marginTop: "8px",
                padding: "10px",
                width: "100%",
                borderRadius: "var(--radius-btn)",
                background: "var(--bg-tertiary)",
                border: "1px dashed var(--color-bone)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              + 添加角色（{form.characters.length}/10）
            </button>
          )}
          {errors.characters && (
            <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.characters}</span>
          )}
        </div>

        {/* 管理密码 */}
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            管理密码 *
          </label>
          <input
            type="password"
            className="input"
            placeholder="6位数字，用于管理面板"
            value={form.editPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, editPassword: e.target.value }))}
            maxLength={6}
            inputMode="numeric"
          />
          {errors.editPassword && (
            <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.editPassword}</span>
          )}
        </div>

        {/* 确认密码 */}
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            确认密码 *
          </label>
          <input
            type="password"
            className="input"
            placeholder="再次输入管理密码"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            maxLength={6}
            inputMode="numeric"
          />
          {errors.confirmPassword && (
            <span style={{ fontSize: "12px", color: "var(--color-blood)" }}>{errors.confirmPassword}</span>
          )}
        </div>

        {/* 提交 */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ marginTop: "8px" }}
        >
          {isSubmitting ? "创建中..." : "创建身份"}
        </button>

        {errors.submit && (
          <p style={{ textAlign: "center", color: "var(--color-blood)", fontSize: "13px", margin: "8px 0 0" }}>
            {errors.submit}
          </p>
        )}
      </form>
    </div>
  );
}
