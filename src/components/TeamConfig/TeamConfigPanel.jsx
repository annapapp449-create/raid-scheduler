import { useState, useEffect, useRef } from 'react';
import { ROLE_CONFIG, PRESET_TEMPLATE, BLOODLUST_SPECS } from '../../constants/wowSpecs';
import RoleSection from './RoleSection';
import TemplateBar from './TemplateBar';
import SaveTemplateModal from './SaveTemplateModal';

/**
 * TeamConfigPanel - 团队配置面板
 * 三层渐进式配置：角色人数Stepper → 天赋指定 → 模板系统
 */
export default function TeamConfigPanel({
  value = { tank: 3, healer: 4, dps: 18, specRequirements: [] },
  onChange,
  savedTemplates = [],
  onSaveTemplate,
  onDeleteTemplate,
  recentConfigs = [],
}) {
  const [expandedRole, setExpandedRole] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // 当前激活的模板名称
  const [activeTemplateName, setActiveTemplateName] = useState(null);

  // 同步激活状态：当手动修改配置时取消高亮
  useEffect(() => {
    if (activeTemplateName) {
      const template = savedTemplates.find(t => t.name === activeTemplateName)
        || (activeTemplateName === PRESET_TEMPLATE.name ? PRESET_TEMPLATE : null);

      if (template) {
        const isSame =
          template.tank === value.tank &&
          template.healer === value.healer &&
          template.dps === value.dps &&
          JSON.stringify(template.specRequirements) === JSON.stringify(value.specRequirements);

        if (!isSame) {
          setActiveTemplateName(null);
        }
      }
    }
  }, [value, activeTemplateName, savedTemplates]);

  // 显示 toast
  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 1500);
  };

  // 更新角色人数
  const handleCountChange = (roleKey, newCount) => {
    onChange({
      ...value,
      [roleKey]: newCount,
    });
  };

  // 更新天赋需求
  const handleSpecChange = (roleKey, newSpecRequirements) => {
    onChange({
      ...value,
      specRequirements: newSpecRequirements,
    });
  };

  // 切换展开
  const toggleExpand = (roleKey) => {
    setExpandedRole(expandedRole === roleKey ? null : roleKey);
  };

  // 选择模板
  const handleSelectTemplate = (template) => {
    onChange({
      tank: template.tank,
      healer: template.healer,
      dps: template.dps,
      specRequirements: template.specRequirements || [],
    });
    setActiveTemplateName(template.name);
  };

  // 保存模板
  const handleSaveTemplate = (name) => {
    if (savedTemplates.length >= 5) {
      showToast('最多保存5个模板');
      setShowSaveModal(false);
      return;
    }
    onSaveTemplate({
      name,
      tank: value.tank,
      healer: value.healer,
      dps: value.dps,
      specRequirements: value.specRequirements,
    });
    setActiveTemplateName(name);
    setShowSaveModal(false);
    showToast('模板已保存');
  };

  // 删除模板
  const handleDeleteTemplate = (name) => {
    onDeleteTemplate(name);
    if (activeTemplateName === name) {
      setActiveTemplateName(null);
    }
    showToast('模板已删除');
  };

  // 计算总数
  const total = value.tank + value.healer + value.dps;

  // 人数校验颜色
  const getCountColor = () => {
    if (total === 25) return 'var(--color-success, #00ff96)';
    if (total > 25) return 'var(--color-error, #ff4444)';
    return 'var(--color-warning, #ff8c00)';
  };

  // 嗜血警告
  const showBloodlustWarning = () => {
    if (expandedRole === null) return false;
    if (!value.specRequirements || value.specRequirements.length === 0) return false;

    const hasBloodlust = value.specRequirements.some(
      req => BLOODLUST_SPECS.includes(req.specId) && req.count > 0
    );
    return !hasBloodlust;
  };

  // 配比条
  const renderCompositionBar = () => {
    const tankPct = (value.tank / 25) * 100;
    const healerPct = (value.healer / 25) * 100;
    const dpsPct = (value.dps / 25) * 100;

    return (
      <div
        style={{
          display: 'flex',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden',
          background: 'var(--bg-tertiary)',
        }}
      >
        <div
          style={{
            width: `${tankPct}%`,
            background: 'var(--color-frost)',
            transition: 'width 0.3s',
          }}
        />
        <div
          style={{
            width: `${healerPct}%`,
            background: 'var(--color-plague)',
            transition: 'width 0.3s',
          }}
        />
        <div
          style={{
            width: `${dpsPct}%`,
            background: 'var(--color-ember)',
            transition: 'width 0.3s',
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* 模板栏 */}
      <TemplateBar
        templates={savedTemplates}
        recentConfigs={recentConfigs}
        activeTemplateName={activeTemplateName}
        onSelectTemplate={handleSelectTemplate}
        onSaveTemplate={onSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSaveClick={() => setShowSaveModal(true)}
        canSave={true}
      />

      {/* 角色区块 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ROLE_CONFIG.map((role) => (
          <RoleSection
            key={role.key}
            role={role}
            count={value[role.key]}
            specRequirements={value.specRequirements.filter(
              req => role.specs.some(spec => spec.id === req.specId)
            )}
            expanded={expandedRole === role.key}
            onToggleExpand={() => toggleExpand(role.key)}
            onCountChange={(count) => handleCountChange(role.key, count)}
            onSpecChange={(specs) => {
              // 合并：保留其他角色的specRequirements + 更新当前角色的
              const otherSpecs = value.specRequirements.filter(
                req => !role.specs.some(spec => spec.id === req.specId)
              );
              handleSpecChange(role.key, [...otherSpecs, ...specs]);
            }}
          />
        ))}
      </div>

      {/* 底部概览 */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
        }}
      >
        {/* 配比条 */}
        {renderCompositionBar()}

        {/* 人数校验 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            团队人数
          </span>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: getCountColor(),
            }}
          >
            {total}/25
          </span>
        </div>

        {/* Buff 警告 */}
        {showBloodlustWarning() && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 10px',
              background: 'rgba(255, 140, 0, 0.15)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--color-warning, #ff8c00)',
            }}
          >
            缺少嗜血/英勇 — 建议加萨满或法师
          </div>
        )}
      </div>

      {/* 保存模板弹窗 */}
      {showSaveModal && (
        <SaveTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: '#00ff96',
            color: '#000',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 1001,
            animation: 'fadeIn 0.2s',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
