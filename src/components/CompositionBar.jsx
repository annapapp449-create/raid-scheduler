import { ROLE_DATA } from "../utils/classRoleMap";
import { COMPOSITION_TARGETS } from "../utils/constants";
import { getSignupComposition } from "../utils/helpers";

/**
 * 团队配置进度条
 * 三段式显示坦克/治疗/输出的人数和目标（25人团）
 */
export default function CompositionBar({ signups = [] }) {
  const composition = getSignupComposition(signups);

  const segments = [
    { key: "tank", current: composition.tank, target: COMPOSITION_TARGETS.tank.ideal, emoji: "🛡️" },
    { key: "healer", current: composition.healer, target: COMPOSITION_TARGETS.healer.ideal, emoji: "💚" },
    { key: "dps", current: composition.dps, target: COMPOSITION_TARGETS.dps.ideal, emoji: "⚔️" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {segments.map(({ key, current, target, emoji }) => {
        const percentage = Math.min((current / target) * 100, 100);
        const roleData = ROLE_DATA[key];

        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", width: "20px", textAlign: "center" }}>
              {emoji}
            </span>
            <div
              style={{
                flex: 1,
                height: "8px",
                background: "var(--bg-tertiary)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: roleData.color,
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                  opacity: current >= target ? 1 : 0.7,
                }}
              />
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                minWidth: "32px",
                textAlign: "right",
              }}
            >
              {current}/{target}
            </span>
          </div>
        );
      })}
    </div>
  );
}
