"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StyleUtil } from "@/kits/utils";
import { Button } from "@/kits/components/button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useNotification } from "@/kits/components/notification";
import { TrashCan, Copy, View, ViewOff } from "@carbon/icons-react";

const styles = {
  container: StyleUtil.cn("min-h-screen bg-gray-10"),
  content: StyleUtil.cn("px-4 pb-8 pt-6"),
  section: StyleUtil.cn("mb-6"),
  sectionTitle: StyleUtil.cn("text-sm font-medium text-gray-100 mb-3"),
  card: StyleUtil.cn("bg-white p-4 mb-3", "outline outline-1 -outline-offset-1 outline-gray-30"),
  cardHeader: StyleUtil.cn("mb-3"),
  cardTitle: StyleUtil.cn("text-sm font-medium text-gray-100 mb-1"),
  cardDescription: StyleUtil.cn("text-xs text-gray-70"),
  buttonGroup: StyleUtil.cn("flex gap-2 w-full"),
  warningText: StyleUtil.cn("text-xs text-red-50 mt-2"),
  debugDataContainer: StyleUtil.cn(
    "mt-3 p-3 bg-gray-10 rounded max-h-[300px] overflow-y-auto text-xs font-mono",
  ),
  debugKey: StyleUtil.cn("text-gray-100 font-semibold break-all"),
  debugValue: StyleUtil.cn("text-gray-70 break-all whitespace-pre-wrap"),
  successText: StyleUtil.cn("text-xs text-green-50 mt-2"),
};

