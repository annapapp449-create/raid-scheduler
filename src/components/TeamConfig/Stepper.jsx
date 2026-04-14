/**
 * Stepper 组件 - 通用 +/- 计数器
 */
export default function Stepper({ value, onChange, min = 0, max = 99, size = 'normal' }) {
  const isSmall = size === 'small';

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const buttonStyle = isSmall
    ? { width: '24px', height: '24px', fontSize: '14px' }
    : { width: '30px', height: '30px', fontSize: '16px' };

  const disabledStyle = { opacity: 0.3, cursor: 'not-allowed' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
      }}
    >
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        style={{
          ...buttonStyle,
          background: 'var(--bg-tertiary)',
          border: 'none',
          borderRadius: '6px 0 0 6px',
          color: 'var(--text-primary)',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          opacity: value <= min ? 0.3 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          if (value > min) e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
        }}
      >
        −
      </button>
      <span
        style={{
          minWidth: isSmall ? '28px' : '36px',
          textAlign: 'center',
          fontSize: isSmall ? '13px' : '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          background: 'var(--bg-secondary)',
          padding: isSmall ? '2px 4px' : '4px 8px',
        }}
      >
        {value}
      </span>
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        style={{
          ...buttonStyle,
          background: 'var(--bg-tertiary)',
          border: 'none',
          borderRadius: '0 6px 6px 0',
          color: 'var(--text-primary)',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          opacity: value >= max ? 0.3 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          if (value < max) e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
        }}
      >
        +
      </button>
    </div>
  );
}
