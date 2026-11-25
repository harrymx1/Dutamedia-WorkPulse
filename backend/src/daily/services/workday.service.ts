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
   * 3. Cuti resmi tercatat (leave_requests berstatus APPROVED)
   * 4. Dispensasi resmi tercatat (bounded_exemptions)
   */
  async getPreviousWorkday(userId: string, fromDate?: Date): Promise<string> {
    const curDate = fromDate ? new Date(fromDate) : this.clockService.now();
    let scan = new Date(curDate);
    // Mundur 1 hari dari target
    scan.setDate(scan.getDate() - 1);

    // Ambil daftar libur perusahaan, cuti resmi, & dispensasi dalam 30 hari ke belakang
    const minScanDate = new Date(curDate);
    minScanDate.setDate(minScanDate.getDate() - 30);

    const [holidays, approvedLeaves, boundedExemptions] = await Promise.all([
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
      (this.prisma as any).boundedExemption?.findMany
        ? (this.prisma as any).boundedExemption.findMany({
            where: {
              userId,
              startDate: { lte: curDate },
              OR: [{ endDate: null }, { endDate: { gte: minScanDate } }],
            },
          })
        : Promise.resolve([]),
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
      const isApprovedLeave = (approvedLeaves || []).some((l) => {
        const start = new Date(l.startDate).toISOString().split('T')[0];
        const end = new Date(l.endDate).toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end;
      });
      const isExempted = (boundedExemptions || []).some((ex: any) => {
        const start = new Date(ex.startDate).toISOString().split('T')[0];
        const end = ex.endDate ? new Date(ex.endDate).toISOString().split('T')[0] : null;
        return dateStr >= start && (!end || dateStr <= end);
      });

      if (!isWeekend && !isHoliday && !isApprovedLeave && !isExempted) {
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
   * Memeriksa apakah suatu tanggal merupakan hari kerja resmi (bukan libur/weekend/cuti/dispensasi).
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
      const targetDate = new Date(dateStr);
      const leave = await this.prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: LeaveStatus.APPROVED,
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
      });
      if (leave) return false;

      if ((this.prisma as any).boundedExemption?.findFirst) {
        const exemption = await (this.prisma as any).boundedExemption.findFirst({
          where: {
            userId,
            startDate: { lte: targetDate },
            OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
          },
        });
        if (exemption) return false;
      }
    }

    return true;
  }
}

