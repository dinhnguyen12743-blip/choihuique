/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  HuiMember, 
  HuiLine, 
  HuiPart, 
  HuiPayment, 
  HuiPeriodResult, 
  HuiTransaction, 
  HuiLog,
  AIRiskAnalysis 
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to JSON persistent database
const DB_FILE = path.join(process.cwd(), "huipro_db.json");

// Helper: Seed Data Generator (representing authentic Southern Vietnam cultural context)
const getInitialSeedData = () => {
  const members: HuiMember[] = [
    {
      id: "M001",
      name: "Chị Sáu Trà Ôn",
      phone: "0917654321",
      address: "Huyện Trà Ôn, Vĩnh Long",
      reputation: 95,
      riskStatus: "trusted",
      createdAt: "2026-01-10T08:30:00Z",
      notes: "Hụi viên kỳ cựu chuyên đi hụi lớn, đóng hụi chết nhanh gọn.",
      role: "huivien"
    },
    {
      id: "M002",
      name: "Cô Bảy Cai Lậy",
      phone: "0982334455",
      address: "Thị xã Cai Lậy, Tiền Giang",
      reputation: 88,
      riskStatus: "trusted",
      createdAt: "2026-01-12T09:15:00Z",
      notes: "Nhà vườn sầu riêng lớn, uy tín tốt.",
      role: "huivien"
    },
    {
      id: "M003",
      name: "Chú Năm Vĩnh Long",
      phone: "0909123456",
      address: "Phường 4, TP. Vĩnh Long",
      reputation: 92,
      riskStatus: "trusted",
      createdAt: "2026-01-15T14:20:00Z",
      notes: "Chạy xe tải giao cơm dừa, thanh toán sòng phẳng.",
      role: "huivien"
    },
    {
      id: "M004",
      name: "Anh Mười Cao Lãnh",
      phone: "0888999888",
      address: "TP. Cao Lãnh, Đồng Tháp",
      reputation: 72,
      riskStatus: "risk_medium",
      createdAt: "2026-01-18T10:00:00Z",
      notes: "Mới vào hốt sớm dây trước, đóng hụi chết thỉnh thoảng trễ vài ngày.",
      role: "huivien"
    },
    {
      id: "M005",
      name: "Dì Út Trà Cú",
      phone: "0944112233",
      address: "Huyện Trà Cú, Trà Vinh",
      reputation: 42,
      riskStatus: "risk_high",
      createdAt: "2026-01-20T16:45:00Z",
      notes: "Điểm tín dụng thấp do kẹt tiền nuôi tôm sú, bỏ giá cao để tranh hốt sớm.",
      role: "huivien"
    },
    {
      id: "M006",
      name: "Thím Ba Mỹ Tho",
      phone: "0939556677",
      address: "Chợ Mỹ Tho, Tiền Giang",
      reputation: 90,
      riskStatus: "trusted",
      createdAt: "2026-01-22T11:30:00Z",
      notes: "Mối hụi tin cậy, bán tạp hóa lớn.",
      role: "huivien"
    },
    {
      id: "M007",
      name: "Chủ Hụi Út Hương",
      phone: "0911222333",
      address: "Đông Bình, Bình Minh, Vĩnh Long",
      reputation: 100,
      riskStatus: "trusted",
      createdAt: "2026-01-01T07:00:00Z",
      notes: "Chủ hụi uy tín nhất vùng sông nước miền Tây, đứng dây hụi 10 năm chưa vỡ lần nào.",
      role: "chuhui"
    }
  ];

  // Let's seed lines: Standard 2M Month Line
  const partsLine1: HuiPart[] = [
    { id: "P1_1", lineId: "L001", memberId: "M006", memberName: "Thím Ba Mỹ Tho", alias: "Thím Ba Mỹ Tho (Phần 1)", isWithdrawn: true, withdrawnPeriod: 1, bidAmount: 400000, withdrawnDate: "2026-02-15", totalPaid: 6400000, totalReceived: 14600000 },
    { id: "P1_2", lineId: "L001", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười Cao Lãnh (Phần 1)", isWithdrawn: true, withdrawnPeriod: 2, bidAmount: 500000, withdrawnDate: "2026-03-15", totalPaid: 6500000, totalReceived: 14700000 },
    { id: "P1_3", lineId: "L001", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 1)", isWithdrawn: true, withdrawnPeriod: 3, bidAmount: 300000, withdrawnDate: "2026-04-15", totalPaid: 6100000, totalReceived: 15300000 },
    { id: "P1_4", lineId: "L001", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_5", lineId: "L001", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_6", lineId: "L001", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út Trà Cú (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_7", lineId: "L001", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 2)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_8", lineId: "L001", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 2)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_9", lineId: "L001", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 2)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 },
    { id: "P1_10", lineId: "L001", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Chót Dây)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 4800000, totalReceived: 0 }
  ];

  const lines: HuiLine[] = [
    {
      id: "L001",
      name: "Hụi Tháng Lộc Điền 2 Triệu",
      value: 2000000,
      periodType: "month",
      startDate: "2026-02-15",
      commission: 1000000, // Tiền thảo đầu thảo 50%
      totalPeriods: 10,
      currentPeriod: 4,
      status: "active",
      parts: partsLine1,
      createdAt: "2026-01-25T10:00:00Z"
    },
    {
      id: "L002",
      name: "Hụi Tuần Chợ Vĩnh Long 500k",
      value: 500000,
      periodType: "week",
      startDate: "2026-06-01",
      commission: 250000,
      totalPeriods: 6,
      currentPeriod: 1,
      status: "active",
      parts: [
        { id: "P2_1", lineId: "L002", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 },
        { id: "P2_2", lineId: "L002", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 },
        { id: "P2_3", lineId: "L002", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 },
        { id: "P2_4", lineId: "L002", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 },
        { id: "P2_5", lineId: "L002", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út (Phần 1)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 },
        { id: "P2_6", lineId: "L002", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Hụi Chót)", isWithdrawn: false, withdrawnPeriod: null, bidAmount: null, withdrawnDate: null, totalPaid: 0, totalReceived: 0 }
      ],
      createdAt: "2026-05-20T08:00:00Z"
    }
  ];

  // Sổ hụi chi tiết từng kỳ khui hụi đã diễn ra cho Dây L001
  const periodResults: HuiPeriodResult[] = [
    {
      id: "R_L001_1",
      lineId: "L001",
      lineName: "Hụi Tháng Lộc Điền 2 Triệu",
      period: 1,
      date: "2026-02-15",
      winnerPartId: "P1_1",
      winnerMemberId: "M006",
      winnerName: "Thím Ba Mỹ Tho",
      winnerAlias: "Thím Ba Mỹ Tho (Phần 1)",
      bidAmount: 400000,
      totalCommission: 1000000, // cô thảo gom của thím ba
      // Công thức thực nhận kỳ 1 (Tổng 10 phần):
      // Người hốt nhận hụi sống từ 9 phần còn lại (mức đóng = 2M - 400k = 1.6M)
      // Cộng hụi chết từ 0 phần đã chết. 
      // 9 * 1.600.000 = 14.400.000đ + (Thành viên thắng tự đóng 1 phần sống của mình chính là nằm trong 9 phần này)
      // Thường miền Tây: (9 phần sống chưa hốt * 1,600,000) = 14,400,000đ. Đã hốt trước: 0 phần. 
      // Nhưng nhà mạng hốt phải trừ tiền đầu thảo cô Út chủ hụi: trừ 1,000,000đ. Còn thực nhận: 13,400,000đ.
      // Để lưu trữ đúng như thím Ba Mỹ Tho đã lưu, tổng tiền giao dịch là:
      totalWithdrawnCash: 13400000, 
      status: "bidded",
      payments: [
        { id: "PAY_R1_1", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_1", memberId: "M006", memberName: "Thím Ba Mỹ Tho", alias: "Thím Ba Mỹ Tho (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_2", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_2", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười Cao Lãnh (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_3", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_3", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_4", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_4", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_5", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_5", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_6", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_6", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út Trà Cú (Phần 1)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_7", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_7", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 2)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_8", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_8", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 2)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_9", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_9", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 2)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" },
        { id: "PAY_R1_10", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, partId: "P1_10", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Chót Dây)", amountToPay: 1600000, payType: "song", status: "paid", paidAt: "2026-02-15" }
      ]
    },
    {
      id: "R_L001_2",
      lineId: "L001",
      lineName: "Hụi Tháng Lộc Điền 2 Triệu",
      period: 2,
      date: "2026-03-15",
      winnerPartId: "P1_2",
      winnerMemberId: "M004",
      winnerName: "Anh Mười Cao Lãnh",
      winnerAlias: "Anh Mười Cao Lãnh (Phần 1)",
      bidAmount: 500000,
      totalCommission: 1000000,
      // Công thức kỳ 2:
      // Sống đóng (8 phần còn lại chưa hốt): 2M - 500k = 1.5M. => 8 * 1.5M = 12,000,000đ
      // Chết đóng (1 phần đã hốt kỳ trước - Thím Ba): đóng 2M. => 1 * 2M = 2,000,000đ
      // Tổng cộng: 14M. Trừ hoa hồng chủ hụi Út Hương: 1M. Còn thực thấu: 13,000,000đ.
      totalWithdrawnCash: 13000000,
      status: "bidded",
      payments: [
        { id: "PAY_R2_1", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_1", memberId: "M006", memberName: "Thím Ba Mỹ Tho", alias: "Thím Ba Mỹ Tho (Phần 1)", amountToPay: 2000000, payType: "chet", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_2", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_2", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười Cao Lãnh (Phần 1)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_3", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_3", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 1)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_4", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_4", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 1)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_5", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_5", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 1)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_6", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_6", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út Trà Cú (Phần 1)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_7", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_7", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 2)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_8", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_8", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 2)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_9", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_9", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 2)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" },
        { id: "PAY_R2_10", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, partId: "P1_10", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Chót Dây)", amountToPay: 1500000, payType: "song", status: "paid", paidAt: "2026-03-15" }
      ]
    },
    {
      id: "R_L001_3",
      lineId: "L001",
      lineName: "Hụi Tháng Lộc Điền 2 Triệu",
      period: 3,
      date: "2026-04-15",
      winnerPartId: "P1_3",
      winnerMemberId: "M003",
      winnerName: "Chú Năm Vĩnh Long",
      winnerAlias: "Chú Năm Vĩnh Long (Phần 1)",
      bidAmount: 300000,
      totalCommission: 1000000,
      // Kỳ 3:
      // Sống (7 phần chưa đóng chết): 2M - 300k = 1.7M => 7 * 1.7M = 11.900.000đ
      // Chết: Thím Ba, Anh Mười: 2 * 2M = 4,000,000đ
      // Tổng: 15.900.000đ, Trừ hoa hồng Út Hương 1M = 14,900,000đ thực nhận
      totalWithdrawnCash: 14900000,
      status: "bidded",
      payments: [
        { id: "PAY_R3_1", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_1", memberId: "M006", memberName: "Thím Ba Mỹ Tho", alias: "Thím Ba Mỹ Tho (Phần 1)", amountToPay: 2000000, payType: "chet", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_2", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_2", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười Cao Lãnh (Phần 1)", amountToPay: 2000000, payType: "chet", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_3", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_3", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 1)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_4", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_4", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 1)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_5", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_5", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 1)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_6", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_6", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út Trà Cú (Phần 1)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_7", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_7", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 2)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_8", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_8", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 2)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_9", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_9", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 2)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" },
        { id: "PAY_R3_10", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, partId: "P1_10", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Chót Dây)", amountToPay: 1700000, payType: "song", status: "paid", paidAt: "2026-04-15" }
      ]
    }
  ];

  // Các kỳ khui đang chuẩn bị thu tiền (Kỳ 4 của L001)
  const currentPayments: HuiPayment[] = [
    { id: "PAY_R4_1", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_1", memberId: "M006", memberName: "Thím Ba Mỹ Tho", alias: "Thím Ba Mỹ Tho (Phần 1)", amountToPay: 2000000, payType: "chet", status: "paid", paidAt: "2026-05-15" },
    { id: "PAY_R4_2", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_2", memberId: "M004", memberName: "Anh Mười Cao Lãnh", alias: "Anh Mười Cao Lãnh (Phần 1)", amountToPay: 2000000, payType: "chet", status: "overdue", paidAt: null },
    { id: "PAY_R4_3", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_3", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 1)", amountToPay: 2000000, payType: "chet", status: "paid", paidAt: "2026-05-15" },
    { id: "PAY_R4_4", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_4", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 1)", amountToPay: 1550000, payType: "song", status: "paid", paidAt: "2026-05-15" }, // giả sử mức bốc kỳ này bớt 450k
    { id: "PAY_R4_5", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_5", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 1)", amountToPay: 1550000, payType: "song", status: "pending", paidAt: null },
    { id: "PAY_R4_6", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_6", memberId: "M005", memberName: "Dì Út Trà Cú", alias: "Dì Út Trà Cú (Phần 1)", amountToPay: 1550000, payType: "song", status: "pending", paidAt: null },
    { id: "PAY_R4_7", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_7", memberId: "M001", memberName: "Chị Sáu Trà Ôn", alias: "Chị Sáu Trà Ôn (Phần 2)", amountToPay: 1550000, payType: "song", status: "paid", paidAt: "2026-05-15" },
    { id: "PAY_R4_8", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_8", memberId: "M003", memberName: "Chú Năm Vĩnh Long", alias: "Chú Năm Vĩnh Long (Phần 2)", amountToPay: 1550000, payType: "song", status: "paid", paidAt: "2026-05-15" },
    { id: "PAY_R4_9", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_9", memberId: "M002", memberName: "Cô Bảy Cai Lậy", alias: "Cô Bảy Cai Lậy (Phần 2)", amountToPay: 1550000, payType: "song", status: "pending", paidAt: null },
    { id: "PAY_R4_10", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, partId: "P1_10", memberId: "M007", memberName: "Chủ Hụi Út Hương", alias: "Út Hương (Chót Dây)", amountToPay: 1550000, payType: "song", status: "paid", paidAt: "2026-05-15" }
  ];

  const transactions: HuiTransaction[] = [
    { id: "TX001", type: "commission", amount: 1000000, date: "2026-02-15", description: "Thu tiền thảo hụi Tháng Lộc Điền kỳ 1 - Thím Ba", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, memberId: "M006", memberName: "Thím Ba Mỹ Tho" },
    { id: "TX002", type: "disburse", amount: 13400000, date: "2026-02-15", description: "Giao tiền hốt hụi đầu thấu kỳ 1 cho Thím Ba Mỹ Tho", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 1, memberId: "M006", memberName: "Thím Ba Mỹ Tho" },
    { id: "TX003", type: "commission", amount: 1000000, date: "2026-03-15", description: "Thu tiền thảo hụi Tháng Lộc Điền kỳ 2 - Anh Mười", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, memberId: "M004", memberName: "Anh Mười Cao Lãnh" },
    { id: "TX004", type: "disburse", amount: 13000000, date: "2026-03-15", description: "Giao tiền hốt hụi thấu kỳ 2 cho Anh Mười Cao Lãnh", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 2, memberId: "M004", memberName: "Anh Mười Cao Lãnh" },
    { id: "TX005", type: "commission", amount: 1000000, date: "2026-04-15", description: "Thu tiền thảo hụi Tháng Lộc Điền kỳ 3 - Chú Năm", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, memberId: "M003", memberName: "Chú Năm Vĩnh Long" },
    { id: "TX006", type: "disburse", amount: 14900000, date: "2026-04-15", description: "Giao tiền hốt hụi thấu kỳ 3 cho Chú Năm Vĩnh Long", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 3, memberId: "M003", memberName: "Chú Năm Vĩnh Long" },
    { id: "TX007", type: "collect", amount: 2000000, date: "2026-05-15", description: "Thu tiền hụi chết kỳ 4 - Thím Ba", lineId: "L001", lineName: "Hụi Tháng Lộc Điền 2 Triệu", period: 4, memberId: "M006", memberName: "Thím Ba Mỹ Tho" }
  ];

  const logs: HuiLog[] = [
    { id: "LOG001", timestamp: "2026-01-25T10:05:00Z", action: "Tạo dây hụi", details: "Chủ hụi Út Hương khởi tạo đường dây 'Hụi Tháng Lộc Điền 2 Triệu' gồm 10 phần chơi.", operator: "Chủ Hụi Út Hương" },
    { id: "LOG002", timestamp: "2026-02-15T12:00:00Z", action: "Khui hụi kỳ 1", details: "Thím Ba Mỹ Tho hốt hụi kỳ 1 dây L001. Bỏ giá đầu: 400.000 đ. Thực thấu: 13.400.000 đ.", operator: "Chủ Hụi Út Hương" },
    { id: "LOG003", timestamp: "2026-03-15T12:15:00Z", action: "Khui hụi kỳ 2", details: "Anh Mười Cao Lãnh hốt hụi kỳ 2 dây L001. Bỏ giá: 500.000 đ. Thực thấu: 13.000.000 đ.", operator: "Chủ Hụi Út Hương" },
    { id: "LOG004", timestamp: "2026-04-15T12:10:00Z", action: "Khui hụi kỳ 3", details: "Chú Năm Vĩnh Long hốt hụi kỳ 3 dây L001. Bỏ giá: 300.000 đ. Thực thấu: 14.900.000 đ.", operator: "Chủ Hụi Út Hương" }
  ];

  return { members, lines, periodResults, currentPayments, transactions, logs };
};

// Database state container loaded on startup
let db: {
  members: HuiMember[];
  lines: HuiLine[];
  periodResults: HuiPeriodResult[];
  currentPayments: HuiPayment[];
  transactions: HuiTransaction[];
  logs: HuiLog[];
  sheetId?: string;
  appsScriptUrl?: string;
} = {
  members: [],
  lines: [],
  periodResults: [],
  currentPayments: [],
  transactions: [],
  logs: [],
  sheetId: "",
  appsScriptUrl: ""
};


// Database Sync: Read from JSON file
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      db = {
        members: parsed.members || [],
        lines: parsed.lines || [],
        periodResults: parsed.periodResults || [],
        currentPayments: parsed.currentPayments || [],
        transactions: parsed.transactions || [],
        logs: parsed.logs || [],
        sheetId: parsed.sheetId || process.env.GOOGLE_SHEET_ID || "",
        appsScriptUrl: parsed.appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL || ""
      };
      console.log(`[Hụi Pro DB] Loaded existing database from ${DB_FILE}`);
    } else {
      console.log(`[Hụi Pro DB] No database file found. Seeding initial test data.`);
      db = {
        ...getInitialSeedData(),
        sheetId: process.env.GOOGLE_SHEET_ID || "",
        appsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || ""
      };
      saveDatabase();
    }
  } catch (error) {
    console.error(`[Hụi Pro DB] Failed to load database, using fallback seed values:`, error);
    db = getInitialSeedData();
  }
}

// Database Sync: Save to JSON file
export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    console.log(`[Hụi Pro DB] Synchronized with local file storage successfully.`);
    // Trigger real-time background sync if sheets are configured
    triggerAutoSyncToSheets();
  } catch (error) {
    console.error(`[Hụi Pro DB] Failed to persist state to file:`, error);
  }
}


