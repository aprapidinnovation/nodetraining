import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;
    console.log("auth id --->", id)
    //Get user role from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send("authantication failed");
    }
    
    //Check if array of authorized roles includes the user's role
    if (req.body.role != user.role){
      next();
    }
    else res.status(401).send("user can't be admin");
  };
};