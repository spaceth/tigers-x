import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { useInView } from '../lib/hooks';

/**
 * Restrained one-time fade-up as content enters the viewport. Content is never
 * hidden from assistive technology, and reduced motion shows it immediately (CSS).
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  delay = 0,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const [ref, inView] = useInView<HTMLElement>({ margin: '0px 0px -8% 0px' });
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} data-delay={delay} {...rest}>
      {children}
    </Tag>
  );
}
