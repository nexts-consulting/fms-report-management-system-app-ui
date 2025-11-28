"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ReportProductInputGroup } from "./input-group";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextInput } from "@/kits/components/TextInput";
import { Button } from "@/kits/components/Button";
import { ImageCaptureInput } from "@/kits/components/ImageCaptureInput";
import { StyleUtil } from "@/kits/utils";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { redeemReportApi } from "@/services/api/reports/redeem-report";
import { useNotification } from "@/kits/components/Notification";
import { HttpStatusCode } from "axios";
import { useGlobalContext } from "@/contexts/global.context";
import { useMutationCustomerFindByPhoneNumber } from "@/services/api/customer/find-by-phone-numer";
// Cấu hình sản phẩm theo dung tích
const productConfig = {
  SCU_PROBI_TRUYEN_THONG_65ML: { size: 65, name: "SCU Probi Truyền Thống 65ml" },
  SCU_PROBI_DUA_GANG_65ML: { size: 65, name: "SCU Probi Dưa Gang 65ml" },
  SCU_PROBI_DAU_65ML: { size: 65, name: "SCU Probi Dâu 65ml" },
  SCU_PROBI_VIET_QUAT_65ML: { size: 65, name: "SCU Probi Việt Quất 65ml" },
  // SCU_PROBI_DUA_65ML: { size: 65, name: "SCU Probi Dứa 65ml" },
  SCU_PROBI_TRUYEN_THONG_130ML: { size: 130, name: "SCU Probi Truyền Thống 130ml" },
  // SCU_PROBI_DUA_GANG_130ML: { size: 130, name: "SCU Probi Dưa Gang 130ml" },
  // SCU_PROBI_DAU_130ML: { size: 130, name: "SCU Probi Dâu 130ml" },
  SCU_PROBI_VIET_QUAT_130ML: { size: 130, name: "SCU Probi Việt Quất 130ml" },
  // SCU_PROBI_DUA_130ML: { size: 130, name: "SCU Probi Dứa 130ml" },
  
};

// Hệ thống điểm
const POINT_SYSTEM = {
  65: 1, // 1 lốc 65ml = 1 điểm
  130: 2, // 1 lốc 130ml = 2 điểm
};

// Scheme quà tặng
const giftSchemes = {
  // Scheme 1: Mua 2 lốc 65ml tặng 2 chai 65ml (2 điểm)
  BOTTLE_GIFT_65: {
    id: "GIFT_SALE_VNM_PROBI_BOTTLE_65",
    name: "02 Chai SCU Probi 65ml",
    requiredPoints: 2,
    size: 65,
    requiredQuantity: 2,
  },
  // Scheme 2: Mua 2 lốc 130ml tặng 2 chai 130ml (4 điểm)
  BOTTLE_GIFT_130: {
    id: "GIFT_SALE_VNM_PROBI_BOTTLE_130",
    name: "02 Chai SCU Probi 130ml",
    requiredPoints: 4,
    size: 130,
    requiredQuantity: 2,
  },
  // Scheme 3: Mua 6 lốc 65ml hoặc 4 lốc 130ml nhận 1 túi bao tử (6-8 điểm)
  BAG_GIFT: {
    id: "GIFT_SALE_WAIST_BAG",
    name: "Túi bao tử Vinamilk",
    requiredPoints65: 6, // 6 điểm từ 65ml
    requiredPoints130: 8, // 8 điểm từ 130ml
    requiredQuantity65ml: 6,
    requiredQuantity130ml: 4,
  },
};

const productItems = Object.entries(productConfig).map(([id, config]) => ({
  id,
  name: config.name,
  skuCode: id,
  unit: "Lốc",
}));



