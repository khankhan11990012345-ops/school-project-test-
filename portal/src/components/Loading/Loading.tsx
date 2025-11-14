import { CSSProperties } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

const Loading = ({ size = 'md', fullScreen = false, message }: LoadingProps) => {
  const sizeMap: Record<string, number> = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  const spinnerSize = sizeMap[size];

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
    }),
  };

  const spinnerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
  };

  const ringStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '3px solid transparent',
    borderTopColor: '#667eea',
    borderRadius: '50%',
  };

  const ring2Style: CSSProperties = {
    ...ringStyle,
    borderTopColor: '#764ba2',
  };

  const ring3Style: CSSProperties = {
    ...ringStyle,
    borderTopColor: '#667eea',
    opacity: 0.7,
  };

  const messageStyle: CSSProperties = {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
    textAlign: 'center',
  };

  return (
    <>
      <div style={wrapperStyle}>
        <div style={spinnerStyle}>
          <div style={ringStyle}></div>
          <div style={ring2Style}></div>
          <div style={ring3Style}></div>
        </div>
        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </>
  );
};

export default Loading;
