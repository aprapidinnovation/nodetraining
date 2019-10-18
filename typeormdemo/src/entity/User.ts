import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";
import config from "../config/config";
import * as Twilio from 'twilio'

const twilioClient = Twilio(config.twilioSid, config.twilioToken)

export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "editor",
  CLIENT = "client"
}


@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(4, 20)
  username: string;

  @Column()
  @Length(4, 100)
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CLIENT
  })
  role: UserRole;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  phone: string;

  @Column({ type: "varchar", default: "0" })
  smsotp: string;

  @Column({ type: "varchar", default: "NA" })
  @IsNotEmpty()
  sid: string;

  @Column({ type: "boolean", default: false })
  verified: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
