import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/tools';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentDto) {
    try {
      return await this.prisma.pAYMENT.create({
        data: {
          amount: data.amount,
          paymentType: data.paymentType,
          status: data.status,
          date: data.date ? new Date(data.date) : new Date(),
          student: { connect: { id: data.studentId } },
        },
        include: { student: true },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('Talaba topilmadi!');
      throw new InternalServerErrorException('To’lov yaratishda xatolik!');
    }
  }

  async findAll(query: any) {
    const {
      studentId,
      status,
      paymentType,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(studentId && { studentId }),
      ...(status && { status }),
      ...(paymentType && { paymentType }),
    };

    try {
      const [payments, total] = await Promise.all([
        this.prisma.pAYMENT.findMany({
          where,
          include: { student: true },
          orderBy: sortBy ? { [sortBy]: sortOrder } : { date: 'desc' },
          skip,
          take,
        }),
        this.prisma.pAYMENT.count({ where }),
      ]);

      return {
        data: payments,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      throw new InternalServerErrorException('To’lovlarni olishda xatolik!');
    }
  }

  async findByStudent(studentId: string, query: any) {
    try {
      const { page = 1, limit = 10 } = query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const [payments, total] = await Promise.all([
        this.prisma.pAYMENT.findMany({
          where: { studentId },
          orderBy: { date: 'desc' },
          skip,
          take,
        }),
        this.prisma.pAYMENT.count({ where: { studentId } }),
      ]);

      return {
        data: payments,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Talaba to’lovlarini olishda xatolik!',
      );
    }
  }

  async update(id: number, data: UpdatePaymentDto) {
    try {
      return await this.prisma.pAYMENT.update({
        where: { id: Number(id) },
        data: {
          amount: data.amount,
          status: data.status,
          paymentType: data.paymentType,
          ...(data.studentId && {
            student: { connect: { id: data.studentId } },
          }),
        },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('To’lov topilmadi!');
      throw new InternalServerErrorException('To’lovni yangilashda xatolik!');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.pAYMENT.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new InternalServerErrorException('To’lovni o’chirishda xatolik!');
    }
  }
}
