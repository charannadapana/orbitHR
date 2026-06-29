import BorderGlow from './BorderGlow';

const Card = ({
  children,
  className = '',
  padding = true,
  hover = false,
  glowColor = '200 75 65',
  colors = ['#06b6d4', '#818cf8', '#38bdf8'],
  animated = false,
}) => {
  return (
    <BorderGlow
      glowColor={glowColor}
      colors={colors}
      backgroundColor="var(--bg-card)"
      borderRadius={16}
      glowRadius={38}
      glowIntensity={0.9}
      animated={animated}
      className={className}
    >
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </BorderGlow>
  );
};

export default Card;
