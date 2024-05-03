import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from './dto/signin.dto';
import { UserRepository } from 'src/shared/database/repositories/users.repository';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signin(signDto: SigninDto) {
    const { email, password } = signDto;

    const user = await this.userRepository.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`Invalid crendentials`);
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(`Invalid crendentials`);
    }

    const accessToken = await this.generateToken(user.id);

    return {
      access_token: accessToken,
    };
  }

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    const findUser = await this.userRepository.findUnique({
      where: { email },
      select: { id: true },
    });

    if (findUser) {
      throw new ConflictException('Email already taken ');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.userRepository.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          createMany: {
            data: [
              // Income
              { name: 'Salário', icon: 'salary', type: 'INCOME' },
              { name: 'Freelance', icon: 'freelance', type: 'INCOME' },
              { name: 'Outro', icon: 'other', type: 'INCOME' },
              // Expense
              { name: 'Casa', icon: 'home', type: 'EXPENSE' },
              { name: 'Alimentação', icon: 'food', type: 'EXPENSE' },
              { name: 'Educação', icon: 'education', type: 'EXPENSE' },
              { name: 'Lazer', icon: 'fun', type: 'EXPENSE' },
              { name: 'Mercado', icon: 'grocery', type: 'EXPENSE' },
              { name: 'Roupas', icon: 'clothes', type: 'EXPENSE' },
              { name: 'Transporte', icon: 'transport', type: 'EXPENSE' },
              { name: 'Viagem', icon: 'travel', type: 'EXPENSE' },
              { name: 'Outro', icon: 'other', type: 'EXPENSE' },
            ],
          },
        },
      },
    });

    const accessToken = await this.generateToken(user.id);

    return {
      access_token: accessToken,
    };
  }

  private generateToken(userId: string) {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }
}
