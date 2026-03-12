"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/kits/components/button";
import { ImageCaptureInputWithUpload } from "@/kits/components/image-capture-input-upload";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useNotification } from "@/kits/components/notification";
import { SelectModal } from "@/kits/components/select-modal";
import { TextArea } from "@/kits/components/text-area";
import { TextInput } from "@/kits/components/text-input";
import { StyleUtil } from "@/kits/utils";
import {
  httpRequestGetUserProfileByKeycloakId,
  httpRequestUpsertUserProfile,
} from "@/services/api/application/master-data/user-profiles";
import { httpRequestMarkKeycloakProfileUpdated } from "@/services/api/application/management/keycloak/users";
import profileOptionsData from "@/data/profile-options.json";
import { IUserProfile } from "@/types/model";
import { useRouter } from "next/navigation";
import React from "react";

const LOCAL_STORAGE_PROFILE_KEY = "user-profile";

type UserProfileFormState = {
  keycloak_user_id: string;
  keycloak_username: string;
  employee_code: string;
  fullname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  email: string;
  national_id: string;
  national_id_issue_date: string;
  national_id_issue_place: string;
  payment_account_number: string;
  payment_account_name: string;
  payment_account_bank: string;
  payment_account_branch: string;
  address_line: string;
  ward: string;
  province: string;
  country: string;
  portrait_image_url: string;
  national_id_front_url: string;
  national_id_back_url: string;
  hire_date: string;
  contract_start_date: string;
  contract_end_date: string;
  position: string;
  department: string;
  is_active: boolean;
};

type DropdownOption = {
  label: string;
  value: string;
};

type ValidationErrors = Partial<Record<keyof UserProfileFormState, string>>;

const styles = {
  container: StyleUtil.cn("min-h-screen bg-gray-10"),
  content: StyleUtil.cn("space-y-4 px-4 pb-28 pt-6"),
  card: StyleUtil.cn("bg-white p-4 outline outline-1 -outline-offset-1 outline-gray-30"),
  sectionTitle: StyleUtil.cn("mb-3 text-sm font-medium text-gray-100"),
  fieldGrid: StyleUtil.cn("grid grid-cols-1 gap-3 md:grid-cols-2"),
  footer: StyleUtil.cn(
    "fixed bottom-0 left-0 right-0 z-20 border-t border-t-gray-20 bg-white px-4 py-3",
  ),
  footerInner: StyleUtil.cn("mx-auto w-full max-w-4xl"),
};

const toInputValue = (value?: string | null): string => value || "";
const findSelectedOption = (options: DropdownOption[], value: string): DropdownOption | null =>
  options.find((item) => item.value === value) ?? null;

const REQUIRED_FIELD_LABELS: Partial<Record<keyof UserProfileFormState, string>> = {
  fullname: "Họ và tên",
  gender: "Giới tính",
  date_of_birth: "Ngày sinh",
  phone: "Số điện thoại",
  national_id: "Số CCCD/CMND",
  national_id_issue_date: "Ngày cấp",
  national_id_issue_place: "Nơi cấp",
  payment_account_number: "Số tài khoản",
  payment_account_name: "Tên chủ tài khoản",
  payment_account_bank: "Ngân hàng",
  payment_account_branch: "Chi nhánh",
  address_line: "Địa chỉ chi tiết",
  ward: "Phường/Xã",
  province: "Tỉnh/Thành phố",
};

const validateRequiredFields = (form: UserProfileFormState): ValidationErrors => {
  const nextErrors: ValidationErrors = {};

  (Object.keys(REQUIRED_FIELD_LABELS) as (keyof UserProfileFormState)[]).forEach((field) => {
    const value = form[field];
    if (typeof value === "string" && !value.trim()) {
      nextErrors[field] = `${REQUIRED_FIELD_LABELS[field]} là thông tin bắt buộc`;
    }
  });

  return nextErrors;
};

