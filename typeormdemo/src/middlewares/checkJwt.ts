import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {

  var token =req.headers["authorization"];
  console.log("token---->", token)

  console.log("secret-key---->", config.jwtSecret)

  let jwtPayload;
  
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = <string>token.split(' ')[1];
  }

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    console.log("yes verified")
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send("auth token is not working");
    return;
  }

  //The token is valid for 1 hour
  const { userId, username } = jwtPayload;
  const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h"
  });
  console.log("new token--->", newToken)
  res.setHeader("authorization", newToken);

  //Call the next middleware or controller
  next();
};