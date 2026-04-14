/**
 * 包片状态标记组件
 */
export default function FragmentBadge({ status, playerName, playerServer }) {
  if (!status) return null;

  const config = {
    open: {
      label: "包片可预约",
      bgColor: "rgba(102, 187, 106, 0.15)",
      textColor: "var(--color-plague)",
      borderColor: "rgba(102, 187, 106, 0.3)",
    },
    reserved: {
      label: "包片",
      bgColor: "rgba(255, 167, 38, 0.15)",
      textColor: "var(--color-ember)",
      borderColor: "rgba(255, 167, 38, 0.3)",
    },
  };

  const style = config[status];
  if (!style) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        background: style.bgColor,
        border: `1px solid ${style.borderColor}`,
        borderRadius: "var(--radius-badge)",
        fontSize: "12px",
        color: style.textColor,
      }}
    >
      <span style={{ fontWeight: 500 }}>{style.label}</span>
      {status === "reserved" && playerName && (
        <span style={{ opacity: 0.8 }}>
          — {playerName} ({playerServer})
        </span>
      )}
    </div>
  );
}