// Init database
loadDatabase();

// ============================================
// GEMINI AI INTEGRATION SETTINGS
// ============================================
// Shared client user-agent setup for telemetry tracking is mandatory.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ [Gemini AI] Alert: GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// Logger middleware helper
const addAuditLog = (action: string, details: string, operator = "Chú Út Chủ Hụi") => {
  const newLog: HuiLog = {
    id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    operator
  };
  db.logs.unshift(newLog);
  saveDatabase();
};

// ============================================
// REST API ROUTING
// ============================================

// 1. Reset Database endpoint
app.post("/api/reset-db", (req, res) => {
  db = getInitialSeedData();
  saveDatabase();
  addAuditLog("Đặt lại hệ thống", "Đặt lại toàn bộ dữ liệu mẫu ban đầu để chạy thử.");
  res.json({ message: "Reset database successful", data: db });
});

// 2. Members Management
app.get("/api/members", (req, res) => {
  res.json(db.members);
});

app.post("/api/members", (req, res) => {
  const { name, phone, address, notes, role } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Tên và Số điện thoại không được để trống." });
  }

  const newMember: HuiMember = {
    id: `M_${Date.now()}`,
    name,
    phone,
    address: address || "Chưa xác định",
    reputation: 90, // Mặc định 90 khi vào
    riskStatus: "trusted",
    createdAt: new Date().toISOString(),
    notes: notes || "",
    role: role || "huivien"
  };

  db.members.push(newMember);
  saveDatabase();
  addAuditLog("Thêm hụi viên", `Thêm hụi viên mới tên: ${name} (${phone})`);
  res.status(201).json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, address, reputation, notes, role, riskStatus } = req.body;

  const mIdx = db.members.findIndex(m => m.id === id);
  if (mIdx === -1) {
    return res.status(404).json({ error: "Không tìm thấy hụi viên." });
  }

  db.members[mIdx] = {
    ...db.members[mIdx],
    name: name !== undefined ? name : db.members[mIdx].name,
    phone: phone !== undefined ? phone : db.members[mIdx].phone,
    address: address !== undefined ? address : db.members[mIdx].address,
    reputation: reputation !== undefined ? Number(reputation) : db.members[mIdx].reputation,
    riskStatus: riskStatus !== undefined ? riskStatus : db.members[mIdx].riskStatus,
    notes: notes !== undefined ? notes : db.members[mIdx].notes,
    role: role !== undefined ? role : db.members[mIdx].role
  };

  saveDatabase();
  addAuditLog("Cập nhật hụi viên", `Cập nhật thông tin hụi viên ${db.members[mIdx].name}`);
  res.json(db.members[mIdx]);
});

