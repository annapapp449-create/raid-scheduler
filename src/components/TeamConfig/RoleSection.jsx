import SpecRow from './SpecRow';
import Stepper from './Stepper';

/**
 * RoleSection - 单个角色区块（可展开）
 * 包含第一层 stepper 和第二层天赋指定
 */
export default function RoleSection({
  role,
  count,
  specRequirements = [],
  expanded,
  onToggleExpand,
  onCountChange,
  onSpecChange,
}) {
  // 计算该角色下已指定天赋数之和
  const assignedCount = specRequirements.reduce((sum, req) => sum + req.count, 0);
  const openSlots = Math.max(0, count - assignedCount);

  // 获取某天赋的当前需求
  const getSpecCount = (specId) => {
    const req = specRequirements.find(r => r.specId === specId);
    return req?.count || 0;
  };

  // 获取某天赋的当前优先级
  const getSpecPriority = (specId) => {
    const req = specRequirements.find(r => r.specId === specId);
    return req?.priority || null;
  };

  // 更新某天赋的数量
  const handleSpecCountChange = (specId, newCount) => {
    const existing = specRequirements.find(r => r.specId === specId);
    let newRequirements;

    if (newCount === 0) {
      // 移除该天赋
      newRequirements = specRequirements.filter(r => r.specId !== specId);
    } else if (existing) {
      // 更新现有天赋数量
      newRequirements = specRequirements.map(r =>
        r.specId === specId ? { ...r, count: newCount } : r
      );
    } else {
      // 新增天赋
      newRequirements = [
        ...specRequirements,
        { specId, count: newCount, priority: 'preferred' }
      ];
    }

    onSpecChange(newRequirements);
  };

  // 更新某天赋的优先级
  const handleSpecPriorityChange = (specId, newPriority) => {
    const existing = specRequirements.find(r => r.specId === specId);
    if (!existing) return;

    let newRequirements;

    if (!newPriority) {
      // 如果 count 为 0，移除整个条目；否则只清除优先级
      if (existing.count === 0) {
        newRequirements = specRequirements.filter(r => r.specId !== specId);
      } else {
        newRequirements = specRequirements.map(r =>
          r.specId === specId ? { ...r, priority: null } : r
        );
      }
    } else {
      newRequirements = specRequirements.map(r =>
        r.specId === specId ? { ...r, priority: newPriority } : r
      );
    }

    onSpecChange(newRequirements);
  };

  const roleColors = {
    tank: 'var(--color-frost)',
    healer: 'var(--color-plague)',
    dps: 'var(--color-ember)',
  };

  const roleIcons = {
    tank: '🛡',
    healer: '✚',
    dps: '⚔',
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* 角色行头部 - 点击展开/收起 */}
      <div
        onClick={onToggleExpand}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* 角色图标 */}
        <span style={{ fontSize: '18px' }}>{roleIcons[role.key]}</span>

        {/* 角色名称 */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: roleColors[role.key],
            minWidth: '36px',
          }}
        >
          {role.label}
        </span>

        {/* 主 Stepper */}
        <div onClick={(e) => e.stopPropagation()}>
          <Stepper
            value={count}
            onChange={onCountChange}
            min={role.min}
            max={role.max}
          />
        </div>

        {/* 已指定/开放信息 */}
        {expanded && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginLeft: '4px',
            }}
          >
            (指定 {assignedCount} 开放 {openSlots})
          </span>
        )}

        {/* 展开箭头 */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </div>

      {/* 展开的天赋面板 */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'var(--bg-primary)',
          }}
        >
          {role.specs.map((spec) => (
            <SpecRow
              key={spec.id}
              spec={spec}
              count={getSpecCount(spec.id)}
              priority={getSpecPriority(spec.id)}
              maxCount={openSlots + getSpecCount(spec.id)}
              onCountChange={(newCount) => handleSpecCountChange(spec.id, newCount)}
              onPriorityChange={(p) => handleSpecPriorityChange(spec.id, p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
