/**
File Name : components/common/ServiceWorkerRegistration
Description : ServiceWorker 등록
Author : 임도헌

History
Date        Author   Status    Description
2025.04.29  임도헌   Created
2025.04.29  임도헌   Modified  ServiceWorker 등록 컴포넌트 추가
*/

"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
      });
    }
  }, []);

  return null;
}
