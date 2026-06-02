import Icon from "../ui/Icon";

export default function NotificationPanel({ notifications, onClose, onMarkAllRead, onRead }) {
  return (
    <div className="fixed right-3 top-[calc(env(safe-area-inset-top)+7.45rem)] z-[60] w-[min(330px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#dfe7db] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.16)] dark:border-[#23314d] dark:bg-[#0b1220] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[min(360px,calc(100vw-2rem))] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="text-[#f97316]" name="notifications_active" />
          <h3 className="text-sm font-semibold text-[#183325] dark:text-white">Novedades</h3>
        </div>
        <button className="text-xs font-semibold text-[#f97316]" onClick={onMarkAllRead} type="button">
          Marcar todo
        </button>
      </div>

      <div className="mt-3 max-h-[min(420px,calc(100dvh-13rem))] space-y-2 overflow-auto">
        {notifications.length ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={`w-full rounded-xl border p-3 text-left transition-colors active:bg-[#f4f7f2] dark:active:bg-[#111827] ${notification.read ? "border-[#e7efe5]" : "border-[#f7c28f] bg-[#fff8f2] dark:border-[#f97316]/30 dark:bg-[#111827]"}`}
              onClick={() => onRead(notification.id)}
              type="button"
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 shrink-0 text-[#1f7a3a]" name={notification.read ? "draft" : "mark_email_unread"} />
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm font-semibold text-[#183325] dark:text-white">{notification.actorName || "Fizzia"}</strong>
                    <span className="shrink-0 text-[10px] text-[#738378] dark:text-[#94a3b8]">{new Date(notification.createdAt).toLocaleString("es-EC", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#5b6d61] dark:text-[#c7d2e0]">{notification.message}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Todavia no hay novedades recientes.</p>
        )}
      </div>

      <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe7db] px-3 py-2.5 text-sm font-medium text-[#183325] active:bg-[#f4f7f2] dark:border-[#314056] dark:text-[#f8fafc] dark:active:bg-[#111827]" onClick={onClose} type="button">
        <Icon name="close" />
        Cerrar
      </button>
    </div>
  );
}
