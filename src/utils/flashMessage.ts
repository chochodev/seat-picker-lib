// flashMessage.js or flashMessage.ts

import { useLayoutState } from '@/zustand';

// ::::::::::::::::::::::::: Global Flash Message Hook
type flashSeverityType = 'success' | 'danger' | 'warning' | 'message';

const useFlashMessage = () => {
  const { layoutValues, setLayoutValues } = useLayoutState();

  return (
    title: string,
    message: string,
    severity: flashSeverityType = 'success'
  ) => {
    setLayoutValues({
      ...layoutValues,
      flashTitle: title,
      flashMessage: message,
      flashSeverity: severity,
      openFlashMessage: true,
    });
  };
};

export default useFlashMessage;
