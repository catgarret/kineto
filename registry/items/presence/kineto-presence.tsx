'use client';

// KinetoPresence (preset flavour) — animate a block in when it mounts and out
// before it unmounts, with named presets instead of hand-written states.
//   const [open, setOpen] = useState(false);
//   <KinetoPresence present={open} enter="fade-up" exit="fade" onExited={() => setMounted(false)}>
//     <DialogBody />
//   </KinetoPresence>
// Kineto never removes the element itself: keep it rendered until `onExited`
// fires, then drop it from state. Works inside shadcn/Radix Dialog content —
// the library keeps owning open/close and focus.
import { useMemo, type ElementType, type ReactNode } from 'react';
import { states, type KinetoStateDefinitions } from '@dong-gri/kineto';
import { KinetoPresence as PresenceHost } from '@dong-gri/kineto/react';

export type KinetoPresencePreset = 'fade' | 'fade-up' | 'fade-down' | 'zoom' | 'slide-left' | 'slide-right';

type StateShape = KinetoStateDefinitions[string];
const PRESETS: Record<KinetoPresencePreset, { hidden: StateShape; visible: StateShape }> = {
  'fade': { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  'fade-up': { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
  'fade-down': { hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0 } },
  'zoom': { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
  'slide-left': { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } }
};

export interface KinetoPresenceProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  present?: boolean;
  enter?: KinetoPresencePreset;
  exit?: KinetoPresencePreset;
  /** Seconds (Motion States run in milliseconds internally; converted here). */
  duration?: number;
  /** Called after a leave finished; remove the element from your state here. */
  onExited?: () => void;
  children?: ReactNode;
}

export function KinetoPresence({ as = 'div', present = true, enter = 'fade-up', exit = 'fade', duration = 0.3, onExited, children, ...props }: KinetoPresenceProps) {
  const options = useMemo(() => {
    const enterStates = states({ hidden: PRESETS[enter].hidden, visible: PRESETS[enter].visible });
    const exitStates = states({ hidden: PRESETS[exit].hidden, visible: PRESETS[exit].visible });
    return {
      mode: 'wait' as const,
      // `initial: 'hidden'` renders the hidden state first, so the enter is a
      // real motion from hidden → visible instead of a no-op on visible markup.
      enter: { state: enterStates, name: 'visible', options: { duration: duration * 1000, initial: 'hidden' } },
      exit: { state: exitStates, name: 'hidden', options: { duration: duration * 1000 } },
      safeToRemove: () => { onExited?.(); }
    };
  }, [enter, exit, duration, onExited]);

  return (
    <PresenceHost as={as} present={present} options={options} dependencies={[enter, exit, duration]} {...props}>
      {children}
    </PresenceHost>
  );
}

export default KinetoPresence;
