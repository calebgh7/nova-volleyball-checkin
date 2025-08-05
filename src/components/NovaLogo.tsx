import novaLogo from '../assets/images/Path 31.png';

interface NovaLogoProps {
  className?: string;
  size?: number;
}

export default function NovaLogo({ className = "", size = 40 }: NovaLogoProps) {
  return (
    <img 
      src={novaLogo} 
      alt="Nova Volleyball Club" 
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