app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const m = db.members.find(memb => memb.id === id);
  if (!m) return res.status(404).json({ error: "Hụi viên không tồn tại." });

  // Guard: check if member is playing any active line
  const activeLines = db.lines.filter(l => l.status === "active" && l.parts.some(p => p.memberId === id));
  if (activeLines.length > 0) {
    return res.status(400).json({ error: `Không thể xóa vì hụi viên đang tham gia ${activeLines.length} dây hụi đang hoạt động.` });
  }

  db.members = db.members.filter(memb => memb.id !== id);
  saveDatabase();
  addAuditLog("Xóa hụi viên", `Xóa hụi viên ${m.name}`);
  res.json({ message: "Delete member success", id });
});

// 3. Dây Hụi Management
app.get("/api/lines", (req, res) => {
  res.json(db.lines);
});

app.post("/api/lines", (req, res) => {
  const { name, value, periodType, startDate, commission, partsInput } = req.body;
  if (!name || !value || !periodType || !startDate) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc thiết lập dây hụi." });
  }

  const lineId = `L_${Date.now()}`;
  
  // Transform partsInput to list of parts
  const rawParts: any[] = partsInput || [];
  const parts: HuiPart[] = rawParts.map((p, i) => {
    const memberId = p.memberId || "M007"; // mặc định chủ hụi nếu trống
    const m = db.members.find(memb => memb.id === memberId);
    return {
      id: `P_${lineId}_${i + 1}`,
      lineId,
      memberId,
      memberName: m ? m.name : "Vắng danh",
      alias: p.alias || `${m ? m.name : "Hụi viên"} (Phần ${i + 1})`,
      isWithdrawn: false,
      withdrawnPeriod: null,
      bidAmount: null,
      withdrawnDate: null,
      totalPaid: 0,
      totalReceived: 0
    };
  });

  const newLine: HuiLine = {
    id: lineId,
    name,
    value: Number(value),
    periodType,
    startDate,
    commission: commission !== undefined ? Number(commission) : Number(value) / 2, // Mặc định Thảo hụi nửa đầu
    totalPeriods: parts.length,
    currentPeriod: 1,
    status: "active",
    parts,
    createdAt: new Date().toISOString()
  };

  db.lines.push(newLine);
  saveDatabase();
  addAuditLog("Tạo dây hụi mới", `Khởi tạo đường dây "${name}" với giá trị đầu ${Number(value).toLocaleString()}đ gồm ${parts.length} phần hụi.`);
  res.status(201).json(newLine);
});

app.delete("/api/lines/:id", (req, res) => {
  const { id } = req.params;
  const line = db.lines.find(l => l.id === id);
  if (!line) return res.status(404).json({ error: "Không tìm thấy dây hụi." });

  db.lines = db.lines.filter(l => l.id !== id);
  db.periodResults = db.periodResults.filter(r => r.lineId !== id);
  db.currentPayments = db.currentPayments.filter(p => p.lineId !== id);

  saveDatabase();
  addAuditLog("Xóa dây hụi", `Xóa dây hụi ${line.name}`);
  res.json({ message: "Delete line success", id });
});