const mapProfileToForm = (profile: IUserProfile): UserProfileFormState => ({
  keycloak_user_id: toInputValue(profile.keycloak_user_id),
  keycloak_username: toInputValue(profile.keycloak_username),
  employee_code: toInputValue(profile.employee_code),
  fullname: toInputValue(profile.fullname),
  gender: toInputValue(profile.gender),
  date_of_birth: toInputValue(profile.date_of_birth),
  phone: toInputValue(profile.phone),
  email: toInputValue(profile.email),
  national_id: toInputValue(profile.national_id),
  national_id_issue_date: toInputValue(profile.national_id_issue_date),
  national_id_issue_place: toInputValue(profile.national_id_issue_place),
  payment_account_number: toInputValue(profile.payment_account_number),
  payment_account_name: toInputValue(profile.payment_account_name),
  payment_account_bank: toInputValue(profile.payment_account_bank),
  payment_account_branch: toInputValue(profile.payment_account_branch),
  address_line: toInputValue(profile.address_line),
  ward: toInputValue(profile.ward),
  province: toInputValue(profile.province),
  country: toInputValue(profile.country) || "Việt Nam",
  portrait_image_url: toInputValue(profile.portrait_image_url),
  national_id_front_url: toInputValue(profile.national_id_front_url),
  national_id_back_url: toInputValue(profile.national_id_back_url),
  hire_date: toInputValue(profile.hire_date),
  contract_start_date: toInputValue(profile.contract_start_date),
  contract_end_date: toInputValue(profile.contract_end_date),
  position: toInputValue(profile.position),
  department: toInputValue(profile.department),
  is_active: profile.is_active ?? true,
});

