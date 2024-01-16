import { STRING_MAX_LENGTH } from 'src/constants/global'
import { IExtendedUser } from 'src/types/users'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class UserEntity extends BaseEntity implements IExtendedUser{
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  login: string

  @Column()
  email: string

  @Column()
  confirmationCode: string

  @Column()
  expirationDate: string

  @Column()
  passwordHash: string

  @Column()
  passwordSalt: string

  @Column()
  createdAt: string

  @Column({ default: false })
  isConfirmed: boolean
}
