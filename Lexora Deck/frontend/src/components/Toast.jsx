import React from "react"

const typeStyles = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-indigo-600 text-white",
  warning: "bg-yellow-500 text-white",
}

const typeIcons = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
}

export const Toast = ({ toasts, dismiss }) => {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
            pointer-events-auto cursor-pointer transition-all duration-300 animate-slide-in
            ${typeStyles[t.type] || typeStyles.info}`}
          onClick={() => dismiss(t.id)}
        >
          <span className="text-base">{typeIcons[t.type] || typeIcons.info}</span>
          <span>{t.message}</span>
          <span className="ml-2 opacity-70 text-xs">✕</span>
        </div>
      ))}
    </div>
  )
}

export default Toast