const createInitialForm = (
  user?: {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null,
): UserProfileFormState => ({
  keycloak_user_id: user?.id || "",
  keycloak_username: user?.username || "",
  employee_code: "",
  fullname: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
  gender: "",
  date_of_birth: "",
  phone: "",
  email: "",
  national_id: "",
  national_id_issue_date: "",
  national_id_issue_place: "",
  payment_account_number: "",
  payment_account_name: "",
  payment_account_bank: "",
  payment_account_branch: "",
  address_line: "",
  ward: "",
  province: "",
  country: "Vietnam",
  portrait_image_url: "",
  national_id_front_url: "",
  national_id_back_url: "",
  hire_date: "",
  contract_start_date: "",
  contract_end_date: "",
  position: "",
  department: "",
  is_active: true,
});

export default function ProfilePage() {
  const router = useRouter();
  const notification = useNotification();
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const notificationRef = React.useRef(notification);

  const [form, setForm] = React.useState<UserProfileFormState>(createInitialForm(user));
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isExistingProfile, setIsExistingProfile] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});
  const genders = React.useMemo(() => profileOptionsData.genders as DropdownOption[], []);
  const banks = React.useMemo(() => profileOptionsData.banks as DropdownOption[], []);
  const nationalIdIssuePlaces = React.useMemo(
    () => profileOptionsData.nationalIdIssuePlaces as DropdownOption[],
    [],
  );
  const provinces = React.useMemo(() => profileOptionsData.provinces as DropdownOption[], []);

  const setField = React.useCallback(
    (field: keyof UserProfileFormState, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setValidationErrors((prev) => {
        if (!prev[field]) return prev;
        const nextErrors = { ...prev };
        delete nextErrors[field];
        return nextErrors;
      });
    },
    [],
  );

  React.useEffect(() => {
    if (!user) {
      setIsInitialLoading(false);
      return;
    }

    setForm((prev) => ({
      ...prev,
      keycloak_user_id: prev.keycloak_user_id || user.id || "",
      keycloak_username: prev.keycloak_username || user.username || "",
      email: prev.email || user.email || "",
      fullname: prev.fullname || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    }));
  }, [user]);

  React.useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);

      try {
        const cachedProfileRaw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        if (cachedProfileRaw) {
          const cachedProfile = JSON.parse(cachedProfileRaw) as IUserProfile;
          if (cachedProfile?.keycloak_user_id === user.id) {
            setForm(mapProfileToForm(cachedProfile));
            setIsExistingProfile(true);
            authStore.setState({ userProfile: cachedProfile });
          }
        }

        const profile = await httpRequestGetUserProfileByKeycloakId(user.id);

        if (profile) {
          setForm(mapProfileToForm(profile));
          setValidationErrors({});
          setIsExistingProfile(true);
          authStore.setState({ userProfile: profile });
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
        } else {
          setIsExistingProfile(false);
          authStore.setState({ userProfile: null });
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
          setForm(createInitialForm(user));
          setValidationErrors({});
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        notificationRef.current.error({
          title: "Không tải được hồ sơ",
          description: "Vui lòng kiểm tra kết nối và thử lại.",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!form.keycloak_user_id || !form.keycloak_username) {
      notification.error({
        title: "Thiếu thông tin đăng nhập",
        description: "Không xác định được tài khoản Keycloak hiện tại.",
      });
      return;
    }

    const nextErrors = validateRequiredFields(form);
    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      notification.error({
        title: "Thiếu thông tin bắt buộc",
        description: "Vui lòng nhập đầy đủ các trường bắt buộc.",
      });
      return;
    }

    setIsSaving(true);
    try {
      let isKeycloakAttrUpdated = true;
      const savedProfile = await httpRequestUpsertUserProfile({
        keycloak_user_id: form.keycloak_user_id,
        keycloak_username: form.keycloak_username,
        employee_code: form.employee_code,
        fullname: form.fullname,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        phone: form.phone,
        email: form.email,
        national_id: form.national_id,
        national_id_issue_date: form.national_id_issue_date,
        national_id_issue_place: form.national_id_issue_place,
        payment_account_number: form.payment_account_number,
        payment_account_name: form.payment_account_name,
        payment_account_bank: form.payment_account_bank,
        payment_account_branch: form.payment_account_branch,
        address_line: form.address_line,
        ward: form.ward,
        province: form.province,
        country: form.country,
        portrait_image_url: form.portrait_image_url,
        national_id_front_url: form.national_id_front_url,
        national_id_back_url: form.national_id_back_url,
        hire_date: form.hire_date,
        contract_start_date: form.contract_start_date,
        contract_end_date: form.contract_end_date,
        position: form.position,
        department: form.department,
        is_active: form.is_active,
      });

      try {
        await httpRequestMarkKeycloakProfileUpdated(form.keycloak_user_id, true);
      } catch (error) {
        isKeycloakAttrUpdated = false;
        console.error("Failed to update Keycloak profile-updated attribute:", error);
      }

      setForm(mapProfileToForm(savedProfile));
      setValidationErrors({});
      setIsExistingProfile(true);
      authStore.setState({ userProfile: savedProfile });
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(savedProfile));

      notification.success({
        title: "Lưu hồ sơ thành công",
        description: isExistingProfile ? "Hồ sơ đã được cập nhật." : "Hồ sơ đã được tạo mới.",
      });

      if (!isKeycloakAttrUpdated) {
        notification.warning({
          title: "Đã lưu hồ sơ nhưng chưa đồng bộ Keycloak",
          description: "Vui lòng thử lại hoặc liên hệ quản trị viên để kiểm tra quyền cập nhật user.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu hồ sơ.";
      notification.error({
        title: "Lưu hồ sơ thất bại",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay active={isInitialLoading || isSaving} />
      <ScreenHeader title="Thông tin cá nhân" onBack={() => router.back()} />

      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Thông tin đồng bộ Keycloak</h2>
          <div className={styles.fieldGrid}>
            <TextInput
              label="Keycloak User ID"
              value={form.keycloak_user_id}
              disabled
              placeholder="Được đồng bộ từ đăng nhập"
            />
            <TextInput
              label="Keycloak Username"
              value={form.keycloak_username}
              disabled
              placeholder="Được đồng bộ từ đăng nhập"
            />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>
          <div className={styles.fieldGrid}>
            {/* <TextInput
              label="Mã nhân sự"
              value={form.employee_code}
              onChange={(e) => setField("employee_code", e.target.value)}
              placeholder="VD: NV-001"
            /> */}
            <TextInput
              required={true}
              label="Họ và tên *"
              value={form.fullname}
              onChange={(e) => setField("fullname", e.target.value)}
              placeholder="Nhập họ và tên"
              error={!!validationErrors.fullname}
              helperText={validationErrors.fullname}
            />
            <SelectModal
              label="Giới tính *"
              options={genders}
              selectedOption={findSelectedOption(genders, form.gender)}
              onSelect={(option) => setField("gender", (option?.value as string) || "")}
              placeholder="Chọn giới tính"
              error={!!validationErrors.gender}
              helperText={validationErrors.gender}
            />
            <TextInput
              required={true}
              type="date"
              label="Ngày sinh *"
              value={form.date_of_birth}
              onChange={(e) => setField("date_of_birth", e.target.value)}
              error={!!validationErrors.date_of_birth}
              helperText={validationErrors.date_of_birth}
            />
            <TextInput
              required={true}
              label="Số điện thoại *"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Nhập số điện thoại"
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Nhập email"
            />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Giấy tờ định danh</h2>
          <div className={styles.fieldGrid}>
            <TextInput
              required={true}
              label="Số CCCD/CMND *"
              value={form.national_id}
              onChange={(e) => setField("national_id", e.target.value)}
              placeholder="Nhập số giấy tờ"
              error={!!validationErrors.national_id}
              helperText={validationErrors.national_id}
            />
            <TextInput
              required={true}
              type="date"
              label="Ngày cấp *"
              value={form.national_id_issue_date}
              onChange={(e) => setField("national_id_issue_date", e.target.value)}
              error={!!validationErrors.national_id_issue_date}
              helperText={validationErrors.national_id_issue_date}
            />
          </div>
          <div className="mt-3">
            <SelectModal
              label="Nơi cấp *"
              options={nationalIdIssuePlaces}
              selectedOption={findSelectedOption(nationalIdIssuePlaces, form.national_id_issue_place)}
              onSelect={(option) => setField("national_id_issue_place", (option?.value as string) || "")}
              placeholder="Chọn nơi cấp CCCD"
              searchPlaceholder="Tìm nơi cấp CCCD"
              error={!!validationErrors.national_id_issue_place}
              helperText={validationErrors.national_id_issue_place}
            />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Thông tin thanh toán</h2>
          <div className={styles.fieldGrid}>
            <TextInput
              required={true}
              label="Số tài khoản *"
              value={form.payment_account_number}
              onChange={(e) => setField("payment_account_number", e.target.value)}
              placeholder="Nhập số tài khoản"
              error={!!validationErrors.payment_account_number}
              helperText={validationErrors.payment_account_number}
            />
            <TextInput
              required={true}
              label="Tên chủ tài khoản *"
              value={form.payment_account_name}
              onChange={(e) => setField("payment_account_name", e.target.value)}
              placeholder="Nhập tên chủ tài khoản"
              error={!!validationErrors.payment_account_name}
              helperText={validationErrors.payment_account_name}
            />
            <SelectModal
              label="Ngân hàng *"
              options={banks}
              selectedOption={findSelectedOption(banks, form.payment_account_bank)}
              onSelect={(option) => setField("payment_account_bank", (option?.value as string) || "")}
              placeholder="Chọn ngân hàng"
              searchPlaceholder="Tìm ngân hàng"
              error={!!validationErrors.payment_account_bank}
              helperText={validationErrors.payment_account_bank}
            />
            <TextInput
              required={true}
              label="Chi nhánh *"
              value={form.payment_account_branch}
              onChange={(e) => setField("payment_account_branch", e.target.value)}
              placeholder="Nhập chi nhánh"
              error={!!validationErrors.payment_account_branch}
              helperText={validationErrors.payment_account_branch}
            />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Địa chỉ</h2>
          <div className="mb-3">
            <TextArea
              required={true}
              label="Địa chỉ chi tiết *"
              value={form.address_line}
              onChange={(e) => setField("address_line", e.target.value)}
              placeholder="Số nhà, đường..."
              error={!!validationErrors.address_line}
              helperText={validationErrors.address_line}
            />
          </div>
          <div className={styles.fieldGrid}>
            <TextInput
              required={true}
              label="Phường/Xã *"
              value={form.ward}
              onChange={(e) => setField("ward", e.target.value)}
              placeholder="Nhập phường/xã"
              error={!!validationErrors.ward}
              helperText={validationErrors.ward}
            />
            <SelectModal
              label="Tỉnh/Thành phố *"
              options={provinces}
              selectedOption={findSelectedOption(provinces, form.province)}
              onSelect={(option) => setField("province", (option?.value as string) || "")}
              placeholder="Chọn tỉnh/thành phố"
              searchPlaceholder="Tìm tỉnh/thành phố"
              error={!!validationErrors.province}
              helperText={validationErrors.province}
            />
            <TextInput
              label="Quốc gia"
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
              placeholder="Vietnam"
            />
          </div>
        </div>

        {/* <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Thông tin công việc</h2>
          <div className={styles.fieldGrid}>
            <TextInput
              type="date"
              label="Ngày vào làm"
              value={form.hire_date}
              onChange={(e) => setField("hire_date", e.target.value)}
            />
            <TextInput
              type="date"
              label="Ngày bắt đầu hợp đồng"
              value={form.contract_start_date}
              onChange={(e) => setField("contract_start_date", e.target.value)}
            />
            <TextInput
              type="date"
              label="Ngày kết thúc hợp đồng"
              value={form.contract_end_date}
              onChange={(e) => setField("contract_end_date", e.target.value)}
            />
            <TextInput
              label="Vị trí"
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
              placeholder="VD: Nhân viên hiện trường"
            />
            <TextInput
              label="Phòng ban"
              value={form.department}
              onChange={(e) => setField("department", e.target.value)}
              placeholder="VD: Vận hành"
            />
          </div>
        </div> */}

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Ảnh hồ sơ (Firebase Storage)</h2>
          <div className={styles.fieldGrid}>
            <ImageCaptureInputWithUpload
              label="Ảnh chân dung"
              helperText="Chụp ảnh chân dung"
              value={form.portrait_image_url}
              onChange={(url) => setField("portrait_image_url", url || "")}
              cloudConfig={{
                provider: "firebase",
                path: `user-profiles/${form.keycloak_user_id}/portrait`,
              }}
              enableUpload
            />
            <ImageCaptureInputWithUpload
              label="Ảnh CCCD mặt trước"
              helperText="Chụp CCCD mặt trước"
              value={form.national_id_front_url}
              onChange={(url) => setField("national_id_front_url", url || "")}
              cloudConfig={{
                provider: "firebase",
                path: `user-profiles/${form.keycloak_user_id}/national-id-front`,
              }}
              enableUpload
            />
            <ImageCaptureInputWithUpload
              label="Ảnh CCCD mặt sau"
              helperText="Chụp CCCD mặt sau"
              value={form.national_id_back_url}
              onChange={(url) => setField("national_id_back_url", url || "")}
              cloudConfig={{
                provider: "firebase",
                path: `user-profiles/${form.keycloak_user_id}/national-id-back`,
              }}
              enableUpload
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <Button
            variant="primary"
            size="medium"
            centered
            className="w-full"
            onClick={handleSubmit}
            loading={isSaving}
            disabled={isInitialLoading || isSaving}
          >
            {isExistingProfile ? "Cập nhật hồ sơ" : "Tạo hồ sơ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
