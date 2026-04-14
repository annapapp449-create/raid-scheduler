import ClassIcon from "./ClassIcon";
import { ROLE_DATA, getSpecById } from "../utils/classRoleMap";
import { groupSignupsByRole } from "../utils/helpers";

/**
 * 已报名列表组件
 * 按角色分组显示报名玩家
 */
export default function SignupList({ signups = [], currentPlayerId, onRemove, isLeader = false }) {
  const grouped = groupSignupsByRole(signups);

  const roleOrder = ["tank", "healer", "dps"];

  const totalSignups = signups.length;

  if (totalSignups === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        暂无报名，快来当第一个吧！
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {roleOrder.map((roleKey) => {
        const players = grouped[roleKey];
        if (!players || players.length === 0) return null;

        const roleData = ROLE_DATA[roleKey];

        return (
          <div key={roleKey}>
            {/* 角色标签 */}
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
                  color: roleData.color,
                  fontWeight: 500,
                }}
              >
                {roleData.label}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}
              >
                {players.length}人
              </span>
            </div>

            {/* 玩家列表 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {players.map((signup) => {
                const isCurrentPlayer = signup.objectId === currentPlayerId;
                const canRemove = isLeader || isCurrentPlayer;

                return (
                  <div
                    key={signup.objectId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      background: isCurrentPlayer ? "rgba(79, 195, 247, 0.1)" : "var(--bg-tertiary)",
                      borderRadius: "var(--radius-btn)",
                      border: isCurrentPlayer ? "1px solid rgba(79, 195, 247, 0.3)" : "1px solid transparent",
                    }}
                  >
                    <ClassIcon classId={signup.playerClass} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: isCurrentPlayer ? "var(--color-frost)" : "var(--text-primary)",
                          }}
                        >
                          {signup.playerName}
                        </span>
                        {isCurrentPlayer && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              background: "rgba(79, 195, 247, 0.2)",
                              color: "var(--color-frost)",
                              borderRadius: "var(--radius-badge)",
                            }}
                          >
                            我
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {signup.playerSpec && (
                          <span style={{ color: ROLE_DATA[signup.playerRole]?.color }}>
                            {getSpecById(signup.playerSpec)?.label || signup.playerRole}
                          </span>
                        )}
                      </div>
                    </div>
                    {canRemove && !isCurrentPlayer && isLeader && (
                      <button
                        onClick={() => onRemove?.(signup.objectId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-blood)",
                          fontSize: "20px",
                          cursor: "pointer",
                          padding: "4px",
                          opacity: 0.7,
                        }}
                        title="移除报名"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
