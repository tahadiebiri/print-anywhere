import { svgIcons } from '@/lib/svg-assets';

interface TemplateIconProps {
  icon: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizes = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function TemplateIcon({ icon, className = '', size = 'md' }: TemplateIconProps) {
  if (icon.startsWith('svg:')) {
    const key = icon.substring(4);
    const svgIcon = svgIcons[key];
    if (svgIcon) {
      return (
        <svg viewBox={svgIcon.viewBox} className={`${sizes[size]} fill-current ${className}`}>
          <path d={svgIcon.path} />
        </svg>
      );
    }
  }
  return <span className={`${textSizes[size]} ${className}`}>{icon}</span>;
}
