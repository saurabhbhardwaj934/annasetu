import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "./ui.jsx";

const ToastContext = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const tid = ++id;
    setToasts((t) => [...t, { id: tid, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon name={t.type === "error" ? "x" : "check"} size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