export default function ConfigurationPage() {
  const router = useRouter();
  const notification = useNotification();
  const [isClearing, setIsClearing] = React.useState(false);
  const [cameraPermission, setCameraPermission] = React.useState<string>("checking");
  const [locationPermission, setLocationPermission] = React.useState<string>("checking");
  const [showDebugData, setShowDebugData] = React.useState(false);
  const [isCopying, setIsCopying] = React.useState(false);

  // Kiểm tra quyền truy cập khi component mount
  React.useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Kiểm tra quyền camera
    try {
      if (navigator.permissions) {
        const cameraResult = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setCameraPermission(cameraResult.state);

        // Lắng nghe thay đổi
        cameraResult.onchange = () => {
          setCameraPermission(cameraResult.state);
        };
      } else {
        setCameraPermission("unknown");
      }
    } catch (error) {
      // Fallback: thử truy cập camera để kiểm tra
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission("granted");
      } catch (err) {
        setCameraPermission("denied");
      }
    }

    // Kiểm tra quyền vị trí
    try {
      if (navigator.permissions) {
        const locationResult = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        setLocationPermission(locationResult.state);

        // Lắng nghe thay đổi
        locationResult.onchange = () => {
          setLocationPermission(locationResult.state);
        };
      } else {
        setLocationPermission("unknown");
      }
    } catch (error) {
      setLocationPermission("unknown");
    }
  };

  const getPermissionDisplay = (state: string) => {
    switch (state) {
      case "granted":
        return { text: "Đã cấp quyền", color: "text-green-50" };
      case "denied":
        return { text: "Bị từ chối", color: "text-red-50" };
      case "prompt":
        return { text: "Chưa hỏi", color: "text-yellow-50" };
      case "checking":
        return { text: "Đang kiểm tra...", color: "text-gray-50" };
      default:
        return { text: "Không xác định", color: "text-gray-50" };
    }
  };

  const handleClearLocalStorage = async () => {
    try {
      setIsClearing(true);

      // Lưu lại auth-storage trước khi xóa
      const authStorage = localStorage.getItem("auth-storage");

      // Xóa tất cả dữ liệu trong local storage
      localStorage.clear();

      // Khôi phục lại auth-storage để giữ phiên đăng nhập
      if (authStorage) {
        localStorage.setItem("auth-storage", authStorage);
      }

      notification.success({
        title: "Đã xóa dữ liệu",
        description: "Dữ liệu cấu hình đã được xóa. Trang sẽ tải lại...",
      });

      // Chờ 1 giây để người dùng thấy thông báo rồi reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể xóa dữ liệu. Vui lòng thử lại.",
      });
      setIsClearing(false);
    }
  };

  const getLocalStorageData = () => {
    const data: Record<string, any> = {};

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          try {
            // Thử parse JSON
            data[key] = JSON.parse(value || "");
          } catch {
            // Nếu không phải JSON thì giữ nguyên string
            data[key] = value;
          }
        }
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }

    return data;
  };

  const formatDebugData = () => {
    const data = getLocalStorageData();

    // Thêm thông tin hệ thống
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "N/A",
      screenSize:
        typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "N/A",
      viewport:
        typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "N/A",
      permissions: {
        camera: cameraPermission,
        location: locationPermission,
      },
      localStorage: data,
    };

    return JSON.stringify(debugInfo, null, 2);
  };

  const handleCopyDebugData = async () => {
    try {
      setIsCopying(true);
      const debugData = formatDebugData();

      await navigator.clipboard.writeText(debugData);

      notification.success({
        title: "Đã sao chép",
        description: "Thông tin debug đã được sao chép vào clipboard",
      });

      setIsCopying(false);
    } catch (error) {
      notification.error({
        title: "Lỗi",
        description: "Không thể sao chép dữ liệu. Vui lòng thử lại.",
      });
      setIsCopying(false);
    }
  };

  const toggleDebugData = () => {
    setShowDebugData(!showDebugData);
  };

  return (
    <div className={styles.container}>
      <ScreenHeader title="Cấu hình hệ thống" onBack={() => router.back()} />

      <div className={styles.content}>
        {/* Data Management Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quản lý dữ liệu</h2>

          {/* Clear Local Storage Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Xóa dữ liệu cấu hình</h3>
              <p className={styles.cardDescription}>
                Xóa toàn bộ dữ liệu được lưu trên thiết bị này để tải lại cấu hình mới nhất từ
                server.
              </p>
              <p className={styles.warningText}>Cảnh báo: Hành động này không thể hoàn tác!</p>
            </div>
            <div className={styles.buttonGroup}>
              <Button
                variant="danger"
                size="medium"
                icon={TrashCan}
                centered
                onClick={handleClearLocalStorage}
                loading={isClearing}
                disabled={isClearing}
              >
                Xóa dữ liệu
              </Button>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quyền truy cập</h2>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Camera</h3>
              <p className={styles.cardDescription}>
                Trạng thái:{" "}
                <span className={getPermissionDisplay(cameraPermission).color}>
                  {getPermissionDisplay(cameraPermission).text}
                </span>
              </p>
              {cameraPermission === "denied" && (
                <p className={styles.warningText}>
                  Vui lòng cấp quyền camera trong cài đặt trình duyệt để sử dụng tính năng chụp ảnh.
                </p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Vị trí</h3>
              <p className={styles.cardDescription}>
                Trạng thái:{" "}
                <span className={getPermissionDisplay(locationPermission).color}>
                  {getPermissionDisplay(locationPermission).text}
                </span>
              </p>
              {locationPermission === "denied" && (
                <p className={styles.warningText}>
                  Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng
                  định vị.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* App Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin ứng dụng</h2>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Phiên bản</h3>
              <p className={styles.cardDescription}>Version: 1.0.0</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Thông tin trình duyệt</h3>
              <p className={styles.cardDescription}>
                User Agent: {typeof window !== "undefined" ? window.navigator.userAgent : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Debug Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hỗ trợ gỡ lỗi</h2>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Thông tin cấu hình</h3>
              <p className={styles.cardDescription}>Xem và sao chép thông tin hệ thống</p>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                variant="tertiary"
                size="medium"
                icon={showDebugData ? ViewOff : View}
                centered
                onClick={toggleDebugData}
                className="flex-1"
              >
                {showDebugData ? "Ẩn thông tin" : "Xem thông tin"}
              </Button>
              <Button
                variant="primary"
                size="medium"
                icon={Copy}
                centered
                onClick={handleCopyDebugData}
                loading={isCopying}
                disabled={isCopying}
                className="flex-1"
              >
                Sao chép
              </Button>
            </div>

            {showDebugData && (
              <div className={styles.debugDataContainer}>
                <pre className={styles.debugValue}>{formatDebugData()}</pre>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Hướng dẫn gửi thông tin</h3>
              <p className={styles.cardDescription}>
                1. Nhấn nút "Sao chép" để copy thông tin debug 2. Gửi thông tin đã copy cho admin
                qua email hoặc chat 3. Admin sẽ phân tích và hỗ trợ bạn khắc phục vấn đề
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
