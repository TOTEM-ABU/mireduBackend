import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { MailService, PrismaService } from 'src/tools';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp';
import { LoginDto } from './dto/login.dto';
import { UpdateDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailer: MailService,
  ) {}

  async findAllStudent(query: any) {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      parentsPhoneNumber,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(firstName && {
        firstName: {
          contains: firstName,
        },
      }),
      ...(lastName && {
        lastName: {
          contains: lastName,
        },
      }),
      ...(email && {
        email: {
          contains: email,
        },
      }),
      ...(phoneNumber && {
        phoneNumber: {
          contains: phoneNumber,
        },
      }),
      ...(parentsPhoneNumber && {
        parentsPhoneNumber: {
          contains: parentsPhoneNumber,
        },
      }),
    };

    try {
      const user = await this.prisma.sTUDENT.findMany({
        where,
        include: {
          groups: true,
        },
        ...(sortBy ? { orderBy: { [sortBy]: sortOrder } } : {}),
        skip,
        take,
      });

      const total = await this.prisma.sTUDENT.count({ where });

      return {
        data: user,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error in get students!');
    }
  }

  async findAllTeacher(query: any) {
    const {
      name,
      email,
      phoneNumber,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(name && {
        name: {
          contains: name,
        },
      }),
      ...(email && {
        email: {
          contains: email,
        },
      }),
      ...(phoneNumber && {
        phoneNumber: {
          contains: phoneNumber,
        },
      }),
    };

    try {
      const teachers = await this.prisma.tEACHER.findMany({
        where,
        include: {
          groups: true,
        },
        ...(sortBy ? { orderBy: { [sortBy]: sortOrder } } : {}),
        skip,
        take,
      });

      const total = await this.prisma.tEACHER.count({ where });

      return {
        data: teachers,
        total,
        page: Number(page),
        limit: take,
        lastPage: Math.ceil(total / take),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error in get teachers!');
    }
  }

  private generateOTP(length = 6): string {
    try {
      const digits = '0123456789';
      let otpCode = '';
      for (let i = 0; i < length; i++) {
        otpCode += digits[Math.floor(Math.random() * 10)];
      }
      return otpCode;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Cannot generate otp!');
    }
  }

  async registerStudent(data: CreateStudentDto) {
    const existingStudent = await this.prisma.sTUDENT.findFirst({
      where: { email: data.email },
    });

    if (existingStudent) {
      throw new ConflictException('Student already exists!');
    }

    const hash = bcrypt.hashSync(data.password, 10);
    const otp = this.generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Build prisma data — exclude avatar if not provided
    const studentData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hash,
      phoneNumber: data.phoneNumber,
      parentsPhoneNumber: data.parentsPhoneNumber,
      otpCode: hashedOtp,
      otpExpires: otpExpires,
    };
    if (data.avatar) studentData.avatar = data.avatar;

    let newUser: any;
    try {
      newUser = await this.prisma.sTUDENT.create({ data: studentData });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to create student: ' + error.message,
      );
    }

    // Send OTP email — do NOT block registration if mail fails
    try {
      await this.mailer.sendMail(
        data.email,
        'Your OTP Code',
        `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
      );
    } catch (mailError) {
      console.warn(
        '[MailService] Failed to send OTP email:',
        mailError?.message,
      );
      // Log but don't throw — user is already created
    }

    return newUser;
  }

  async registerTeacher(data: CreateTeacherDto) {
    const existingTeacher = await this.prisma.tEACHER.findFirst({
      where: { email: data.email },
    });

    if (existingTeacher) {
      throw new ConflictException('Teacher already exists!');
    }

    const hash = bcrypt.hashSync(data.password, 10);
    const otp = this.generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Build prisma data — exclude avatar if not provided
    const teacherData: any = {
      name: data.name,
      email: data.email,
      password: hash,
      phoneNumber: data.phoneNumber,
      otpCode: hashedOtp,
      otpExpires: otpExpires,
    };
    if (data.avatar) teacherData.avatar = data.avatar;

    let newUser: any;
    try {
      newUser = await this.prisma.tEACHER.create({ data: teacherData });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to create teacher: ' + error.message,
      );
    }

    try {
      await this.mailer.sendMail(
        data.email,
        'Your OTP Code',
        `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
      );
    } catch (mailError) {
      console.warn(
        '[MailService] Failed to send OTP email:',
        mailError?.message,
      );
    }

    return newUser;
  }

  async registerAdmin(data: CreateAdminDto) {
    const existingUser = await this.prisma.aDMIN.findFirst({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    const hash = bcrypt.hashSync(data.password, 10);
    const otp = this.generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Build prisma data — exclude avatar if not provided
    const adminData: any = {
      name: data.name,
      email: data.email,
      password: hash,
      otpCode: hashedOtp,
      otpExpires: otpExpires,
    };
    if (data.avatar) adminData.avatar = data.avatar;

    let newUser: any;
    try {
      newUser = await this.prisma.aDMIN.create({ data: adminData });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to create admin: ' + error.message,
      );
    }

    try {
      await this.mailer.sendMail(
        data.email,
        'Your OTP Code',
        `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
      );
    } catch (mailError) {
      console.warn(
        '[MailService] Failed to send OTP email:',
        mailError?.message,
      );
    }

    return newUser;
  }

  async verifyOtp(data: VerifyOtpDto) {
    try {
      const { email, otp } = data;
      let user: any = null;
      let userType: 'sTUDENT' | 'tEACHER' | 'aDMIN' | null = null;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { email },
      });
      if (student) {
        user = student;
        userType = 'sTUDENT';
      } else {
        const teacher = await this.prisma.tEACHER.findUnique({
          where: { email },
        });
        if (teacher) {
          user = teacher;
          userType = 'tEACHER';
        } else {
          const admin = await this.prisma.aDMIN.findUnique({
            where: { email },
          });
          if (admin) {
            user = admin;
            userType = 'aDMIN';
          }
        }
      }

      if (!user || !userType) throw new NotFoundException('User not found!');
      if (user.isVerified) return { message: 'User already verified!' };

      if (new Date() > user.otpExpires) {
        console.log(
          `[verifyOtp ${email}] OTP expired. Current: ${new Date()}, Expires: ${user.otpExpires}`,
        );
        throw new BadRequestException('OTP expired! Please resend.');
      }
      console.log(
        `[verifyOtp ${email}] Comparing entered OTP '${otp}' with hash '${user.otpCode}'`,
      );
      const isOtpValid = await bcrypt.compare(otp, user.otpCode);
      if (!isOtpValid) {
        console.log(`[verifyOtp ${email}] Password match failed.`);
        throw new BadRequestException('Invalid OTP code!');
      }

      await (this.prisma[userType] as any).update({
        where: { id: user.id },
        data: {
          isVerified: true,
          otpCode: null,
          otpExpires: null,
        },
      });

      return { message: 'Email verified successfully! ✅' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to verify OTP!');
    }
  }
  async resendOtp(data: ResendOtpDto) {
    try {
      const { email } = data;
      let user: any = null;
      let userType: 'sTUDENT' | 'tEACHER' | 'aDMIN' | null = null;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { email },
      });
      if (student) {
        user = student;
        userType = 'sTUDENT';
      } else {
        const teacher = await this.prisma.tEACHER.findUnique({
          where: { email },
        });
        if (teacher) {
          user = teacher;
          userType = 'tEACHER';
        } else {
          const admin = await this.prisma.aDMIN.findUnique({
            where: { email },
          });
          if (admin) {
            user = admin;
            userType = 'aDMIN';
          }
        }
      }

      if (!user || !userType) {
        throw new NotFoundException('User not found!');
      }
      if (user.isVerified) {
        throw new BadRequestException('User is already verified!');
      }

      const otp = this.generateOTP();
      console.log(`[resendOtp ${email}] GENERATED NEW OTP:`, otp);
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      // Save new OTP
      await (this.prisma[userType] as any).update({
        where: { id: user.id },
        data: { otpCode: hashedOtp, otpExpires },
      });

      // Try sending mail
      try {
        await this.mailer.sendMail(
          data.email,
          'Your New OTP Code',
          `Your new OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
        );
      } catch (mailError) {
        console.warn(
          '[MailService] Failed to resend OTP email:',
          mailError?.message,
        );
      }

      return { message: 'OTP sent successfully!' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to resend OTP!');
    }
  }
  async login(data: LoginDto, request: Request) {
    try {
      const { email, password } = data;
      let user: any = null;
      let userType: 'sTUDENT' | 'tEACHER' | 'aDMIN' | null = null;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { email },
      });
      if (student) {
        user = student;
        userType = 'sTUDENT';
      } else {
        const teacher = await this.prisma.tEACHER.findUnique({
          where: { email },
        });
        if (teacher) {
          user = teacher;
          userType = 'tEACHER';
        } else {
          const admin = await this.prisma.aDMIN.findUnique({
            where: { email },
          });
          if (admin) {
            user = admin;
            userType = 'aDMIN';
          }
        }
      }

      if (!user || !userType) {
        throw new NotFoundException('User not found!');
      }

      if (!user.isVerified) {
        throw new BadRequestException('Please verify your email first!');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new BadRequestException('Wrong credentials!');
      }

      const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
      };

      const access_token = this.jwt.sign(payload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '15m',
      });

      const refresh_token = this.jwt.sign(payload, {
        secret: process.env.REFRESH_SECRET,
        expiresIn: '7d',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.sESSION.create({
        data: {
          studentId: userType === 'sTUDENT' ? user.id : null,
          token: refresh_token,
          ipAddress: request.ip || '0.0.0.0',
          expiresAt: expiresAt,
          deviceInfo: (request.headers['user-agent'] as string) || 'unknown',
        },
      });

      const dbModel = this.prisma[userType] as any;
      await dbModel.update({
        where: { id: user.id },
        data: { refreshToken: refresh_token },
      });

      await this.mailer.sendMail(
        user.email,
        'New Login Detected',
        `You have successfully logged in at ${new Date().toLocaleString()} ✅`,
      );

      return {
        access_token,
        refresh_token,
        role: user.role,
        user: {
          id: user.id,
          firstName: user.firstName || user.name,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error in login:', error);
      throw new InternalServerErrorException('Failed to login!');
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    try {
      const { oldPassword, newPassword } = dto;
      let user: any = null;
      let userType: 'sTUDENT' | 'tEACHER' | 'aDMIN' | null = null;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { id: userId },
      });
      if (student) {
        user = student;
        userType = 'sTUDENT';
      } else {
        const teacher = await this.prisma.tEACHER.findUnique({
          where: { id: userId },
        });
        if (teacher) {
          user = teacher;
          userType = 'tEACHER';
        } else {
          const admin = await this.prisma.aDMIN.findUnique({
            where: { id: userId },
          });
          if (admin) {
            user = admin;
            userType = 'aDMIN';
          }
        }
      }

      if (!user || !userType) throw new NotFoundException('User not found!');

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Old password is incorrect!');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const dbModel = this.prisma[userType] as any;
      await dbModel.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      await this.mailer.sendMail(
        user.email,
        'Password Changed',
        'Your password has been successfully updated. If this wasnt you, please contact support immediately! ⚠️',
      );

      return { message: 'Password updated successfully! ✅' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update password!');
    }
  }

  async refreshAccessToken(data: RefreshTokenDto) {
    try {
      const payload = this.jwt.verify(data.refresh_token, {
        secret: process.env.REFRESH_SECRET,
      });

      if (!payload || !payload.id) {
        throw new BadRequestException('Invalid token payload!');
      }

      let user: any = null;
      let userType: 'sTUDENT' | 'tEACHER' | 'aDMIN' | null = null;

      const student = await this.prisma.sTUDENT.findUnique({
        where: { id: payload.id },
      });
      if (student) {
        user = student;
        userType = 'sTUDENT';
      } else {
        const teacher = await this.prisma.tEACHER.findUnique({
          where: { id: payload.id },
        });
        if (teacher) {
          user = teacher;
          userType = 'tEACHER';
        } else {
          const admin = await this.prisma.aDMIN.findUnique({
            where: { id: payload.id },
          });
          if (admin) {
            user = admin;
            userType = 'aDMIN';
          }
        }
      }

      if (!user || user.refreshToken !== data.refresh_token) {
        throw new BadRequestException(
          'Invalid refresh token or user not found!',
        );
      }

      const newPayload = {
        id: user.id,
        role: user.role,
        email: user.email,
      };

      const newAccessToken = this.jwt.sign(newPayload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '15m',
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError'
      ) {
        throw new BadRequestException(
          'Refresh token expired or invalid. Please login again.',
        );
      }

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Failed to refresh access token!');
    }
  }

  async updateUser(id: string, role: string, data: UpdateDto) {
    try {
      const modelMap = {
        STUDENT: 'sTUDENT',
        TEACHER: 'tEACHER',
        ADMIN: 'aDMIN',
      };

      const prismaModel = modelMap[role];
      if (!prismaModel) throw new BadRequestException('Invalid role!');

      const { password, ...updateData } = data;

      const updatedUser = await (this.prisma[prismaModel] as any).update({
        where: { id },
        data: updateData,
      });

      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found!');
      }
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Failed to update user!');
    }
  }

  async deleteUser(id: string, role: string) {
    try {
      const modelMap = {
        STUDENT: 'sTUDENT',
        TEACHER: 'tEACHER',
        ADMIN: 'aDMIN',
      };

      const prismaModel = modelMap[role];
      if (!prismaModel) throw new BadRequestException('Invalid role!');

      const deletedUser = await (this.prisma[prismaModel] as any).delete({
        where: { id },
      });

      return { message: 'Account deleted successfully', deletedUser };
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('User not found!');
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete user!');
    }
  }

  async getMe(id: string, role: string) {
    try {
      const modelMap = {
        STUDENT: 'sTUDENT',
        TEACHER: 'tEACHER',
        ADMIN: 'aDMIN',
      };

      const prismaModel = modelMap[role];
      if (!prismaModel) throw new BadRequestException('Invalid role!');

      const user = await (this.prisma[prismaModel] as any).findUnique({
        where: { id },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found!');
      }
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Failed to get user!');
    }
  }
}
