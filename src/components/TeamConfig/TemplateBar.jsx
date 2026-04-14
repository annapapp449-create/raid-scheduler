import { PRESET_TEMPLATE } from '../../constants/wowSpecs';

/**
 * TemplateBar - 模板选择/保存/删除
 */
export default function TemplateBar({
  templates = [],
  recentConfigs = [],
  activeTemplateName,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onSaveClick,
  canSave,
}) {
  const handleDelete = (e, templateName) => {
    e.stopPropagation();
    onDeleteTemplate(templateName);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: '8px',
      }}
    >
      {/* 预设模板 */}
      <button
        onClick={() => onSelectTemplate(PRESET_TEMPLATE)}
        style={{
          padding: '5px 10px',
          borderRadius: '6px',
          border: activeTemplateName === PRESET_TEMPLATE.name
            ? '2px solid var(--color-gold)'
            : '1px solid var(--border-color)',
          background: activeTemplateName === PRESET_TEMPLATE.name
            ? 'rgba(255, 209, 0, 0.15)'
            : 'var(--bg-secondary)',
          color: activeTemplateName === PRESET_TEMPLATE.name
            ? 'var(--color-gold)'
            : 'var(--text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {PRESET_TEMPLATE.name}
      </button>

      {/* 自定义模板 */}
      {templates.map((tpl) => (
        <div
          key={tpl.name}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => onSelectTemplate(tpl)}
            style={{
              padding: '5px 10px',
              paddingRight: '28px',
              borderRadius: '6px',
              border: activeTemplateName === tpl.name
                ? '2px solid var(--color-gold)'
                : '1px solid var(--border-color)',
              background: activeTemplateName === tpl.name
                ? 'rgba(255, 209, 0, 0.15)'
                : 'var(--bg-secondary)',
              color: activeTemplateName === tpl.name
                ? 'var(--color-gold)'
                : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tpl.name}
          </button>
          {/* 删除按钮 */}
          <button
            onClick={(e) => handleDelete(e, tpl.name)}
            style={{
              position: 'absolute',
              right: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-blood)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* 最近使用 */}
      {recentConfigs.length > 0 && (
        <>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
            }}
          >
            最近
          </span>
          {recentConfigs.map((config, idx) => (
            <button
              key={idx}
              onClick={() => onSelectTemplate(config)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title={`${config.tank}坦/${config.healer}奶/${config.dps}输出`}
            >
              {config.tank}/{config.healer}/{config.dps}
            </button>
          ))}
        </>
      )}

      {/* 保存按钮 */}
      {canSave && (
        <button
          onClick={onSaveClick}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px dashed var(--color-gold)',
            background: 'transparent',
            color: 'var(--color-gold)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 209, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          + 保存当前配置
        </button>
      )}
    </div>
  );
}
