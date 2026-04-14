import { CLASS_COLORS } from '../../constants/wowClasses';
import Stepper from './Stepper';

/**
 * SpecRow - 单个天赋行
 * 职业色圆点 + 名称 + 优先级 + stepper
 */
export default function SpecRow({ spec, count, priority, maxCount, onCountChange, onPriorityChange }) {
  const classColor = CLASS_COLORS[spec.cls] || '#ffffff';

  const priorityConfig = {
    required: { label: '必须', bg: '#c41e3a', color: '#fff' },
    preferred: { label: '优先', bg: '#ffd100', color: '#000' },
    open: { label: '可选', bg: '#4a5568', color: '#fff' },
  };

  const handleCountChange = (newCount) => {
    onCountChange(newCount);
    // 当 count 从 0 → 1 时自动设置优先级为 preferred
    if (count === 0 && newCount === 1 && !priority) {
      onPriorityChange('preferred');
    }
    // 当 count 从 1 → 0 时自动移除优先级标签
    if (count === 1 && newCount === 0) {
      onPriorityChange(null);
    }
  };

  const cyclePriority = () => {
    if (!priority) {
      onPriorityChange('required');
    } else if (priority === 'required') {
      onPriorityChange('preferred');
    } else if (priority === 'preferred') {
      onPriorityChange('open');
    } else {
      onPriorityChange(null);
    }
  };

  const currentPriority = priorityConfig[priority];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '4px',
        background: 'var(--bg-tertiary)',
      }}
    >
      {/* 职业色圆点 */}
      <span
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          background: classColor,
          flexShrink: 0,
        }}
      />

      {/* 天赋名 - 用职业色渲染 */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          color: classColor,
          fontWeight: 500,
        }}
      >
        {spec.name}
      </span>

      {/* 优先级标签 */}
      <button
        onClick={cyclePriority}
        style={{
          padding: '2px 6px',
          borderRadius: '3px',
          border: 'none',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          background: currentPriority?.bg || 'transparent',
          color: currentPriority?.color || 'var(--text-muted)',
          opacity: priority ? 1 : 0.4,
          transition: 'all 0.15s',
          minWidth: '36px',
        }}
      >
        {currentPriority?.label || '未设'}
      </button>

      {/* mini Stepper */}
      <Stepper
        value={count}
        onChange={handleCountChange}
        min={0}
        max={maxCount}
        size="small"
      />
    </div>
  );
}
