import { QRCodeSVG } from "qrcode.react";
import { copyToClipboard } from "../utils/helpers";

/**
 * 二维码卡片组件
 */
export default function QRCodeCard({ url, title = "扫码报名", onCopy }) {
  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success && onCopy) {
      onCopy("链接已复制");
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-tertiary)",
        borderRadius: "var(--radius-card)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "12px",
          borderRadius: "var(--radius-btn)",
        }}
      >
        <QRCodeSVG value={url} size={160} level="M" />
      </div>
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{title}</span>
      <button onClick={handleCopy} className="btn btn-secondary" style={{ width: "100%" }}>
        复制链接
      </button>
    </div>
  );
}
