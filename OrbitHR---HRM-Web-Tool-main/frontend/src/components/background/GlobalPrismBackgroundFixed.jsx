import Prism from './Prism';

const GlobalPrismBackgroundFixed = ({ intensity = 'medium' }) => {
  const opacityMap = {
    high: 0.6,
    medium: 0.3,
    low: 0.15
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: opacityMap[intensity] || 0.6
      }}
    >
      <Prism
        animationType="rotate"
        timeScale={0.3}
        scale={3.6}
        height={3.5}
        baseWidth={5.5}
        glow={0.4}
        noise={0.1}
        colorFrequency={1}
        suspendWhenOffscreen={false}
      />
    </div>
  );
};

export default GlobalPrismBackgroundFixed;
