import Prism from './Prism';

const Hero = ({ children }) => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Prism
        animationType="rotate"
        timeScale={0.5}
        scale={3.6}
        height={3.5}
        baseWidth={5.5}
        glow={1}
        noise={0}
        colorFrequency={1}
      />

      {/* Hero Content - overlay on top of prism */}
      <div style={{
        position: 'absolute',
        zIndex: 10,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        width: '100%'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Hero;
