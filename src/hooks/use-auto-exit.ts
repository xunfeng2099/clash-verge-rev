import { useEffect, useRef, useCallback } from "react";
  import { exit } from "@tauri-apps/plugin-process";

  const AUTO_EXIT_INTERVAL = 4 * 60 * 60 * 1000; // 4小时，单位：毫秒
  const WARNING_TIME = 5 * 60 * 1000; // 提前5分钟警告

  export const useAutoExit = (enabled: boolean = false) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleExit = useCallback(async () => {
      try {
        await exit(0);
      } catch (error) {
        console.error("自动退出失败:", error);
        window.close();
      }
    }, []);

    const showWarning = useCallback(() => {
      const shouldExit = confirm(
        "应用将在5分钟后自动退出。如需继续使用，请点击取消并重启应用。点击确定立即退出。"
      );

      if (shouldExit) {
        handleExit();
      }
    }, [handleExit]);

    const startTimer = useCallback(() => {
      // 清除现有定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      if (!enabled) return;

      // 设置警告定时器（提前5分钟）
      warningTimerRef.current = setTimeout(() => {
        showWarning();
      }, AUTO_EXIT_INTERVAL - WARNING_TIME);

      // 设置退出定时器（4小时后）
      timerRef.current = setTimeout(() => {
        handleExit();
      }, AUTO_EXIT_INTERVAL);

      console.log(`自动退出定时器已启动，将在${AUTO_EXIT_INTERVAL / 1000 / 60}分钟后退出应用`);
    }, [enabled, showWarning, handleExit]);

    const stopTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      console.log("自动退出定时器已停止");
    }, []);

    useEffect(() => {
      if (enabled) {
        startTimer();
      } else {
        stopTimer();
      }

      // 清理函数
      return () => {
        stopTimer();
      };
    }, [enabled, startTimer, stopTimer]);

    return {
      startTimer,
      stopTimer,
      isTimerActive: enabled && (timerRef.current !== null),
    };
  };