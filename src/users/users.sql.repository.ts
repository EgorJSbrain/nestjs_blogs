import { Controller, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { add } from "date-fns";
import { CreateUserDto } from "src/dtos/users/create-user.dto";
import { HashService } from "src/hash/hash.service";
import { IUser } from "src/types/users";
import { DataSource } from "typeorm";

@Injectable()
export class UsersSQLRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private hashService: HashService
  ) {}

  getAll() {
    return this.dataSource.query(`
      SELECT id, "login", "email", "createdAt"
	    FROM public.users;
    `)
  }

  getById(id: string) {
    const query = `
      SELECT id, "login", "email", "createdAt"
      FROM public.users
      WHERE id = $1
    `
    return this.dataSource.query(query, [id])
  }

  async createUser(data: CreateUserDto): Promise<IUser> {
    const { passwordSalt, passwordHash } = await this.hashService.generateHash(
      data.password
    )

    const query = `
      INSERT INTO public.users(
        "login", "email", "passwordHash", "passwordSalt")
        VALUES ($1, $2, $3, $4)
      `

    const selectQuery = `
        SELECT id, "login", "email", "createdAt"
        FROM public.users
        WHERE email = $1
      `

    await this.dataSource.query(query, [data.login, data.email, passwordHash, passwordSalt])
    const users = await this.dataSource.query(selectQuery, [data.email])

    return users[0]
  }
}
