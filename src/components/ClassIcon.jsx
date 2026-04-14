import { CLASS_DATA, getTextColorForBackground, getClassAbbrev } from "../utils/classRoleMap";

/**
 * 职业图标组件
 * 圆形徽章，背景为职业色，文字为职业首字
 */
export default function ClassIcon({ classId, size = 28 }) {
  const classInfo = CLASS_DATA[classId];

  if (!classInfo) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#444a5a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: size * 0.4,
          fontWeight: 600,
        }}
      >
        ?
      </div>
    );
  }

  const textColor = getTextColorForBackground(classInfo.color);
  const fontSize = Math.max(size * 0.4, 10);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: classInfo.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textColor,
        fontSize,
        fontWeight: 600,
        flexShrink: 0,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.3)`,
      }}
      title={classInfo.label}
    />
  );
}