export const Entry = () => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const currentWorkshift = globalStore.use.selectedWorkingShift();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();
  const {
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ 
    defaultValues: { 
      items: {},
    } 
  });

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isVerifiedCustomer, setIsVerifiedCustomer] = useState(false);
  const [fullName, setFullName] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [gifts, setGifts] = useState<Record<string, number>>({});
  const [formKey, setFormKey] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const findCustomerMutation = useMutationCustomerFindByPhoneNumber({});

  const formValues = watch();
  const productQuantities = formValues.items || {};

  // Mã OTP mặc định cho testing
  const DEFAULT_OTP = "000000";

  // Tính tổng số lượng theo dung tích
  const calculateQuantitiesBySize = () => {
    const quantities = { 65: 0, 130: 0 };
    Object.entries(productQuantities).forEach(([sku, value]) => {
      const quantity = (value as { pcs?: number }).pcs || 0;
      const config = productConfig[sku as keyof typeof productConfig];
      if (config) {
        quantities[config.size as keyof typeof quantities] += quantity;
      }
    });
    return quantities;
  };

  const quantitiesBySize = calculateQuantitiesBySize();

  // Tính điểm từ số lượng sản phẩm
  const calculatePoints = (quantities: { [key: number]: number }) => {
    return Object.entries(quantities).reduce((total, [sizeStr, qty]) => {
      const size = parseInt(sizeStr) as keyof typeof POINT_SYSTEM;
      return total + qty * POINT_SYSTEM[size];
    }, 0);
  };

  // Hàm helper để đảm bảo số không âm
  const ensureNonNegative = (num: number) => Math.max(0, num);

  // Tính số quà tặng có thể nhận được dựa trên lựa chọn hiện tại
  const calculateAvailableGifts = (currentGifts: Record<string, number> = gifts) => {
    const availableGifts = {
      [giftSchemes.BOTTLE_GIFT_65.id]: 0,
      [giftSchemes.BOTTLE_GIFT_130.id]: 0,
      [giftSchemes.BAG_GIFT.id]: 0,
    };

    // Tính số lốc có thể dùng cho từng loại quà
    const bottles65 = quantitiesBySize[65];
    const bottles130 = quantitiesBySize[130];

    // Tính số túi bao tử tối đa có thể nhận
    const maxBagsFrom65 = Math.floor(bottles65 / giftSchemes.BAG_GIFT.requiredQuantity65ml);
    const maxBagsFrom130 = Math.floor(bottles130 / giftSchemes.BAG_GIFT.requiredQuantity130ml);
    availableGifts[giftSchemes.BAG_GIFT.id] = maxBagsFrom65 + maxBagsFrom130;

    // Số quà đã chọn
    const selectedBags = currentGifts[giftSchemes.BAG_GIFT.id] || 0;
    const selected65 = currentGifts[giftSchemes.BOTTLE_GIFT_65.id] || 0;
    const selected130 = currentGifts[giftSchemes.BOTTLE_GIFT_130.id] || 0;

    if (selectedBags > 0) {
      // Nếu đã chọn túi, tính số lốc còn lại sau khi trừ túi
      let remaining65 = bottles65;
      let remaining130 = bottles130;

      if (selected130 > 0) {
        // Nếu đang chọn chai 130ml, ưu tiên dùng lốc 65ml cho túi
        const bagsNeeded = selectedBags;
        const bagsFrom65 = Math.min(bagsNeeded, maxBagsFrom65);
        remaining65 = ensureNonNegative(
          remaining65 - bagsFrom65 * giftSchemes.BAG_GIFT.requiredQuantity65ml,
        );

        // Nếu vẫn cần thêm túi, dùng lốc 130ml
        const remainingBags = bagsNeeded - bagsFrom65;
        if (remainingBags > 0) {
          remaining130 = ensureNonNegative(
            remaining130 - remainingBags * giftSchemes.BAG_GIFT.requiredQuantity130ml,
          );
        }

        // Tính số chai có thể nhận từ số lốc còn lại
        availableGifts[giftSchemes.BOTTLE_GIFT_65.id] = Math.floor(
          remaining65 / giftSchemes.BOTTLE_GIFT_65.requiredQuantity,
        );
        availableGifts[giftSchemes.BOTTLE_GIFT_130.id] = Math.floor(
          remaining130 / giftSchemes.BOTTLE_GIFT_130.requiredQuantity,
        );
      } else if (selected65 > 0) {
        // Nếu đang chọn chai 65ml, ưu tiên dùng lốc 130ml cho túi
        const bagsNeeded = selectedBags;
        const bagsFrom130 = Math.min(bagsNeeded, maxBagsFrom130);
        remaining130 = ensureNonNegative(
          remaining130 - bagsFrom130 * giftSchemes.BAG_GIFT.requiredQuantity130ml,
        );

        // Nếu vẫn cần thêm túi, dùng lốc 65ml
        const remainingBags = bagsNeeded - bagsFrom130;
        if (remainingBags > 0) {
          remaining65 = ensureNonNegative(
            remaining65 - remainingBags * giftSchemes.BAG_GIFT.requiredQuantity65ml,
          );
        }

        // Tính số chai có thể nhận từ số lốc còn lại
        availableGifts[giftSchemes.BOTTLE_GIFT_65.id] = Math.floor(
          remaining65 / giftSchemes.BOTTLE_GIFT_65.requiredQuantity,
        );
        availableGifts[giftSchemes.BOTTLE_GIFT_130.id] = Math.floor(
          remaining130 / giftSchemes.BOTTLE_GIFT_130.requiredQuantity,
        );
      } else {
        // Chưa chọn chai nào, cho phép chọn một trong hai
        // Tính cả hai trường hợp và lấy trường hợp cho nhiều chai nhất

        // Trường hợp 1: Dùng lốc 65ml cho túi
        let case1_65 = ensureNonNegative(
          bottles65 - selectedBags * giftSchemes.BAG_GIFT.requiredQuantity65ml,
        );
        let case1_130 = bottles130;
        const case1_bottles65 = Math.floor(case1_65 / giftSchemes.BOTTLE_GIFT_65.requiredQuantity);
        const case1_bottles130 = Math.floor(
          case1_130 / giftSchemes.BOTTLE_GIFT_130.requiredQuantity,
        );

        // Trường hợp 2: Dùng lốc 130ml cho túi
        let case2_65 = bottles65;
        let case2_130 = ensureNonNegative(
          bottles130 - selectedBags * giftSchemes.BAG_GIFT.requiredQuantity130ml,
        );
        const case2_bottles65 = Math.floor(case2_65 / giftSchemes.BOTTLE_GIFT_65.requiredQuantity);
        const case2_bottles130 = Math.floor(
          case2_130 / giftSchemes.BOTTLE_GIFT_130.requiredQuantity,
        );

        // Chọn trường hợp tốt nhất
        if (case1_bottles65 + case1_bottles130 >= case2_bottles65 + case2_bottles130) {
          availableGifts[giftSchemes.BOTTLE_GIFT_65.id] = case1_bottles65;
          availableGifts[giftSchemes.BOTTLE_GIFT_130.id] = case1_bottles130;
        } else {
          availableGifts[giftSchemes.BOTTLE_GIFT_65.id] = case2_bottles65;
          availableGifts[giftSchemes.BOTTLE_GIFT_130.id] = case2_bottles130;
        }
      }
    } else {
      // Nếu chưa chọn túi, cho phép đổi tất cả lốc thành chai
      availableGifts[giftSchemes.BOTTLE_GIFT_65.id] = Math.floor(
        bottles65 / giftSchemes.BOTTLE_GIFT_65.requiredQuantity,
      );
      availableGifts[giftSchemes.BOTTLE_GIFT_130.id] = Math.floor(
        bottles130 / giftSchemes.BOTTLE_GIFT_130.requiredQuantity,
      );
    }

    return availableGifts;
  };

  const availableGifts = calculateAvailableGifts();

  // Tự động điều chỉnh số quà đã chọn khi số quà có thể nhận được thay đổi
  useEffect(() => {
    setGifts((prevGifts) => {
      const newGifts = { ...prevGifts };
      let hasChanges = false;
      const adjustedGifts: string[] = [];

      Object.keys(availableGifts).forEach((giftId) => {
        const currentSelected = newGifts[giftId] || 0;
        const available = availableGifts[giftId as keyof typeof availableGifts] || 0;

        if (currentSelected > available) {
          newGifts[giftId] = available;
          hasChanges = true;
          adjustedGifts.push(giftId);
        }
      });

      // Thông báo cho người dùng nếu có quà bị điều chỉnh
      if (hasChanges && adjustedGifts.length > 0) {
        const giftNames = adjustedGifts
          .map((id) => {
            const scheme = Object.values(giftSchemes).find((s) => s.id === id);
            return scheme?.name || id;
          })
          .join(", ");

        notification.info({
          title: "Đã điều chỉnh số quà tặng",
          description: `Số quà "${giftNames}" đã được điều chỉnh do thay đổi số lượng sản phẩm`,
          options: {
            duration: 3000,
          },
        });
      }

      return hasChanges ? newGifts : prevGifts;
    });
  }, [availableGifts, notification]);

  // Tính tổng số quà đã chọn
  const totalSelectedGifts = Object.values(gifts).reduce((sum, qty) => sum + qty, 0);

  const adjustGift = (giftId: string, change: number) => {
    setGifts((prev) => {
      const current = prev[giftId] ?? 0;
      const next = current + change;

      if (next < 0) return prev;

      // Tạo lựa chọn mới
      const newGifts = { ...prev, [giftId]: next };

      // Tính toán lại số quà có thể nhận với lựa chọn mới
      const updatedAvailableGifts = calculateAvailableGifts(newGifts);

      // Kiểm tra xem lựa chọn mới có hợp lệ không
      const available = updatedAvailableGifts[giftId as keyof typeof updatedAvailableGifts] || 0;
      if (next > available) return prev;

      // Tự động điều chỉnh các quà khác nếu cần thiết
      const finalGifts = { ...newGifts };
      let hasAdjustment = false;
      const adjustedGifts: string[] = [];

      Object.keys(updatedAvailableGifts).forEach((id) => {
        if (id !== giftId) {
          const currentSelected = finalGifts[id] || 0;
          const newAvailable = updatedAvailableGifts[id as keyof typeof updatedAvailableGifts] || 0;
          if (currentSelected > newAvailable) {
            finalGifts[id] = newAvailable;
            hasAdjustment = true;
            adjustedGifts.push(id);
          }
        }
      });

      // Thông báo cho người dùng nếu có quà bị điều chỉnh
      if (hasAdjustment && adjustedGifts.length > 0) {
        const giftNames = adjustedGifts
          .map((id) => {
            const scheme = Object.values(giftSchemes).find((s) => s.id === id);
            return scheme?.name || id;
          })
          .join(", ");

        notification.info({
          title: "Đã điều chỉnh số quà tặng",
          description: `Số quà "${giftNames}" đã được điều chỉnh do ràng buộc với lựa chọn mới`,
          options: {
            duration: 3000,
          },
        });
      }

      return finalGifts;
    });
  };

  // Generate mã OTP 6 số
  const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Gửi mã OTP
  const handleSendOtp = async () => {
    if (!phone.match(/^(0[3|5|7|8|9])+([0-9]{8})$/)) {
      notification.error({
        title: "Số điện thoại không hợp lệ",
        description: "Vui lòng nhập số điện thoại hợp lệ",
        options: {
          duration: 3000,
        },
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const otp = generateOtp();
      setGeneratedOtp(otp);

      // Gọi API gửi OTP
      const response = await redeemReportApi.sendOtp({ phoneNumber: phone, otp: otp });
      if (response.status === HttpStatusCode.Ok) {
        setOtpSent(true);
        setOtpCountdown(15);
        notification.info({
          title: "Gửi OTP thành công",
          description: `Mã OTP đã được gửi đến số ${phone}`,
          options: {
            duration: 3000,
          },
        });
      } else {
        notification.error({
          title: "Không thể gửi mã OTP.",
          description: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại hoặc liên hệ IT",
          options: {
            duration: 3000,
          },
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      notification.error({
        title: "Có lỗi xảy ra khi gửi mã OTP.",
        description: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại hoặc liên hệ IT",
        options: {
          duration: 3000,
        },
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

   const onSubmit = async (formData: any) => {

    // Kiểm tra số điện thoại hợp lệ
    if (!phone.match(/^(0[3|5|7|8|9])+([0-9]{8})$/)) {
      notification.error({
        title: "Số điện thoại không hợp lệ",
        description: "Vui lòng nhập số điện thoại hợp lệ",
        options: {
          duration: 3000,
        },
      });
      return;
    }
    if (
      !isVerifiedCustomer &&
      (
        otp.length !== 6 ||
        (otp !== generatedOtp && otp !== DEFAULT_OTP)
      )
    ) {
      notification.info({
        title: "Lỗi OTP",
        description: "Mã OTP chưa được nhập hoặc không chính xác",
        options: {
          duration: 3000,
        },
      });
      return;
    }

     // Kiểm tra các trường bắt buộc
     if (!phone || !fullName || !imageFile) {
      notification.info({
        title: "Vui lòng điền đầy đủ thông tin và chụp ảnh hóa đơn",
        description: "Vui lòng điền đầy đủ thông tin và chụp ảnh hóa đơn",
        options: {
          duration: 3000,
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Thêm số 0 cho các sản phẩm không được nhập
      const allProducts = Object.fromEntries(
        Object.keys(productConfig).map((sku) => [sku, (productQuantities as any)[sku]?.pcs || 0]),
      );

      // Thêm số 0 cho các quà tặng không được chọn
      const allGifts = Object.fromEntries(
        Object.values(giftSchemes).map((scheme) => [scheme.id, gifts[scheme.id] || 0]),
      );

      // Submit dữ liệu qua API
      const response = await redeemReportApi.submitReport({
        customerPhone: phone,
        customerName: fullName,
        otpCode: otp,
        workShift: currentWorkshift?.id!,
        saleReportBy: currentAttendance?.staff?.account?.username || "",
        staffAttendanceId: currentAttendance?.id!,
        products: allProducts,
        gifts: allGifts,
        invoiceImage: imageFile,
      });

      if (response.status === HttpStatusCode.Ok) {
        notification.success({
          title: "Gửi thành công",
          description: "Thông tin khách hàng đã được ghi nhận.",
          options: {
            duration: 3000,
          },
        });

        // Reset form sau khi gửi thành công
        reset({
          items: Object.fromEntries(
            Object.keys(productConfig).map((sku) => [
              sku,
              { pcs: "" }
            ])
          )
        });
        setPhone("");
        setOtp("");
        setOtpSent(false);
        setOtpCountdown(0);
        setGeneratedOtp("");
        setFullName("");
        setImageFile(undefined);
        setGifts({});
        setFormKey((prev) => prev + 1);
      } else {
        notification.error({
          title: "Lỗi khi gửi",
          description: response.message,
          options: {
            duration: 3000,
          },
        });
      }
    } catch (err: any) {
      console.error("Error submitting report:", err);
      notification.error({
        title: "Lỗi khi gửi",
        description: err.message || "Có lỗi xảy ra",
        options: {
          duration: 3000,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

  useEffect(() => {
    const checkCustomer = async () => {
      // Reset states khi số điện thoại thay đổi
      if (phone.length !== 10) {
        setFullName("");
        setIsVerifiedCustomer(false);
        return;
      }

      // Kiểm tra số điện thoại hợp lệ
      if (!phone.match(/^(0[3|5|7|8|9])+([0-9]{8})$/)) {
        setFullName("");
        setIsVerifiedCustomer(false);
        return;
      }

      try {
        const response = await findCustomerMutation.mutateAsync(phone);
        
        if (response.status === HttpStatusCode.Ok && response.data.isVerified) {
          // Khách hàng đã xác thực
          setFullName(response.data.name);
          setIsVerifiedCustomer(true);
        } else {
          // Khách hàng chưa xác thực
          setFullName("");
          setIsVerifiedCustomer(false);
        }
      } catch (error) {
        // Xử lý lỗi
        setFullName("");
        setIsVerifiedCustomer(false);
        console.error("Error checking customer:", error);
      }
    };

    checkCustomer();
  }, [phone]);

  return (
    <>
      <LoadingOverlay active={isSubmitting} />

      <ScreenHeader title="Báo cáo bán hàng đổi quà" onBack={() => router.back()} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <div className="mb-32">
          <div className="flex-1 overflow-auto p-4">
            {/* General Information */}
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                Thông tin khách hàng và hóa đơn
              </h3>
              <div className="space-y-4 bg-white p-5">
                <div className="space-y-2">
                  <TextInput
                    label="Số điện thoại"
                    placeholder="VD: 0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {!isVerifiedCustomer &&
                    (!otpSent ? (
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? "Đang gửi..." : "Gửi mã OTP"}
                      </Button>
                    ) : (
                      <>
                        <TextInput
                          label="Mã OTP"
                          placeholder="VD: 123456"
                          className="w-full rounded border p-2"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          type="number"
                        />
                        {otpCountdown > 0 ? (
                          <p className="text-sm text-gray-500">Gửi lại sau {otpCountdown}s</p>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                          >
                            {isSendingOtp ? "Đang gửi..." : "Gửi lại mã OTP"}
                          </Button>
                        )}
                      </>
                    ))}
                </div>

                <TextInput
                  label="Họ tên khách hàng"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                  }}
                />

                <ImageCaptureInput
                  key={formKey}
                  label="Hình khách mua hàng"
                  helperText="Chụp ảnh khách mua hàng"
                  value={imageFile}
                  onChange={(v) => setImageFile(v ?? undefined)}
                />
              </div>
            </div>

            {/* Purchase Products */}
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                Sản phẩm đã mua{" "}
                <span className="text-sm font-normal text-primary-50">
                  (65ml: {quantitiesBySize[65]} lốc, 130ml: {quantitiesBySize[130]} lốc)
                </span>
              </h3>
              <ReportProductInputGroup
                items={productItems}
                register={register}
                formValues={formValues}
                errors={errors}
              />
            </div>

            {/* Gift Options */}
            <div
              className={StyleUtil.cn("mb-6", {
                "opacity-50": !Object.values(availableGifts).some((qty) => qty > 0),
              })}
            >
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                Chọn quà tặng{" "}
                <span className="text-sm font-normal text-primary-50">
                  (Tổng điểm: {calculatePoints(quantitiesBySize)} | Đã chọn: {totalSelectedGifts}{" "}
                  quà)
                </span>
              </h3>
              <div className="divide-y divide-gray-200 bg-white">
                {Object.values(giftSchemes).map((scheme) => {
                  const qty = gifts[scheme.id] || 0;
                  const available =
                    calculateAvailableGifts(gifts)[scheme.id as keyof typeof availableGifts] || 0;

                  // Hiển thị yêu cầu điểm

                  return (
                    <div key={scheme.id} className="grid grid-cols-3 items-center gap-4 p-4">
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
                        <p className="text-xs text-blue-600">Có thể nhận tối đa: {available} quà</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                          size="large"
                          variant="tertiary"
                          icon={Icons.Subtract}
                          onClick={() => adjustGift(scheme.id, -1)}
                          disabled={qty === 0}
                        />
                        <input
                          className="w-16 rounded border py-2 text-center"
                          value={qty}
                          readOnly
                        />
                        <IconButton
                          size="large"
                          variant="tertiary"
                          icon={Icons.Add}
                          onClick={() => adjustGift(scheme.id, 1)}
                          disabled={qty >= available}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button type="submit" variant="primary" className="w-full" centered>
            Lưu báo cáo
          </Button>
        </div>
      </form>
    </>
  );
};
