/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HuiPeriodType = 'day' | 'week' | 'ten_days' | 'half_month' | 'month';

export const HUI_PERIOD_LABELS: Record<HuiPeriodType, string> = {
  day: 'Hụi Ngày',
  week: 'Hụi Tuần',
  ten_days: 'Hụi mười ngày (10 ngày/lần)',
  half_month: 'Hụi nửa tháng (15 ngày/lần)',
  month: 'Hụi Tháng'
};

export interface HuiMember {
  id: string;
  name: string;
  phone: string;
  address: string;
  reputation: number; // 0 - 100 points
  riskStatus: 'trusted' | 'risk_medium' | 'risk_high';
  createdAt: string;
  notes?: string;
  role: 'admin' | 'chuhui' | 'huivien';
}

export interface HuiPart {
  id: string;
  lineId: string;
  memberId: string;
  memberName: string;
  alias: string; // e.g. "Chị Sáu (Phần 1)"
  isWithdrawn: boolean;
  withdrawnPeriod: number | null;
  bidAmount: number | null; // Tiền bỏ hụi đã thắng đấu
  withdrawnDate: string | null;
  totalPaid: number;       // Tổng tiền đã đóng tính đến nay
  totalReceived: number;   // Tiền thực nhận khi đã hốt hụi
}

export interface HuiLine {
  id: string;
  name: string;
  value: number; // Tiền đầu hụi, e.g. 2,000,000 đ
  periodType: HuiPeriodType;
  startDate: string;
  commission: number; // Tiền thảo / hoa hồng đầu thảo cho chủ hụi khi hốt (e.g. 50% tiền đầu hụi)
  totalPeriods: number; // Tổng số kỳ khui hụi = Tổng số phần hụi trong dây
  currentPeriod: number; // Kỳ khui hụi hiện tại (bắt đầu từ 1)
  status: 'active' | 'completed' | 'draft';
  parts: HuiPart[]; // Danh sách các phần hụi của dây này
  createdAt: string;
}

export interface HuiPayment {
  id: string;
  lineId: string;
  lineName: string;
  period: number;
  partId: string;
  memberId: string;
  memberName: string;
  alias: string;
  amountToPay: number; // Số tiền phải đóng
  payType: 'song' | 'chet'; // Hụi sống (đóng bớt) hay Hụi chết (đóng đủ đầu hụi)
  status: 'paid' | 'pending' | 'overdue';
  paidAt: string | null;
}

export interface HuiPeriodResult {
  id: string;
  lineId: string;
  lineName: string;
  period: number;
  date: string;
  winnerPartId: string;
  winnerMemberId: string;
  winnerName: string;
  winnerAlias: string;
  bidAmount: number; // Tiền bỏ hụi kỳ này để giật/hốt hụi
  totalCommission: number; // Tiền thảo thu của kỳ hốt này
  totalWithdrawnCash: number; // Thực thấu / thực nhận của hụi viên khi hốt kỳ này
  status: 'bidded' | 'draft';
  payments: HuiPayment[]; // Danh sách đóng tiền hụi viên khác gửi cho kỳ này
}

export interface HuiTransaction {
  id: string;
  type: 'collect' | 'disburse' | 'commission' | 'expense';
  amount: number;
  date: string;
  description: string;
  lineId?: string;
  lineName?: string;
  period?: number;
  memberId?: string;
  memberName?: string;
  partId?: string;
}

export interface HuiLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  operator: string;
}

export interface AIRiskAnalysis {
  lineId: string;
  safetyScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  recommendations: string[];
  summary: string;
  analyzedAt: string;
}
