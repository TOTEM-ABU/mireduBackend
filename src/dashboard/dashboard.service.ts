import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../tools';
import { startOfMonth, subDays, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    try {
      const [totalStudents, totalGroups, payments] = await Promise.all([
        this.prisma.sTUDENT.count(),
        this.prisma.gROUP.count(),
        this.prisma.pAYMENT.findMany({
          where: {
            status: 'PAID',
            date: { gte: startOfMonth(new Date()) },
          },
          select: { amount: true },
        }),
      ]);

      const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      return {
        totalStudents,
        totalGroups,
        monthlyRevenue,
      };
    } catch (error) {
      throw new InternalServerErrorException('Stats olishda xatolik!');
    }
  }

  async getChartData() {
    try {
      // Last 7 days attendance
      const last7Days = Array.from({ length: 7 }, (_, i) =>
        subDays(new Date(), i),
      ).reverse();

      const attendanceStats = await Promise.all(
        last7Days.map(async (date) => {
          const start = new Date(date).setHours(0, 0, 0, 0);
          const end = new Date(date).setHours(23, 59, 59, 999);

          const [present, total] = await Promise.all([
            this.prisma.aTTENDANCE.count({
              where: {
                date: { gte: new Date(start), lt: new Date(end) },
                status: 'PRESENT',
              },
            }),
            this.prisma.aTTENDANCE.count({
              where: { date: { gte: new Date(start), lt: new Date(end) } },
            }),
          ]);

          return {
            name: format(date, 'EEE'),
            percentage: total === 0 ? 0 : Math.round((present / total) * 100),
          };
        }),
      );

      // Payment dynamics (last 6 months - simplified for now)
      const paymentDynamics = [
        { name: 'Jan', amount: 4000 },
        { name: 'Feb', amount: 3000 },
        { name: 'Mar', amount: 5000 },
        { name: 'Apr', amount: 4500 },
      ];

      return {
        attendance: attendanceStats,
        payments: paymentDynamics,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Chart ma'lumotlarini olishda xatolik!",
      );
    }
  }

  async getRecentActions() {
    try {
      const [recentStudents, recentPayments] = await Promise.all([
        this.prisma.sTUDENT.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.pAYMENT.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: { student: { select: { firstName: true, lastName: true } } },
        }),
      ]);

      return {
        students: recentStudents,
        payments: recentPayments,
      };
    } catch (error) {
      throw new InternalServerErrorException('Recent actions olishda xatolik!');
    }
  }
}
