import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/tools';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttendanceDto) {
    try {
      // 1. Guruh kunlarini tekshirish (Validation)
      const group = await this.prisma.gROUP.findUnique({
        where: { id: data.groupId },
        select: { days: true },
      });

      if (group?.days) {
        const attendanceDate = data.date ? new Date(data.date) : new Date();
        const dayOfWeek = attendanceDate.getDay(); // 0 (Sun) - 6 (Sat)
        const allowedDays = group.days.split(',').map((d) => Number(d.trim()));

        if (!allowedDays.includes(dayOfWeek)) {
          throw new HttpException(
            `Bu guruhda haftaning bu kunida dars yo'q! (Ruxsat etilgan: ${group.days})`,
            400,
          );
        }
      }

      // 2. Upsert (Agar bor bo'lsa yangilash, yo'q bo'lsa yaratish - Duplicate check)
      const targetDate = data.date ? new Date(data.date) : new Date();
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const existing = await this.prisma.aTTENDANCE.findFirst({
        where: {
          groupId: data.groupId,
          studentId: data.studentId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (existing) {
        return this.update(existing.id, { status: data.status });
      }

      const newAttendance = await this.prisma.aTTENDANCE.create({
        data: {
          status: data.status,
          date: data.date ? new Date(data.date) : new Date(),
          group: { connect: { id: data.groupId } },
          student: { connect: { id: data.studentId } },
        },
        include: {
          group: true,
          student: true,
        },
      });

      return newAttendance;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Gruppa yoki Talaba topilmadi!');
      }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Davomat yaratishda xatolik!');
    }
  }

  async bulkCreate(data: {
    groupId: string;
    date: string;
    records: { studentId: string; status: any }[];
  }) {
    const results: any[] = [];
    for (const record of data.records) {
      const res = await this.create({
        groupId: data.groupId,
        date: data.date,
        studentId: record.studentId,
        status: record.status,
      });
      results.push(res);
    }
    return results;
  }

  async findAll(query: any) {
    const {
      groupId,
      studentId,
      status,
      date,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(groupId && { groupId }),
      ...(studentId && { studentId }),
      ...(status && { status }),
      ...(date && {
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      }),
    };

    try {
      const attendances = await this.prisma.aTTENDANCE.findMany({
        where,
        include: {
          group: true,
          student: true,
        },
        orderBy: sortBy ? { [sortBy]: sortOrder } : { date: 'desc' },
        skip,
        take,
      });

      const total = await this.prisma.aTTENDANCE.count({ where });

      return {
        data: attendances,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      throw new InternalServerErrorException('Davomatlarni olishda xatolik!');
    }
  }

  async findByStudent(studentId: string, query: any) {
    try {
      const { page = 1, limit = 10 } = query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new NotFoundException('Talaba topilmadi!');
      }

      const [attendances, total] = await Promise.all([
        this.prisma.aTTENDANCE.findMany({
          where: { studentId },
          include: {
            group: {
              select: { name: true, courseType: true },
            },
          },
          orderBy: { date: 'desc' },
          skip,
          take,
        }),
        this.prisma.aTTENDANCE.count({ where: { studentId } }),
      ]);

      return {
        data: attendances,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Talaba davomatlarini olishda xatolik!',
      );
    }
  }

  async update(id: number, data: UpdateAttendanceDto) {
    try {
      return await this.prisma.aTTENDANCE.update({
        where: { id: Number(id) },
        data: {
          status: data.status,
          ...(data.date && { date: new Date(data.date) }),
          ...(data.groupId && { group: { connect: { id: data.groupId } } }),
          ...(data.studentId && {
            student: { connect: { id: data.studentId } },
          }),
        },
        include: {
          group: true,
          student: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('Davomat topilmadi!');
      throw new InternalServerErrorException('Davomatni yangilashda xatolik!');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.aTTENDANCE.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('Davomat topilmadi!');
      throw new InternalServerErrorException('Davomatni o’chirishda xatolik!');
    }
  }
}
