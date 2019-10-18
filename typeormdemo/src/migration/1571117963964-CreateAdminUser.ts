import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import {User, UserRole} from "../entity/User"
export class CreateAdminUser1570786166356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        let user = new User();
        user.username = "admin";
        user.password = "admin";
        user.email = "atuulpaal@gmail.com"
        user.hashPassword()
        user.role = UserRole.ADMIN;
        user.phone = "9045812477";
        user.smsotp = "0";
        //user.countryCode = +91;
        user.verified = true;
        const userRepository = getRepository(User);
        await userRepository.save(user);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
