'use client';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
  message?: string;
}

const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

// WhoCan mark only (no text)
function WhoCanMark() {
  return (
    <svg width="30" height="34" viewBox="0 0 44 34" fill="none">
      <path d="M19.3728 2.47801C20.6978 0.134223 23.6737 -0.692738 26.0197 0.630946C28.3657 1.95464 29.1935 4.9277 27.8685 7.27149L15.5022 29.1471C14.1772 31.4909 11.2013 32.3179 8.8553 30.9942C6.50929 29.6705 5.68154 26.6974 7.00648 24.3536L19.3728 2.47801Z" fill="#A54AFF"/>
      <path d="M1.26277 2.15119C3.04388 -0.22362 6.41297 -0.704966 8.7878 1.07612C11.1626 2.85723 11.644 6.22632 9.86287 8.60114L9.67537 8.85114C7.89426 11.226 4.52517 11.7073 2.15034 9.92622C-0.224467 8.14511 -0.705813 4.77601 1.07527 2.40119L1.26277 2.15119Z" fill="#A54AFF"/>
      <path d="M10.625 3.62592C10.9375 4.81342 11.0625 6.18842 12.8125 6.50092C14.125 6.68842 15.5833 6.52175 16.1875 6.31342C17.6547 5.84183 18.785 4.82845 19.3208 4.04669L14.908 11.7282C15.3193 10.7352 15.2167 9.44123 12.8125 9.12592C9.76248 8.72592 9.1875 9.56342 8.3125 10.1259L10.625 3.62592Z" fill="#A54AFF"/>
    </svg>
  );
}

export default function AuthGateModal({ onClose, message }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.52)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div style={{
        background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '400px',
        padding: '40px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
        textAlign: 'center', position: 'relative',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </button>

        {/* Logo icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #F4EBFF, #E9D7FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <WhoCanMark />
        </div>

        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#101828', marginBottom: '10px', lineHeight: '1.3' }}>
          Log in to continue
        </h2>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085', lineHeight: '1.6', marginBottom: '32px', maxWidth: '290px' }}>
          {message || 'You need to be logged in to use this feature. Join WhoCan to get started.'}
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => { onClose(); router.push('/auth/login'); }}
            style={{ width: '100%', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#ffffff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '13px 16px', cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 2px 12px rgba(165,74,255,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Log In
          </button>
          <button
            onClick={() => { onClose(); router.push('/auth/signup'); }}
            style={{ width: '100%', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#A54AFF', background: '#ffffff', border: '1.5px solid #A54AFF', borderRadius: '9999px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
          >
            Sign Up
          </button>
        </div>

        <button onClick={onClose} style={{ marginTop: '20px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#98A2B3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
