import { Controller, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RoutesEnum } from "src/constants/global";
import { DataSource } from "typeorm";

@Injectable()
export class UsersSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  getAll() {
    return this.dataSource.query(`
    SELECT id, "firstName", "lastName"
	  FROM public.users;
    `)
  }
}
