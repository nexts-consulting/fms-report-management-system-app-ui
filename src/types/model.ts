export enum EUserAccountRole {
  SALE = "SALE",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  SUPERVISOR = "SUPERVISOR",
}

export interface IUserAccount {
  id: number;
  username: string;
  role: EUserAccountRole;
  createdAt: string;
}

export interface IStaffProfile {
  account: IUserAccount;
  id: number;
  staffCode: string;
  fullName: string;
  profileImage: string;
  trainingDate: string;
  startDate: string;
  passProbationDate: string;
  updatedAt: string;
}

export interface ISaleProfile {
  id: number;
  fullName: string;
  role: string; // TODO: enum
  account: IUserAccount;
}

export interface IProvince {
  id: number;
  name: string;
}

export interface IOutlet {
  id: number;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  checkinRadiusMeters: number;
  createdAt: string;
  updatedAt: string;
  province: IProvince;
  saleRep: ISaleProfile;
  saleSupervisor: ISaleProfile;
  keyAccountManager: ISaleProfile;
}

export interface IWorkingShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  outlet: IOutlet;
}

export interface ISaleReport {
  id: number;
  data: {
    sku: string;
    pcs: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IOOSReport {
  id: number;
  data: {
    sku: string;
    pcs: number;
  }[];
  reportType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISamplingReport {
  id: number;
  data: {
    sku: string;
    pcs: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IActivityReport {
  id: number;
  data: {
    fileId: string;
    fileName: string;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IStaffLeave {
  id: number;
  leaveType: string;
  note: string;
  startTime: string;
  endTime: string;
}

export interface IStaffAttendance {
  id: number;
  staff: IStaffProfile;
  shift: IWorkingShift;
  checkinTime: string;
  checkoutTime: string | null;
  checkinImage: string;
  checkoutImage: string | null;
  checkinLocation: {
    lat: number;
    lng: number;
    acc: number;
  };
  checkoutLocation: {
    lat: number;
    lng: number;
    acc: number;
  } | null;
  saleReport: ISaleReport | null;
  oosReport: IOOSReport | null;
  stockInReport: IOOSReport | null;
  stockOutReport: IOOSReport | null;
  samplingReport: ISamplingReport | null;
  activityReport: IActivityReport | null;
  staffLeaves: IStaffLeave[];
}

export interface IReportItem {
  id: number;
  name: string;
  skuCode: string;
  skuName: string;
  unit: number;
  description: string;
  category: string;
  brand: string;
  reportTypes: string[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ReportMenuItem {
  label: string;
  icon: React.ElementType;
  actionType: "route" | "modal";
  actionValue?: string;
  required: boolean;
  key: string;
  role?: EUserAccountRole;
}