// 4. Đấu Hụi / Khui Hụi Tự Động & Hốt Hụi
// POST /api/lines/:id/bid -> khui hụi kỳ mới cho một dây hụi
app.post("/api/lines/:id/bid", (req, res) => {
  const { id } = req.params;
  const { winnerPartId, bidAmount, dateInput } = req.body;

  const line = db.lines.find(l => l.id === id);
  if (!line) return res.status(404).json({ error: "Không tìm thấy dây hụi." });

  if (line.status === "completed") {
    return res.status(400).json({ error: "Dây hụi này đã kết thúc tất cả các kỳ khui." });
  }

  const winnerPart = line.parts.find(p => p.id === winnerPartId);
  if (!winnerPart) return res.status(400).json({ error: "Phần hụi được chọn để hốt không tồn tại trong dây hụi này." });

  if (winnerPart.isWithdrawn) {
    return res.status(400).json({ error: "Phần hụi này đã được hốt trước đây rồi." });
  }

  const currentPeriod = line.currentPeriod;
  const bidValue = Number(bidAmount);
  if (isNaN(bidValue) || bidValue < 0) {
    return res.status(400).json({ error: "Mức bỏ hụi (bớt thầu) không hợp lệ." });
  }

  // ============================================
  // CÔNG THỨC TOÁN ĐẤU HỤI MIỀN TÂY CHUẨN XÁC
  // ============================================
  // 1. Tính toán thành phần số lượng:
  // - Tổng số phần hụi = line.totalPeriods
  // - Số phần hụi CHẾT (đã hốt trước kỳ này): currentPeriod - 1
  // - Số phần hụi SỐNG (chưa hốt, tính cả phần thắng này): totalPeriods - (currentPeriod - 1)
  // 2. Thu tiền đóng hụi sống:
  //   Mỗi hụi viên chưa hốt đóng: Đầu hụi - Mức bỏ kỳ này (line.value - bidValue)
  // 3. Thu tiền đóng hụi chết:
  //   Mỗi hụi viên đã hốt đóng đủ 100%: Đầu hụi (line.value)
  // 4. Tiền thảo chủ hụi (commission): line.commission (Thường đóng 1 lần duy nhất khi hốt)
  // 5. Thực thấu giao cho người hốt:
  //   Thực Thấu = [Số phần sống * (Đầu hụi - bỏ hụi)] + [Số phần chết * Đầu hụi] - Tiền thảo chủ hụi.
  // Tuy nhiên, để chính xác cho việc thu tiền thực tế, ta coi phần tự ứng của người hốt cũng được tính đóng vào.

  const deadCount = currentPeriod - 1;
  const liveCount = line.totalPeriods - deadCount;

  const valuePerLive = line.value - bidValue;
  const valuePerDead = line.value;

  // Tính tổng số tiền thu được trước khi trừ thảo hụi:
  // (Số phần hụi sống chưa hốt kỳ này nhân với mức thấu hụi sống) + (Số phần hụi chết ròng nhân mức hụi chết)
  // Thực tế người hốt cũng phải tự bù phần tài chính của mình vào (nếu là hụi sống), 
  // nên trong quỹ thực thấu, ta tính đủ tất cả các phần khác nộp lại:
  const totalReceivedRaw = (liveCount * valuePerLive) + (deadCount * valuePerDead);
  const realReceivedAfterCommission = totalReceivedRaw - line.commission;

  // Cập nhật trạng thái phần hụi đã hốt
  winnerPart.isWithdrawn = true;
  winnerPart.withdrawnPeriod = currentPeriod;
  winnerPart.bidAmount = bidValue;
  winnerPart.withdrawnDate = dateInput || new Date().toISOString().split('T')[0];
  winnerPart.totalReceived = realReceivedAfterCommission;

  // Tạo và ghi nhận các thanh toán cho các phần khác trong kỳ khui hụi này
  const periodPayments: HuiPayment[] = line.parts.map(p => {
    let paymentAmount = 0;
    let payType: "song" | "chet" = "song";

    // Phân loại:
    if (p.id === winnerPartId) {
      // Phần hụi thắng đấu hụi kỳ này:
      // Bản chất họ đóng hụi sống cho phần của mình
      paymentAmount = valuePerLive;
      payType = "song";
    } else if (p.isWithdrawn && p.withdrawnPeriod !== null && p.withdrawnPeriod < currentPeriod) {
      // Đã hốt trong các kỳ trước -> Hụi chết (đóng đủ)
      paymentAmount = valuePerDead;
      payType = "chet";
    } else {
      // Chưa hốt -> Hụi sống (đóng bớt)
      paymentAmount = valuePerLive;
      payType = "song";
    }

    // Tự động đóng cho hụi viên có uy tín cao, hoặc chủ hụi đại diện gom
    const m = db.members.find(memb => memb.id === p.memberId);
    const isAutoPaid = m && m.reputation >= 85; 

    return {
      id: `PAY_${line.id}_P${currentPeriod}_${p.id}`,
      lineId: line.id,
      lineName: line.name,
      period: currentPeriod,
      partId: p.id,
      memberId: p.memberId,
      memberName: p.memberName,
      alias: p.alias,
      amountToPay: paymentAmount,
      payType,
      status: isAutoPaid ? "paid" : "pending",
      paidAt: isAutoPaid ? (dateInput || new Date().toISOString().split('T')[0]) : null
    };
  });

  // Tăng tổng tiền đã đóng cho những người đóng ngay kỳ này
  periodPayments.forEach(pay => {
    if (pay.status === "paid") {
      const linePart = line.parts.find(pt => pt.id === pay.partId);
      if (linePart) {
        linePart.totalPaid += pay.amountToPay;
      }
    }
  });

  // Thiết lập kỳ khui hụi kết quả
  const periodResult: HuiPeriodResult = {
    id: `R_${line.id}_${currentPeriod}`,
    lineId: line.id,
    lineName: line.name,
    period: currentPeriod,
    date: dateInput || new Date().toISOString().split('T')[0],
    winnerPartId: winnerPart.id,
    winnerMemberId: winnerPart.memberId,
    winnerName: winnerPart.memberName,
    winnerAlias: winnerPart.alias,
    bidAmount: bidValue,
    totalCommission: line.commission,
    totalWithdrawnCash: realReceivedAfterCommission,
    status: "bidded",
    payments: periodPayments
  };

  db.periodResults.push(periodResult);

  // Tạo các giao dịch tự động sáp nhập vào thu chi:
  // Transaction 1: Chi giao tiền hốt
  db.transactions.push({
    id: `TX_DISB_${Date.now()}`,
    type: "disburse",
    amount: realReceivedAfterCommission,
    date: dateInput || new Date().toISOString().split('T')[0],
    description: `Giao tiền hót thấu hụi kỳ ${currentPeriod} cho ${winnerPart.memberName}`,
    lineId: line.id,
    lineName: line.name,
    period: currentPeriod,
    memberId: winnerPart.memberId,
    memberName: winnerPart.memberName,
    partId: winnerPart.id
  });

  // Transaction 2: Thu thảo hụi (commission)
  db.transactions.push({
    id: `TX_COMM_${Date.now()}`,
    type: "commission",
    amount: line.commission,
    date: dateInput || new Date().toISOString().split('T')[0],
    description: `Thu tiền thảo đầu hụi kỳ ${currentPeriod} từ ${winnerPart.memberName}`,
    lineId: line.id,
    lineName: line.name,
    period: currentPeriod,
    memberId: winnerPart.memberId,
    memberName: winnerPart.memberName,
    partId: winnerPart.id
  });

  // Đóng tiền của bất kỳ ai mà thanh toán auto "paid" kỳ này cũng tạo Transaction "collect"
  periodPayments.forEach((py) => {
    if (py.status === "paid") {
      db.transactions.push({
        id: `TX_COLL_${Date.now()}_${py.id}`,
        type: "collect",
        amount: py.amountToPay,
        date: dateInput || new Date().toISOString().split('T')[0],
        description: `Thu tiền đóng hụi (${py.payType === 'song' ? 'Sống' : 'Chết'}) Kỳ ${currentPeriod} - ${py.memberName}`,
        lineId: line.id,
        lineName: line.name,
        period: currentPeriod,
        memberId: py.memberId,
        memberName: py.memberName,
        partId: py.partId
      });
    }
  });

  // Chuyển giai đoạn kỳ khui hụi tiếp theo
  if (currentPeriod < line.totalPeriods) {
    line.currentPeriod = currentPeriod + 1;
  } else {
    line.currentPeriod = line.totalPeriods;
    line.status = "completed"; // Dây hụi hoàn thành mãn dây
  }

  // Cập nhật lại các khoản đóng chưa hoàn thành của kỳ cũ thảy qua mảng nợ cần thu
  // gom các pending payments mới vào currentPayments chung để dễ track
  db.currentPayments = [
    ...db.currentPayments.filter(p => p.lineId !== line.id), // bỏ các dòng dở dang kỳ cũ của dây này
    ...periodPayments.filter(p => p.status !== "paid") // chỉ nạp các khoản nợ đóng thực tế
  ];

  saveDatabase();
  addAuditLog(
    "Khui hụi & hốt hụi", 
    `Kỳ ${currentPeriod} của "${line.name}": ${winnerPart.memberName} đã giật thầu thành công với giá bớt ${bidValue.toLocaleString()}đ. Thực nhận: ${realReceivedAfterCommission.toLocaleString()}đ.`
  );

  res.json({
    message: "Bidding processed successfully",
    line,
    periodResult
  });
});

