import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import config from "../config/config"
import * as jwt from "jsonwebtoken";


export class AuthController {

    private userRepository = getRepository(User);

    async login(request: Request, response: Response, next: NextFunction) {
        let { username, password } = request.body;
        if (!(username && password)) {
            response.status(400).send();
        }

        let user: User;
        try {
          user = await this.userRepository.findOneOrFail({ where: { username } });
        } catch (error) {
          response.status(401).send();
          return;
        }

            //Check if encrypted password match
        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            response.status(401).send();
            return;
        }

        //Sing JWT, valid for 1 hour
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            config.jwtSecret,
            { expiresIn: "1d" }
        );
    
        //Send the jwt in the res
        response.setHeader("token", token);
        return {
			"token": token
		}
    }

    async loginPhone(request: Request, response: Response, next: NextFunction) {
        if(!request.body.phone){
            response.status(401).send();
            return;
        };

		var token = jwt.sign(
            { phone: request.body.phone },
            config.jwtSecretPhone,
            {expiresIn: '1d'}
        );

		//Send the jwt in the res
        response.setHeader("token", token);
        return {
			"token": token
		}
    }

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }

}