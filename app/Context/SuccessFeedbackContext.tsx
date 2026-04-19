"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import SuccessModal from "@/app/Components/SuccessModal";

type SuccessPayload = {
  title?: string;
  message: string;
  durationMs?: number;
};

type SuccessFeedbackContextValue = {
  showSuccess: (payload: SuccessPayload) => void;
  hideSuccess: () => void;
};

const SuccessFeedbackContext = createContext<SuccessFeedbackContextValue | null>(null);

export function SuccessFeedbackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("Success");
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideSuccess = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setVisible(false);
  }, []);

  const showSuccess = useCallback(
    ({ title: nextTitle = "Success", message: nextMessage, durationMs = 1800 }: SuccessPayload) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setTitle(nextTitle);
      setMessage(nextMessage);
      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, durationMs);
    },
    []
  );

  const value = useMemo(
    () => ({
      showSuccess,
      hideSuccess,
    }),
    [hideSuccess, showSuccess]
  );

  return (
    <SuccessFeedbackContext.Provider value={value}>
      {children}
      <SuccessModal
        visible={visible}
        title={title}
        message={message}
        onClose={hideSuccess}
      />
    </SuccessFeedbackContext.Provider>
  );
}

export function useSuccessFeedback() {
  const context = useContext(SuccessFeedbackContext);

  if (!context) {
    throw new Error("useSuccessFeedback must be used inside SuccessFeedbackProvider");
  }

  return context;
}
