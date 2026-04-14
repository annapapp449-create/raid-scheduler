import { useState } from "react";
import CompositionBar from "./CompositionBar";
import FragmentBadge from "./FragmentBadge";
import SignupList from "./SignupList";
import SignupModal from "./SignupModal";
import { getRaidInstance, STATUS_CONFIG } from "../utils/constants";
import { WEEKDAYS } from "../utils/constants";

/**
 * 团次卡片组件
 * 显示单个团次的信息和报名状态
 */
export default function RaidCard({
  schedule,
  signups = [],
  onSignup,
  onCancelSignup,
  currentSignupId,
  isLeader = false,
  onRemoveSignup,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const instance = getRaidInstance(schedule.instanceId);
  const statusConfig = STATUS_CONFIG[schedule.status];
  const currentSignup = signups.find((s) => s.objectId === currentSignupId);

  const borderColors = {
    recruiting: "var(--color-plague)",
    full: "var(--color-ember)",
    closed: "var(--color-bone)",
  };

  const borderColor = borderColors[schedule.status] || borderColors.recruiting;

  const handleSignupClick = () => {
    if (schedule.status === "closed") return;
    if (schedule.status === "full" && !currentSignup) return;
    setShowModal(true);
  };

  const ModalComponent = onSignup ? SignupModal : null;

  return (
    <>
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderLeft: `4px solid ${borderColor}`,
          overflow: "hidden",
          opacity: schedule.status === "closed" ? 0.6 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {/* 卡片主体 */}
        <div style={{ padding: "16px" }}>
          {/* 头部：副本名 + 状态 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "12px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    background: "rgba(79, 195, 247, 0.15)",
                    color: "var(--color-frost)",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {instance?.phase}
                </span>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {instance?.label || schedule.instanceId}
                </h4>
                {instance?.ilvl && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      background: "rgba(255, 167, 38, 0.1)",
                      color: "var(--color-ember)",
                      borderRadius: "4px",
                    }}
                  >
                    iLvl {instance.ilvl}
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                {schedule.characterName} · 周{WEEKDAYS[schedule.dayOfWeek]?.charAt(1)} {schedule.startTime}
              </p>
            </div>
            <span
              style={{
                flexShrink: 0,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: statusConfig?.color === "success" ? "var(--color-plague)"
                  : statusConfig?.color === "warning" ? "var(--color-ember)"
                  : "var(--color-bone)",
                display: "inline-block",
              }}
            />
          </div>

          {/* 包片状态 */}
          {(schedule.fragmentEnabled || schedule.fragmentStatus) && (
            <div style={{ marginBottom: "12px" }}>
              <FragmentBadge
                status={schedule.fragmentStatus}
                playerName={schedule.fragmentPlayer}
                playerServer={schedule.fragmentServer}
              />
            </div>
          )}

          {/* 团长备注 */}
          {schedule.note && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              {schedule.note}
            </p>
          )}

          {/* 配置进度条 */}
          <div style={{ marginBottom: "12px" }}>
            <CompositionBar signups={signups} />
          </div>

          {/* 报名进度和按钮 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              已报名 {schedule.signupCount}/{schedule.raidSize}
              <span
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}
              >
                ▼
              </span>
            </button>

            {currentSignup ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--color-plague)",
                    fontWeight: 500,
                  }}
                >
                  ✓ 已报名
                </span>
                {!isLeader && (
                  <button
                    onClick={handleSignupClick}
                    className="btn btn-secondary"
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                      minHeight: "36px",
                      color: "var(--color-blood)",
                      borderColor: "var(--color-blood)",
                    }}
                  >
                    取消
                  </button>
                )}
              </div>
            ) : schedule.status === "recruiting" ? (
              <button
                onClick={handleSignupClick}
                className="btn btn-primary"
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  minHeight: "36px",
                }}
              >
                我要报名
              </button>
            ) : schedule.status === "full" ? (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                已满员
              </span>
            ) : (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                已关闭
              </span>
            )}
          </div>
        </div>

        {/* 展开的报名列表 */}
        {expanded && (
          <div
            style={{
              borderTop: "1px solid var(--bg-tertiary)",
              padding: "16px",
              background: "var(--bg-tertiary)",
              animation: "slideDown 0.2s ease",
            }}
          >
            <SignupList
              signups={signups}
              currentPlayerId={currentSignupId}
              isLeader={isLeader}
              onRemove={isLeader ? onRemoveSignup : null}
            />
          </div>
        )}
      </div>

      {/* 报名弹窗 */}
      {showModal && ModalComponent && (
        <ModalComponent
          schedule={schedule}
          raidServer={schedule.server}
          onSubmit={(formData) => {
            onSignup(schedule.objectId, formData);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
          onCancelSignup={() => {
            onCancelSignup?.(schedule.objectId);
            setShowModal(false);
          }}
          existingSignup={currentSignup}
          fragmentEnabled={schedule.fragmentEnabled}
          fragmentStatus={schedule.fragmentStatus}
        />
      )}
    </>
  );
}
