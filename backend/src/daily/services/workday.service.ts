import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { LeaveStatus } from '@prisma/client';

@Injectable()
export class WorkdayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Menghitung hari kerja sebelumnya (previousWorkday) untuk suatu user (FR-11 & DEC-013).
   * Melompati:
   * 1. Akhir pekan (Sabtu & Minggu)
   * 2. Hari libur nasional resmi (company_holidays)
   * 3. Cuti yang disetujui (leave_requests berstatus APPROVED)
   */
  async getPreviousWorkday(userId: string, fromDate?: Date): Promise<string> {
    const curDate = fromDate ? new Date(fromDate) : this.clockService.now();
    let scan = new Date(curDate);
    // Mundur 1 hari dari target
    scan.setDate(scan.getDate() - 1);

    // Ambil daftar libur perusahaan dalam 30 hari ke belakang
    const minScanDate = new Date(curDate);
    minScanDate.setDate(minScanDate.getDate() - 30);

    const [holidays, approvedLeaves] = await Promise.all([
      this.prisma.companyHoliday.findMany({
        where: {
          holidayDate: { gte: minScanDate, lte: curDate },
        },
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          userId,
          status: LeaveStatus.APPROVED,
          startDate: { lte: curDate },
          endDate: { gte: minScanDate },
        },
      }),
    ]);

    const holidayDates = new Set(
      holidays.map((h) => h.holidayDate.toISOString().split('T')[0]),
    );

    // Loop mundur maksimal 30 hari kalender
    for (let i = 0; i < 30; i++) {
      const dayOfWeek = scan.getDay(); // 0 = Minggu, 6 = Sabtu
      const dateStr = scan.toISOString().split('T')[0];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDates.has(dateStr);
      const isApprovedLeave = approvedLeaves.some((l) => {
        const start = l.startDate.toISOString().split('T')[0];
        const end = l.endDate.toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end;
      });

      if (!isWeekend && !isHoliday && !isApprovedLeave) {
        return dateStr;
      }

      scan.setDate(scan.getDate() - 1);
    }

    // Fallback: 1 hari sebelum jika tidak ada batas ditemukan
    const fallback = new Date(curDate);
    fallback.setDate(fallback.getDate() - 1);
    return fallback.toISOString().split('T')[0];
  }

  /**
   * Memeriksa apakah suatu tanggal merupakan hari kerja resmi (bukan libur/weekend/cuti).
   */
  async isWorkday(date: Date, userId?: string): Promise<boolean> {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    const dateStr = date.toISOString().split('T')[0];
    const holiday = await this.prisma.companyHoliday.findFirst({
      where: { holidayDate: new Date(dateStr) },
    });
    if (holiday) return false;

    if (userId) {
      const leave = await this.prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: LeaveStatus.APPROVED,
          startDate: { lte: new Date(dateStr) },
          endDate: { gte: new Date(dateStr) },
        },
      });
      if (leave) return false;
    }

    return true;
  }
}

