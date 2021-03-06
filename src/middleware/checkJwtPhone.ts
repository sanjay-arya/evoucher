import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwtPhone = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const token = <string>req.headers["auth"];
  let jwtPayload;
  
  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecretPhone);
    res.locals.jwtPayload = jwtPayload;
    res.locals.phone = jwtPayload.phone;
  } catch (error) {
    console.log(error);
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  //The token is valid for 1 hour
  //We want to send a new token on every request
  const { phone } = jwtPayload;
  const newToken = jwt.sign({ phone }, config.jwtSecretPhone, {
    expiresIn: "1d"
  });
  res.setHeader("token", newToken);

  //Call the next middleware or controller
  next();
};