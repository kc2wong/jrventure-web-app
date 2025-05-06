import { useEffect, useRef } from 'react';
import { BaseState } from '../states/base-state';

type UseNotificationProps<
  T extends BaseState,
  TStart extends T,
  TSuccess extends T,
  TFail extends T,
> = {
  operationStart: (state: TStart) => void;
  operationSuccess: (state: TSuccess) => void;
  operationFail: (state: TFail) => void;
  isStart: (state: T) => state is TStart;
  isSuccess: (state: T) => state is TSuccess;
  isFail: (state: T) => state is TFail;
};

export function useNotification<
  T extends BaseState,
  TStart extends T,
  TSuccess extends T,
  TFail extends T,
>(
  state: T,
  {
    operationStart,
    operationSuccess,
    operationFail,
    isStart,
    isSuccess,
    isFail,
  }: UseNotificationProps<T, TStart, TSuccess, TFail>,
) {
  const stateVersion = useRef(state.eventTime);

  useEffect(() => {
    if (state.eventTime > stateVersion.current) {
      if (isStart(state)) {
        operationStart(state);
      } else if (isSuccess(state)) {
        operationSuccess(state);
      } else if (isFail(state)) {
        operationFail(state);
      }
      stateVersion.current = state.eventTime;
    }
  // }, [state, operationStart, operationSuccess, operationFail, isStart, isSuccess, isFail]);
  }, [state.eventTime]);
}
