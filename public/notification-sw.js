self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const focusedClient = clients.find((client) => "focus" in client);
        if (focusedClient) return focusedClient.focus();
        if (self.clients.openWindow) return self.clients.openWindow("/panel");
        return undefined;
      })
  );
});
