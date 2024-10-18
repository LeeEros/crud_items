import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const encryptedPassword = await hash(createUserDto.password, 10);
      const userCreated = await this.prisma.users.create({
        data: {
          ...createUserDto,
          password: encryptedPassword,
        },
      });

      return userCreated;
    } catch (error) {
      console.error('Erro ao criar o usuário:', error);
      throw new Error('Erro ao criar o usuário. Tente novamente mais tarde.');
    }
  }

  async findAll() {
    return await this.prisma.users.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    return await this.prisma.users.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<string> {
    try {
      const user = await this.prisma.users.delete({
        where: { id },
      });

      return `O usuário com ID #${id} foi removido com sucesso.`;
    } catch (error) {
      if (error.code === 'P2025') {
        return `Erro: Usuário com ID #${id} não foi encontrado.`;
      }
      return `Erro ao remover o usuário com ID #${id}: ${error.message}`;
    }
  }
}
