import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';

type TransitionStyles = {
  [key in TransitionStatus]?: React.CSSProperties;
};

const transitionStyles: TransitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
  unmounted: { opacity: 0 },
};

const defaultDuration = 300;

interface PageTransitionRef {
  startTransition: (callback: () => void) => void;
}

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

/**
 * Provide fading effects entering new page
 */
export const PageTransition = forwardRef<PageTransitionRef, PageTransitionProps>((props, ref) => {
  const [show, setShow] = useState(true);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef<(() => void) | null>(null);

  const duration = props.duration ?? defaultDuration;

  const defaultStyle: React.CSSProperties = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
  };

  const startTransition = useCallback((callback: () => void) => {
    callbackRef.current = callback;
    setShow(false);
  }, []);

  const handleExited = () => {
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null;
    }
    setShow(true);
  };

  useImperativeHandle(ref, () => ({
    startTransition,
  }));

  return (
    <Transition in={show} nodeRef={nodeRef} onExited={handleExited} timeout={duration}>
      {(state) => (
        <div
          ref={nodeRef}
          style={{
            ...defaultStyle,
            ...(transitionStyles[state] ?? {}),
          }}
        >
          {props.children}
        </div>
      )}
    </Transition>
  );
});