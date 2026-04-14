import { useState } from 'react';

/**
 * SaveTemplateModal - 保存模板弹窗
 */
export default function SaveTemplateModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const maxLength = 12;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (trimmedName.length > maxLength) return;
    onSave(trimmedName);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          width: '320px',
          maxWidth: '90vw',
          border: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          保存为模板
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入模板名称（最多12字）"
            maxLength={maxLength}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gold)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          />

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px',
              textAlign: 'right',
            }}
          >
            {name.length}/{maxLength}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name.length > maxLength}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: name.trim() && name.length <= maxLength
                  ? 'var(--color-gold)'
                  : 'var(--bg-tertiary)',
                color: name.trim() && name.length <= maxLength
                  ? '#000'
                  : 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: name.trim() && name.length <= maxLength ? 'pointer' : 'not-allowed',
              }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
