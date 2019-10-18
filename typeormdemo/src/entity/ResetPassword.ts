import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,

  } from "typeorm";
  import { Length, IsNotEmpty } from "class-validator";
  import * as bcrypt from "bcryptjs";
  
  @Entity()
  @Unique(["userId"])
  export class Resetpassword {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    @IsNotEmpty()
    userId: number;
   
    @Column()
    @Length(4, 100)
    token: string;

    hashToken() {
      this.token = bcrypt.hashSync(this.token, 8);
      return this.token;
    }
  
    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      return bcrypt.compareSync(unencryptedPassword, this.token);
    }
  }