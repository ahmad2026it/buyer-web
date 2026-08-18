import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepStatus = 'complete' | 'current' | 'upcoming';

export interface Step {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  icon?: React.ReactNode;
}

export interface ProgressStepsProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'dots' | 'numbered' | 'icons';
  style?: React.CSSProperties;
}

// ─── Check Icon ───────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 4.5L6.5 11 3 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  orientation = 'horizontal',
  variant = 'numbered',
  style,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const getStepDot = (step: Step, idx: number) => {
    const isComplete = step.status === 'complete';
    const isCurrent = step.status === 'current';

    const baseStyle: React.CSSProperties = {
      width: '32px', height: '32px',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px', lineHeight: '20px', fontWeight: 600,
      transition: 'all 0.2s',
    };

    if (isComplete) return (
      <div style={{ ...baseStyle, backgroundColor: '#7F56D9' }}>
        <CheckIcon />
      </div>
    );
    if (isCurrent) return (
      <div style={{ ...baseStyle, backgroundColor: '#FFFFFF', border: '2px solid #7F56D9', boxShadow: '0 0 0 4px #F4EBFF' }}>
        {variant === 'dots' ? (
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7F56D9' }} />
        ) : variant === 'icons' && step.icon ? (
          <span style={{ color: '#7F56D9' }}>{step.icon}</span>
        ) : (
          <span style={{ color: '#7F56D9' }}>{idx + 1}</span>
        )}
      </div>
    );
    // upcoming
    return (
      <div style={{ ...baseStyle, backgroundColor: '#FFFFFF', border: '2px solid #EAECF0' }}>
        {variant === 'dots' ? (
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EAECF0' }} />
        ) : variant === 'icons' && step.icon ? (
          <span style={{ color: '#D0D5DD' }}>{step.icon}</span>
        ) : (
          <span style={{ color: '#667085' }}>{idx + 1}</span>
        )}
      </div>
    );
  };

  const connectorStyle = (step: Step): React.CSSProperties => ({
    backgroundColor: step.status === 'complete' ? '#7F56D9' : '#EAECF0',
    transition: 'background-color 0.2s',
  });

  if (isHorizontal) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px' }}>
              {getStepDot(step, idx)}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: step.status === 'upcoming' ? '#667085' : '#344054' }}>
                  {step.label}
                </div>
                {step.description && (
                  <div style={{ fontSize: '14px', lineHeight: '20px', color: '#667085' }}>{step.description}</div>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', marginTop: '15px', ...connectorStyle(step) }} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {steps.map((step, idx) => (
        <div key={step.id} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            {getStepDot(step, idx)}
            {idx < steps.length - 1 && (
              <div style={{ width: '2px', flex: 1, minHeight: '20px', margin: '4px 0', ...connectorStyle(step) }} />
            )}
          </div>
          <div style={{ paddingBottom: idx < steps.length - 1 ? '24px' : '0', paddingTop: '4px' }}>
            <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: step.status === 'upcoming' ? '#667085' : '#344054' }}>
              {step.label}
            </div>
            {step.description && (
              <div style={{ fontSize: '14px', lineHeight: '20px', color: '#667085', marginTop: '4px' }}>
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
