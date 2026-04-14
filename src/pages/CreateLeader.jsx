import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVERS } from "../utils/constants";
import { generateShareId } from "../utils/helpers";

/**
 * 团长创建页
 * 团长首次使用时填写身份信息
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

    // 模拟创建（Phase 2 会接入 LeanCloud）
    const shareId = generateShareId();
    const validCharacters = form.characters.filter((c) => c.trim());

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 跳转管理面板
    navigate(`/leader/${shareId}?pwd=${form.editPassword}`);
  };

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      {/* 标题 */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-frost)",
            margin: "0 0 8px",
          }}
        >
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
              <option key={server} value={server}>
                {server}
              </option>
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: "8px" }}>
          {isSubmitting ? "创建中..." : "创建身份"}
        </button>
      </form>

      {/* 返回链接 */}
      <p
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        已经是团长？{" "}
        <a href="#/create" style={{ color: "var(--color-frost)" }}>
          返回创建
        </a>
      </p>
    </div>
  );
}
