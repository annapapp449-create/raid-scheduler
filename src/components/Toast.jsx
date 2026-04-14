import { useEffect, useState } from "react";

/**
 * Toast 轻提示组件
 * 自动消失的临时提示
 */
export default function Toast({ message, type = "info", duration = 2000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // 等待动画完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: "rgba(102, 187, 106, 0.95)", border: "var(--color-plague)" },
    error: { bg: "rgba(239, 83, 80, 0.95)", border: "var(--color-blood)" },
    info: { bg: "rgba(79, 195, 247, 0.95)", border: "var(--color-frost)" },
    warning: { bg: "rgba(255, 167, 38, 0.95)", border: "var(--color-ember)" },
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: visible ? "translate(-50%, -50%)" : "translate(-50%, -50%) scale(0.9)",
        background: style.bg,
        color: type === "info" ? "var(--bg-primary)" : "#fff",
        padding: "12px 24px",
        borderRadius: "var(--radius-btn)",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "var(--shadow-modal)",
        border: `1px solid ${style.border}`,
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s ease",
        maxWidth: "280px",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

/**
 * Toast 容器 - 用于管理多个 Toast
 */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

/**
 * useToast Hook
 * 返回 showToast 函数和 ToastContainer
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 2000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { showToast, ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} /> };
}
