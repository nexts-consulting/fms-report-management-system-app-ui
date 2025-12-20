import { Icons } from "@/kits/components/Icons";
import { ReportMenuItem } from "@/types/model";
import {
  Running,
  Box,
  StoragePool,
  ReportData,
  Gift,
  Image,
  RecentlyViewed,
  Information,
  ShoppingCart,
  Customer,
} from "@carbon/icons-react";

export const reportMenuItems: ReportMenuItem[] = [
  {
    label: "Báo cáo tồn đầu ca",
    icon: Box,
    actionType: "route",
    actionValue: "/attendance/report/stock-in",
    required: true,
    key: "isReportedStockIn",
  },
  {
    label: "Báo cáo Sampling",
    icon: StoragePool,
    actionType: "route",
    actionValue: "/attendance/report/sampling",
    required: true,
    key: "isReportedSampling",
  },
  {
    label: "Báo cáo tồn cuối ca",
    icon: ReportData,
    actionType: "route",
    actionValue: "/attendance/report/stock-out",
    required: true,
    key: "isReportedStockOut",
  },
  {
    label: "Báo cáo hoạt động",
    icon: Image,
    actionType: "route",
    actionValue: "/attendance/report/activity",
    required: false,
    key: "isReportedActivity",
  },
  
  {
    label: "Bán hàng tặng quà",
    icon: ShoppingCart,
    actionType: "route",
    actionValue: "/attendance/report/redeem",
    required: false,
    key: "isReportedRedeem",
  },
  {
    label: "Khảo sát",
    icon: Customer,
    actionType: "route",
    actionValue: "/attendance/report/survey",
    required: false,
    key: "isReportedSurvey",
  },
  {
    label: "Lịch sử khách hàng",
    icon: RecentlyViewed,
    actionType: "route",
    actionValue: "/attendance/report/customer",
    required: false,
    key: "isReportedRedeemHistory",
  },
  {
    label: "Tặng quà",
    icon: Gift,
    actionType: "route",
    actionValue: "/attendance/report/gift",
    required: false,
    key: "isReportedGift",
  },
];