// 5. Thanh Toán Đóng Hụi (Thu Tiền Sống / Hụi Chết)
app.post("/api/payments/:id/pay", (req, res) => {
  const { id } = req.params;
  const { datePaid } = req.body;

  // Tìm trong currentPayments (chứa các hóa đơn hụi viên nợ cần đóng)
  const paymentIdx = db.currentPayments.findIndex(p => p.id === id);
  if (paymentIdx === -1) {
    // Có thể nó nằm trong các kỳ cũ nằm sâu bên trong periodResults
    // Ta tìm ngược để nếu người dùng thanh toán nợ cũ, ta vẫn đối soát được
    let foundInResults = false;
    for (let r of db.periodResults) {
      const pi = r.payments.findIndex(pay => pay.id === id);
      if (pi !== -1) {
        if (r.payments[pi].status === "paid") {
          return res.status(400).json({ error: "Khoản đóng hụi này đã được thanh toán rồi." });
        }
        r.payments[pi].status = "paid";
        r.payments[pi].paidAt = datePaid || new Date().toISOString().split('T')[0];
        
        // Cộng dồn đóng hụi vào Dây hụi
        const targetLine = db.lines.find(lin => lin.id === r.lineId);
        if (targetLine) {
          const targetPart = targetLine.parts.find(pt => pt.id === r.payments[pi].partId);
          if (targetPart) targetPart.totalPaid += r.payments[pi].amountToPay;
        }

        // Tạo Transaction "collect"
        db.transactions.push({
          id: `TX_COLL_${Date.now()}`,
          type: "collect",
          amount: r.payments[pi].amountToPay,
          date: datePaid || new Date().toISOString().split('T')[0],
          description: `Thu đóng hụi muộn kỳ ${r.period} của ${r.payments[pi].memberName}`,
          lineId: r.lineId,
          lineName: r.lineName,
          period: r.period,
          memberId: r.payments[pi].memberId,
          memberName: r.payments[pi].memberName,
          partId: r.payments[pi].partId
        });

        foundInResults = true;
        break;
      }
    }

    if (!foundInResults) {
      return res.status(404).json({ error: "Không tìm thấy thông tin biên đóng hụi." });
    }

    saveDatabase();
    return res.json({ message: "Đã đóng hụi thành công." });
  }

  const payObj = db.currentPayments[paymentIdx];
  payObj.status = "paid";
  payObj.paidAt = datePaid || new Date().toISOString().split('T')[0];

  // Đồng bộ lưu vết trong dây hụi gốc
  const line = db.lines.find(l => l.id === payObj.lineId);
  if (line) {
    const part = line.parts.find(p => p.id === payObj.partId);
    if (part) {
      part.totalPaid += payObj.amountToPay;
    }
  }

  // Đồng bộ trong Sổ kỳ khui hụi lịch sử (periodResults)
  const prevResultIdx = db.periodResults.findIndex(r => r.lineId === payObj.lineId && r.period === payObj.period);
  if (prevResultIdx !== -1) {
    const matchPayIdx = db.periodResults[prevResultIdx].payments.findIndex(py => py.id === payObj.id);
    if (matchPayIdx !== -1) {
      db.periodResults[prevResultIdx].payments[matchPayIdx].status = "paid";
      db.periodResults[prevResultIdx].payments[matchPayIdx].paidAt = payObj.paidAt;
    }
  }

  // Tạo Transaction ghi sổ sách thu tiền
  db.transactions.push({
    id: `TX_COLL_${Date.now()}`,
    type: "collect",
    amount: payObj.amountToPay,
    date: payObj.paidAt,
    description: `Thu tiền đóng hụi (${payObj.payType === 'song' ? 'Sống' : 'Chết'}) Kỳ ${payObj.period} - ${payObj.memberName}`,
    lineId: payObj.lineId,
    lineName: payObj.lineName,
    period: payObj.period,
    memberId: payObj.memberId,
    memberName: payObj.memberName,
    partId: payObj.partId
  });

  // Tăng điểm uy tín hụi viên nhẹ vì đóng sòng phẳng
  const memb = db.members.find(m => m.id === payObj.memberId);
  if (memb) {
    memb.reputation = Math.min(100, memb.reputation + 1);
    if (memb.reputation > 80) memb.riskStatus = "trusted";
  }

  // Gỡ biên đóng hụi đã xử lý khỏi currentPayments nợ xấu để tránh lặp
  db.currentPayments.splice(paymentIdx, 1);

  saveDatabase();
  addAuditLog(
    "Thu tiền hụi viên", 
    `Hụi viên ${payObj.memberName} đã đóng ${payObj.amountToPay.toLocaleString()}đ hụi ${payObj.payType === 'song' ? 'Sống' : 'Chết'} kỳ ${payObj.period} dây "${payObj.lineName}"`
  );

  res.json({ message: "Payment processed", payment: payObj });
});

// 6. Sổ Thống kê Thu chi & Nhật ký
app.get("/api/transactions", (req, res) => {
  res.json(db.transactions);
});

app.post("/api/transactions", (req, res) => {
  const { type, amount, description, dateInput } = req.body;
  if (!type || !amount || !description) {
    return res.status(400).json({ error: "Thiếu thông tin cho giao dịch thủ công." });
  }

  const transaction: HuiTransaction = {
    id: `TX_MAN_${Date.now()}`,
    type,
    amount: Number(amount),
    date: dateInput || new Date().toISOString().split('T')[0],
    description
  };

  db.transactions.push(transaction);
  saveDatabase();
  addAuditLog("Ghi chép thu chi", `Giao dịch thủ công [${type}] có giá trị ${Number(amount).toLocaleString()}đ - ${description}`);
  res.status(201).json(transaction);
});

app.get("/api/logs", (req, res) => {
  res.json(db.logs);
});

app.get("/api/results", (req, res) => {
  res.json(db.periodResults);
});

// 7. Sổ nợ cần thu chưa thu (chỉ hụi viên chưa đóng hoặc nợ dở dang)
app.get("/api/receivables", (req, res) => {
  // Trả về danh sách nợ hụi viên cần phải thanh toán kỳ này
  res.json(db.currentPayments);
});

// 8. API Thống kê chuyên sâu phục vụ biểu đồ Dashboard
app.get("/api/analytics/summary", (req, res) => {
  const totalLines = db.lines.length;
  const totalMembers = db.members.length;
  
  // Tổng giao dịch thu chi phát sinh
  let totalCollect = 0;
  let totalDisburse = 0;
  let totalCommissions = 0;

  db.transactions.forEach(tx => {
    if (tx.type === "collect") totalCollect += tx.amount;
    if (tx.type === "disburse") totalDisburse += tx.amount;
    if (tx.type === "commission") totalCommissions += tx.amount;
  });

  // Số nợ hụi viên chưa đóng (receivables)
  const outstandingDebt = db.currentPayments.reduce((acc, curr) => acc + curr.amountToPay, 0);

  // Thống kê rủi ro vỡ hụi (số hụi viên có uy tín dưới 60 hoặc trạng thái risk_high)
  const riskMembersCount = db.members.filter(m => m.riskStatus === "risk_high" || m.reputation < 60).length;
  const mediumRiskMembersCount = db.members.filter(m => m.riskStatus === "risk_medium").length;

  const riskPrecent = totalMembers > 0 
    ? Math.round(((riskMembersCount * 1.5 + mediumRiskMembersCount * 0.5) / totalMembers) * 100) 
    : 0;

  // Phân tích trạng thái vỡ hụi
  let systemAlert = "Hệ thống vận hành an toàn. Các tài khoản đang đóng hụi đều đặn.";
  let alertLevel: "safe" | "warning" | "danger" = "safe";

  if (riskPrecent > 30) {
    systemAlert = "CẢNH BÁO CAO: Điểm tín chấp trung bình của dây hụi sụt giảm mạnh. Nguy cơ vỡ hụi giật hụi cao!";
    alertLevel = "danger";
  } else if (riskPrecent > 15 || outstandingDebt > 15000000) {
    systemAlert = "CẢNH BÁO VỪA: Nhiều hụi viên đóng trễ kỳ chết. Cần liên lạc thu hồi nợ tránh phát sinh dây chuyền.";
    alertLevel = "warning";
  }

  // Thu thập dữ liệu tăng trưởng giao dịch theo tháng
  const monthlyStats: Record<string, { collect: number; disburse: number; commission: number }> = {};
  
  db.transactions.forEach(tx => {
    // extract YYYY-MM
    const month = tx.date.substring(0, 7);
    if (!monthlyStats[month]) {
      monthlyStats[month] = { collect: 0, disburse: 0, commission: 0 };
    }
    if (tx.type === "collect") monthlyStats[month].collect += tx.amount;
    if (tx.type === "disburse") monthlyStats[month].disburse += tx.amount;
    if (tx.type === "commission") monthlyStats[month].commission += tx.amount;
  });

  const chartData = Object.keys(monthlyStats).sort().map(month => ({
    name: month,
    'Thu Tiền Đóng': monthlyStats[month].collect,
    'Chi Tiền Hốt': monthlyStats[month].disburse,
    'Hoa Hồng Chủ Hụi': monthlyStats[month].commission
  }));

  res.json({
    totalLines,
    totalMembers,
    totalCollect,
    totalDisburse,
    totalCommissions,
    outstandingDebt,
    riskPrecent: Math.min(100, riskPrecent),
    systemAlert,
    alertLevel,
    chartData
  });
});

