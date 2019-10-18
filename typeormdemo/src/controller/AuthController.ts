import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if email/phone and password are set
    let phone = req.body.phone;
    let email = req.body.email;
    let password = req.body.password;
    console.log("body--->", req.body)
    if (!((email || phone) && password)) {
      res.send("email/phone and password is not found!!");
    }

    //Get user from database
    const userRepository = getRepository(User);
    let user: User;
    if (email) {
      try {
        user = await userRepository.findOne({ where: { email: email } });
      } catch (error) {
        res.send("email is not exists!!");
      }
    }
    else if (phone) {
      try {
        user = await userRepository.findOneOrFail({ where: { phone: phone } });
        console.log("email---->", user.email)
      } catch (error) {
        res.status(401).send("phone number is not exists!!");
      }
    }

    //Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.send("password is incorrect !!");
      return;
    }

    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" }
    );
    console.log("token----->", token)
    //Send the jwt in the response
    res.send({
      username: user.username,
      token: token
    });
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    console.log("requset details--->.", req.body)
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;
    if (!(oldPassword && newPassword)) {
      res.status(400).send("Details are not found");
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.send("user not found");
    }

    //Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.send("old password is not match");
      return;
    }

    //Validate de model (password lenght)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.send(errors);
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(200).send("password successfully updates");
  };
}
export default AuthController;