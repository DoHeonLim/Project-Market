self.addEventListener("push", function (event) {
  const data = event.data.json();

  const options = {
    // 알림의 본문 내용
    body: data.body,
    // 알림에 표시되는 작은 아이콘 (앱 아이콘)
    // data.image가 있으면 그것을 사용하고, 없으면 기본 아이콘 사용
    icon: data.image || "/images/logo.svg",
    // 알림 트레이에 표시되는 작은 아이콘 (상태 표시줄)
    badge: "/images/logo.svg",
    // 알림 클릭 시 필요한 추가 데이터
    data: {
      url: data.link, // 클릭 시 이동할
    },
    // 알림에 표시되는 큰 이미지
    // 일부 브라우저에서는 알림 아래에 큰 이미지로 표시됨
    image: data.image,
    // 알림 수신 시 진동 패턴
    // [진동시간(ms), 대기시간(ms), 진동시간(ms)]
    vibrate: [200, 100, 200],
    // true로 설정하면 사용자가 직접 닫거나 클릭하기 전까지 알림이 유지됨
    // false면 시스템이 자동으로 알림을 닫을 수 있음
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