// ============================================
// GEMINI AI CHỮA HỘ / PHÂN TÍCH RỦI RO THÔNG MINH
// ============================================
app.post("/api/ai/analyze-risk", async (req, res) => {
  const { lineId } = req.body;
  if (!lineId) {
    return res.status(400).json({ error: "Vui lòng cung cấp mã dây hụi để phân tích." });
  }

  const line = db.lines.find(l => l.id === lineId);
  if (!line) {
    return res.status(404).json({ error: "Không tìm thấy dây hụi này." });
  }

  // Assemble contextual dataset for Gemini to analyze
  const partsSummary = line.parts.map(p => {
    const memberObj = db.members.find(m => m.id === p.memberId);
    return {
      alias: p.alias,
      isWithdrawn: p.isWithdrawn,
      totalPaid: p.totalPaid,
      bidAmount: p.bidAmount,
      memberReputPoints: memberObj ? memberObj.reputation : 80,
      memberRiskStatus: memberObj ? memberObj.riskStatus : "trusted",
    };
  });

  const aiClient = getGeminiClient();
  const contextPrompt = `
    Bạn là Trợ lý AI đặc biệt chuyên phân tích rủi ro tài chính đường dây Hụi/Phường/Họ Việt Nam, am hiểu tường tận văn hóa tín dụng lòng tin tại miền Tây sông nước 2026.
    Hãy phân tích kỹ các chỉ số rủi ro của dây hụi sau:
    Dây hụi: "${line.name}"
    Đầu hụi: ${line.value.toLocaleString()} VNĐ
    Chu kỳ khui: ${line.periodType}
    Tổng số kỳ khui: ${line.totalPeriods}
    Kỳ khui hiện tại: ${line.currentPeriod}
    Hoa hồng chủ hụi thu khi hốt: ${line.commission.toLocaleString()} VNĐ

    Danh sách hụi viên và các phần chơi:
    ${JSON.stringify(partsSummary, null, 2)}

    Yêu cầu trả về kết quả định dạng JSON nghiêm ngặt cấu trúc dưới đây, không viết chữ giải thích ngoài khối JSON, trả về trực tiếp đối tượng JSON để phân tích:
    {
      "safetyScore": <Số nguyên từ 0 tới 100 biểu thị điểm an toàn của dây hụi này>,
      "riskLevel": "<Một trong 3 chuỗi: 'LOW' | 'MEDIUM' | 'HIGH' biểu thị cấp độ rủi ro>",
      "factors": [<Mảng danh sách các tác nhân rủi ro, ví dụ: 'Hụi viên Dì Út Trà Cú có điểm tín nhiệm quá thấp', 'Tỷ lệ hụi chết đã đạt 30% nhưng có thành viên đóng trễ kỳ', 'Bỏ hầm đấu giá cao liên tục'>],
      "recommendations": [<Mảng các hành động chủ hụi cần làm để đề phòng vỡ hụi, ví dụ: 'Gặp trực tiếp dì Út để kiểm tra khả năng tài chính', 'Yêu cầu người hốt đợt sau có bảo lãnh', 'Tăng quỹ dự phòng tài chính'>],
      "summary": "<Viết 3-4 câu tóm tắt phân tích sắc sảo mang hương vị sông nước Miền Tây kết hợp kiến thức kiểm toán tài chính hiện đại 2026>"
    }
  `;

  if (!aiClient) {
    // Fallback Mock AI Analysis dynamically calculated because key cannot be resolved
    const lowRepCount = partsSummary.filter(p => p.memberReputPoints < 60).length;
    const deadRatio = line.currentPeriod / line.totalPeriods;
    const level = lowRepCount > 1 || deadRatio > 0.6 ? "HIGH" : (lowRepCount > 0 || deadRatio > 0.4 ? "MEDIUM" : "LOW");
    const score = level === "HIGH" ? 45 : (level === "MEDIUM" ? 72 : 93);

    const factors = [];
    if (lowRepCount > 0) factors.push(`Phát hiện ${lowRepCount} phần hụi do thành viên có uy tín thấp hơn 60 nắm giữ (ví dụ: Dì Út Trà Cú).`);
    if (deadRatio > 0.5) factors.push(`Tỷ lệ hụi chết đạt ${Math.round(deadRatio*100)}% tổng dây, áp lực thu hồi nợ hụi chết từ các kỳ trước bắt đầu đè nặng lên chủ hụi.`);
    if (factors.length === 0) factors.push("Dây hụi có các hụi viên đều là các nhà vườn, tiểu thương uy tín cao tại Vĩnh Long và Tiền Giang.");

    const recommendations = [
      "Quản lý chặt chẽ thông tin liên lạc và có biên nhận điện tử ký số/hình ảnh gửi thẳng qua Zalo sau mỗi kỳ khui.",
      "Đối với hụi viên có uy tín trung bình thấp, hạn chế cho hốt hụi quá sớm trừ khi có hụi viên uy tín bảo lãnh chéo.",
      "Thực hiện trích lập quỹ bảo chứng an toàn (khoảng 10-15% tổng giá trị thấu hụi) để phòng hờ trường hợp có người bể hụi dột ngột."
    ];

    const fallbackResult: AIRiskAnalysis = {
      lineId,
      safetyScore: score,
      riskLevel: level as any,
      factors,
      recommendations,
      summary: `[Chế độ Ngoại Tuyến AI] Phân tích dây hụi '${line.name}' cho thấy tỷ lệ hụi chết đang ở mức trung bình. Các hụi viên đi dây hụi này chủ yếu là cư dân kỳ cựu địa phương. Tuy nhiên, phát hiện hụi viên ${lowRepCount > 0 ? 'gặp khó khăn dòng tiền tài chính' : 'giao dịch đúng hạn'}. Chủ hụi Út Hương cần sử dụng Sổ Biên Nhận Điện Tử gửi Zalo ngay sau khui hụi để thít chặt sợi dây uy tín của bà con miền Tây.`,
      analyzedAt: new Date().toISOString()
    };
    return res.json(fallbackResult);
  }

  try {
    const aiResponse = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanText = aiResponse.text ? aiResponse.text.trim() : "{}";
    const parsedAI = JSON.parse(cleanText);
    
    const finalResult: AIRiskAnalysis = {
      lineId,
      safetyScore: parsedAI.safetyScore || 80,
      riskLevel: parsedAI.riskLevel || 'MEDIUM',
      factors: parsedAI.factors || ['Uy tín trung bình'],
      recommendations: parsedAI.recommendations || ['Giám sát dòng tiền'],
      summary: parsedAI.summary || 'Phân tích hoàn tất suôn sẻ.',
      analyzedAt: new Date().toISOString()
    };

    res.json(finalResult);
  } catch (error) {
    console.error("Gemini risk analysis API error:", error);
    res.status(500).json({ error: "Lỗi kết nối bộ não AI phân tích rủi ro." });
  }
});

// 9. AI Advisor chat box
app.post("/api/ai/chat-advisor", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Nội dung câu hỏi trống." });

  const aiClient = getGeminiClient();
  const baseInstruction = `
    Bạn là "Út Hương AI" - Cố vấn Tài chính Hụi chuyên sâu có hơn 30 năm kinh nghiệm đứng hụi cốt cán giáp ranh Vĩnh Long, Cần Thơ, Đồng Tháp.
    Hãy trả lời người hỏi bằng giọng miền Tây Nam Bộ cực kỳ mộc mạc, gần gũi, chân tình (sử dụng các từ ngữ thân thương như 'nghe hông', 'bà con ta', 'Út khuyên', 'đa quý', 'bể hụi', 'thảo hụi', 'hụi sống hụi chết').
    Nhưng bên trong lời khuyên phải chứa những phân tích tài chính dòng tiền cực kỳ trực quan, chặt chẽ, chỉ bảo họ cách quản lý nợ, đấu giá bao nhiêu là an toàn, cách xử lý khi hụi viên giật hụi sòng phẳng theo quy định pháp luật hình sự về họ, hụi, biêu, phường của Việt Nam.
  `;

  if (!aiClient) {
    const fallbackAnswer = `Nay Út Hương bận khui hụi bên xã Chùa Phật Ngọc rồi nên Út trả lời chung chung cho con nghe nhen. Chơi cái này quan trọng nhất là chữ Tín con ơi. Con hỏi '${prompt}' thì Út khuyên chân tình vầy: Bà con miền Tây mình cả đời lặn lội ruộng vườn, gửi gắm nhau ít đồng hụi đầu năm xây nhà mua xe, cho nên chủ hụi phải làm cuốn sổ biên nhận hụi pro rõ ràng, gửi biên nhận Zalo liền mỗi kỳ khui. Ai bỏ giá quá cao thì phải coi chừng kẹt tiền mới giật dột ngột vầy nghe chưa!`;
    return res.json({ answer: fallbackAnswer });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: baseInstruction
      }
    });
    res.json({ answer: response.text });
  } catch (err) {
    res.status(500).json({ error: "Lỗi bộ não cố vấn AI ngủ quên" });
  }
});

