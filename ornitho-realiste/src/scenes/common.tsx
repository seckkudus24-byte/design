import React from 'react';
import {Badge} from '../characters/Props';
import {BADGE_Y} from '../layout';

// Badge centré sur la ligne des badges, qui apparaît avec l'échelle s.
export const TopBadge: React.FC<{s: number; children: React.ReactNode; size?: number; color?: string; rotate?: number; dy?: number}> = ({s, children, size = 70, color, rotate, dy = 0}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: BADGE_Y + dy, display: 'flex', justifyContent: 'center', transform: `scale(${s})`, pointerEvents: 'none'}}>
    <Badge size={size} color={color} rotate={rotate}>
      {children}
    </Badge>
  </div>
);