// ============================================
// COMPRESSED DATABASE GENERATION SQL ERD FOR PRODUCTION USE EXPORT
// ============================================
app.get("/api/erd-export", (req, res) => {
  const sqlSchema = `-- ============================================
-- SQL SCHEMA EXPORT - QUẢN LÝ HỤI PRO 2026
-- Thiết kế tối ưu hóa chuẩn Third Normal Form (3NF) trên PostgreSQL & Supabase
-- Sẵn sàng chịu tải hàng triệu hụi viên và đường dây giao dịch lớn.
-- ============================================

CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    reputation INT DEFAULT 90,
    risk_status VARCHAR(50) DEFAULT 'trusted',
    role VARCHAR(50) DEFAULT 'huivien',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS lines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    period_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    commission NUMERIC(15, 2) NOT NULL,
    total_periods INT NOT NULL,
    current_period INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    member_id VARCHAR(50) REFERENCES members(id) ON DELETE RESTRICT,
    alias VARCHAR(255),
    is_withdrawn BOOLEAN DEFAULT FALSE,
    withdrawn_period INT,
    bid_amount NUMERIC(15, 2),
    withdrawn_date DATE,
    total_paid NUMERIC(15, 2) DEFAULT 0,
    total_received NUMERIC(15, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS period_results (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    period INT NOT NULL,
    date DATE NOT NULL,
    winner_part_id VARCHAR(50) REFERENCES parts(id),
    winner_member_id VARCHAR(50) REFERENCES members(id),
    bid_amount NUMERIC(15, 2) NOT NULL,
    total_commission NUMERIC(15, 2) NOT NULL,
    total_withdrawn_cash NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'bidded'
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    period INT NOT NULL,
    part_id VARCHAR(50) REFERENCES parts(id) ON DELETE CASCADE,
    member_id VARCHAR(50) REFERENCES members(id),
    amount_to_pay NUMERIC(15, 2) NOT NULL,
    pay_type VARCHAR(20) NOT NULL, -- 'song' | 'chet'
    status VARCHAR(50) DEFAULT 'pending', -- 'paid' | 'pending' | 'overdue'
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'collect' | 'disburse' | 'commission' | 'expense'
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    line_id VARCHAR(50),
    period INT,
    member_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    operator VARCHAR(255)
);

-- Thêm hụi viên mẫu gốc
INSERT INTO members (id, name, phone, address, reputation, risk_status, role) VALUES 
('M001', 'Chị Sáu Trà Ôn', '0917654321', 'Huyện Trà Ôn, Vĩnh Long', 95, 'trusted', 'huivien'),
('M002', 'Cô Bảy Cai Lậy', '0982334455', 'Thị xã Cai Lậy, Tiền Giang', 88, 'trusted', 'huivien'),
('M003', 'Chú Năm Vĩnh Long', '0909123456', 'Phường 4, TP. Vĩnh Long', 92, 'trusted', 'huivien'),
('M007', 'Chủ Hụi Út Hương', '0911222333', 'Bình Minh, Vĩnh Long', 100, 'trusted', 'chuhui');
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(sqlSchema);
});

// ============================================
// GOOGLE SHEETS CLOUD SYNCHRONIZATION API
// ============================================

app.get("/api/sheets/config", (req, res) => {
  res.json({
    sheetId: db.sheetId || process.env.GOOGLE_SHEET_ID || "",
    appsScriptUrl: db.appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL || "",
    isConnected: !!(db.sheetId && db.appsScriptUrl),
    lastSynced: (db as any).lastSynced || null
  });
});

app.post("/api/sheets/config", async (req, res) => {
  const { sheetId, appsScriptUrl } = req.body;
  if (!sheetId || !appsScriptUrl) {
    return res.status(400).json({ error: "Thiếu thông tin kết nối Google Sheets." });
  }

  // Validate URL format
  if (!appsScriptUrl.startsWith("https://script.google.com/macros/s/")) {
    return res.status(400).json({ error: "Đường dẫn Apps Script API không hợp lệ. Phải bắt đầu bằng https://script.google.com/macros/s/" });
  }

  // Test Connection
  try {
    const testUrl = `${appsScriptUrl}?sheetId=${sheetId}&action=getAllData`;
    const response = await fetch(testUrl);
    const result = await response.json();

    if (result && (result.status === "success" || result.data)) {
      db.sheetId = sheetId;
      db.appsScriptUrl = appsScriptUrl;
      (db as any).lastSynced = new Date().toISOString();
      saveDatabase();
      addAuditLog("Cấu hình Google Sheets", `Kết nối thành công tới Sheet ID: ...${sheetId.slice(-8)}`);
      return res.json({ connected: true, message: "Kết nối thành công!" });
    } else {
      return res.status(400).json({ error: result.error || "Phản hồi lỗi từ Apps Script. Vui lòng kiểm tra quyền chia sẻ của Google Sheet." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: `Không thể kết nối tới Apps Script API: ${err.message}` });
  }
});

// Helper function to sync DB state to Google Sheets in the background
async function triggerAutoSyncToSheets() {
  if (db.sheetId && db.appsScriptUrl) {
    try {
      const formattedData = {
        Users: db.members.map(m => [m.id, m.name, m.phone, m.role, m.riskStatus, m.createdAt, m.address, m.notes || ""]),
        DayHui: db.lines.map(l => [l.id, l.name, l.value, l.totalPeriods, l.startDate, l.status, l.currentPeriod, l.commission]),
        ThanhVien: db.lines.flatMap(l => l.parts.map(p => {
          return [p.id, l.id, p.memberName, p.isWithdrawn ? "y" : "n", p.withdrawnPeriod || "", p.bidAmount || "", p.totalPaid, p.totalReceived, p.alias];
        })),
        DongHui: db.periodResults.flatMap(r => r.payments.map(py => {
          return [py.id, py.partId, py.period, py.amountToPay, py.paidAt || "", py.status];
        })),
        HotHui: db.periodResults.map(r => [r.id, r.winnerPartId, r.period, r.bidAmount, r.totalWithdrawnCash, r.winnerName, r.date]),
        CongNo: db.currentPayments.map(p => [p.id, p.partId, p.amountToPay, p.paidAt || "n/a", p.status]),
        ThuChi: db.transactions.map(t => [t.id, t.type, t.amount, t.description, t.date]),
        AuditLog: db.logs.map(l => [l.id, l.operator, l.action + " - " + l.details, l.timestamp])
      };

      const syncUrl = db.appsScriptUrl;
      const res = await fetch(syncUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId: db.sheetId,
          action: "syncAllData",
          data: formattedData
        })
      });
      const responseData = await res.json();
      if (responseData.status === "success") {
        console.log("[Google Sheets Sync] Auto-sync background post successful");
      }
    } catch (err) {
      console.error("[Google Sheets Sync] Background auto-sync failed:", err);
    }
  }
}

app.post("/api/sheets/sync-push", async (req, res) => {
  if (!db.sheetId || !db.appsScriptUrl) {
    return res.status(400).json({ error: "Cổng kết nối Google Sheets chưa được định cấu hình." });
  }

  try {
    const formattedData = {
      Users: db.members.map(m => [m.id, m.name, m.phone, m.role, m.riskStatus, m.createdAt, m.address, m.notes || ""]),
      DayHui: db.lines.map(l => [l.id, l.name, l.value, l.totalPeriods, l.startDate, l.status, l.currentPeriod, l.commission]),
      ThanhVien: db.lines.flatMap(l => l.parts.map(p => {
        return [p.id, l.id, p.memberName, p.isWithdrawn ? "y" : "n", p.withdrawnPeriod || "", p.bidAmount || "", p.totalPaid, p.totalReceived, p.alias];
      })),
      DongHui: db.periodResults.flatMap(r => r.payments.map(py => {
        return [py.id, py.partId, py.period, py.amountToPay, py.paidAt || "", py.status];
      })),
      HotHui: db.periodResults.map(r => [r.id, r.winnerPartId, r.period, r.bidAmount, r.totalWithdrawnCash, r.winnerName, r.date]),
      CongNo: db.currentPayments.map(p => [p.id, p.partId, p.amountToPay, p.paidAt || "n/a", p.status]),
      ThuChi: db.transactions.map(t => [t.id, t.type, t.amount, t.description, t.date]),
      AuditLog: db.logs.map(l => [l.id, l.operator, l.action + " - " + l.details, l.timestamp])
    };

    const response = await fetch(db.appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheetId: db.sheetId,
        action: "syncAllData",
        data: formattedData
      })
    });

    const result = await response.json();
    if (result && result.status === "success") {
      (db as any).lastSynced = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); // force save to capture timestamp
      addAuditLog("Ghi đè Google Sheets", "Kích hoạt đồng bộ hóa dữ liệu cục bộ lên đám mây thành công.");
      return res.json({ success: true, message: "Đồng bộ thành công!" });
    } else {
      return res.status(400).json({ error: result.error || "Gặp sự cố khi ghi dữ liệu lên Google Sheets." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: `Không thể hoàn tất kết nối tải ghi Sheets: ${err.message}` });
  }
});

app.post("/api/sheets/sync-pull", async (req, res) => {
  if (!db.sheetId || !db.appsScriptUrl) {
    return res.status(400).json({ error: "Cổng kết nối Google Sheets chưa được định cấu hình." });
  }

  try {
    const pullUrl = `${db.appsScriptUrl}?sheetId=${db.sheetId}&action=getAllData`;
    const response = await fetch(pullUrl);
    const result = await response.json();

    if (result && result.status === "success" && result.data) {
      const s = result.data;

      // Reconstruct members (Users)
      if (Array.isArray(s.Users) && s.Users.length > 0) {
        db.members = s.Users.map((u: any) => ({
          id: u.ID || u.id || `M_${Date.now()}`,
          name: u.HoTen || u.name || "Vô danh",
          phone: u.SoDienThoai || u.phone || "",
          address: u.address || u.DiaChi || u.DiaChi || "Chưa xác định",
          reputation: Number(u.reputation) || 90,
          riskStatus: u.TrangThai || u.riskStatus || "trusted",
          createdAt: u.CreatedAt || u.createdAt || new Date().toISOString(),
          notes: u.notes || "",
          role: u.VaiTro || u.role || "huivien"
        }));
      }

      // Reconstruct lines (DayHui) & parts (ThanhVien)
      if (Array.isArray(s.DayHui)) {
        db.lines = s.DayHui.map((l: any) => {
          const lineId = l.ID || l.id;
          
          // filter matching parts for this line from ThanhVien sheet
          const matchingParts = Array.isArray(s.ThanhVien) 
            ? s.ThanhVien.filter((p: any) => p.DayHuiID === lineId || p.lineId === lineId).map((p: any) => ({
                id: p.ID || p.id,
                lineId: lineId,
                memberId: p.memberId || "M007",
                memberName: p.HoTen || p.memberName || "Vắng danh",
                alias: p.Alias || p.alias || "Phần hụi",
                isWithdrawn: p.IsWithdrawn === "y" || p.IsWithdrawn === "true" || p.IsWithdrawn === true || p.isWithdrawn === true,
                withdrawnPeriod: p.WithdrawnPeriod ? Number(p.WithdrawnPeriod) : null,
                bidAmount: p.BidAmount ? Number(p.BidAmount) : null,
                withdrawnDate: p.withdrawnDate || null,
                totalPaid: Number(p.TotalPaid) || 0,
                totalReceived: Number(p.TotalReceived) || 0
              }))
            : [];

          return {
            id: lineId,
            name: l.TenDayHui || l.name || "Dây hụi đại chúng",
            value: Number(l.GiaTriPhan) || Number(l.value) || 1000000,
            periodType: l.periodType || "month",
            startDate: l.NgayMo || l.startDate || new Date().toISOString().split('T')[0],
            commission: Number(l.Commission) || Number(l.commission) || 500000,
            totalPeriods: Number(l.SoPhan) || Number(l.totalPeriods) || matchingParts.length || 10,
            currentPeriod: Number(l.KyHienTai) || Number(l.currentPeriod) || 1,
            status: l.TrangThai || l.status || "active",
            parts: matchingParts,
            createdAt: l.CreatedAt || l.createdAt || new Date().toISOString()
          };
        });
      }

      // Reconstruct periodResults (HotHui & DongHui payments)
      if (Array.isArray(s.HotHui)) {
        db.periodResults = s.HotHui.map((h: any) => {
          const resultId = h.ID || h.id;
          const matchedPart = db.lines.flatMap(l => l.parts).find(pt => pt.id === h.ThanhVienID);
          const lineId = matchedPart?.lineId || "";
          const lineName = db.lines.find(lin => lin.id === lineId)?.name || "Dây hụi";

          // filter payments belonging to this period & line
          const resultPayments = Array.isArray(s.DongHui)
            ? s.DongHui.filter((py: any) => (py.lineId === lineId || py.id.includes(lineId)) && Number(py.KyHui) === Number(h.KyHot)).map((py: any) => ({
                id: py.ID || py.id,
                lineId: lineId,
                lineName: lineName,
                period: Number(py.KyHui),
                partId: py.ThanhVienID,
                memberId: py.memberId || "",
                memberName: py.memberName || "Hụi viên",
                alias: py.alias || "Biên đóng",
                amountToPay: Number(py.SoTien),
                payType: py.payType || "song",
                status: py.TrangThai || py.status || "paid",
                paidAt: py.NgayDong || null
              }))
            : [];

          return {
            id: resultId,
            lineId: lineId,
            lineName: lineName,
            period: Number(h.KyHot),
            date: h.Date || new Date().toISOString().split('T')[0],
            winnerPartId: h.ThanhVienID,
            winnerMemberId: matchedPart?.memberId || "",
            winnerName: h.WinnerName || matchedPart?.memberName || "Người thắng",
            winnerAlias: matchedPart?.alias || "Phần thắng",
            bidAmount: Number(h.GiaBoHui) || 0,
            totalCommission: Number(db.lines.find(l => l.id === lineId)?.commission || 0),
            totalWithdrawnCash: Number(h.TienThucNhan) || 0,
            status: h.status || 'bidded',
            payments: resultPayments
          };
        });
      }

      // Reconstruct currentPayments (CongNo)
      if (Array.isArray(s.CongNo)) {
        db.currentPayments = s.CongNo.map((p: any) => {
          const matchedPart = db.lines.flatMap(l => l.parts).find(pt => pt.id === p.ThanhVienID);
          const lineId = matchedPart?.lineId || "";
          const line = db.lines.find(lin => lin.id === lineId);
          return {
            id: p.ID || p.id,
            lineId: lineId,
            lineName: line?.name || "Dây hụi",
            period: line?.currentPeriod || 1,
            partId: p.ThanhVienID,
            memberId: matchedPart?.memberId || "M001",
            memberName: matchedPart?.memberName || "Hụi viên",
            alias: matchedPart?.alias || "Phần",
            amountToPay: Number(p.SoTienNo),
            payType: p.payType || 'song',
            status: p.TrangThai || p.status || 'pending',
            paidAt: p.HanThanhToan !== "n/a" ? p.HanThanhToan : null
          };
        });
      }

      // Reconstruct transactions (ThuChi)
      if (Array.isArray(s.ThuChi)) {
        db.transactions = s.ThuChi.map((t: any) => ({
          id: t.ID || t.id,
          type: t.Loai || t.type,
          amount: Number(t.SoTien) || Number(t.amount) || 0,
          date: t.NgayGiaoDich || t.date || new Date().toISOString().split('T')[0],
          description: t.NoiDung || t.description || ""
        }));
      }

      // Reconstruct logs (AuditLog)
      if (Array.isArray(s.AuditLog)) {
        db.logs = s.AuditLog.map((l: any) => {
          const rawAct = l.HanhDong || l.action || "Ghi nhận nghiệp vụ";
          return {
            id: l.ID || l.id,
            timestamp: l.ThoiGian || l.timestamp || new Date().toISOString(),
            action: rawAct.includes(" - ") ? rawAct.split(" - ")[0] : rawAct,
            details: rawAct.includes(" - ") ? rawAct.split(" - ")[1] : rawAct,
            operator: l.UserID || l.operator || "Hệ thống"
          };
        });
      }

      (db as any).lastSynced = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); // Force save latest pulldown data
      addAuditLog("Đồng bộ Google Sheets", "Kéo thành công dữ liệu đám mây về đè lên hệ thống cục bộ.");
      return res.json({ success: true, recordsCount: (db.members.length + db.lines.length) });
    } else {
      return res.status(400).json({ error: result.error || "Gặp sự cố khi đọc dữ liệu từ tệp Google Sheets." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: `Lỗi bất ngờ khi kết nối dịch vụ API: ${err.message}` });
  }
});

// Configure Vite integration for preview / production bundles
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode Vite Middleware Injected
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Hụi Pro Server] Running with Development Vite Middleware Active");
  } else {
    // Production Assets Served
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Hụi Pro Server] Running in Production Static Asset Port Mode");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=================================================`);
    console.log(`🚀 HUIPRO 2026 SERVER IS ONLINE ON PORT ${PORT}`);
    console.log(`🔗 Interface available: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
