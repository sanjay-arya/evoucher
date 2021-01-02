import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Evoucher} from "../entity/Evoucher";

export class EvoucherController {

    private evoucherRepository = getRepository(Evoucher);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.evoucherRepository.find();
        return (await this.evoucherRepository.find()).map(evoucher => {
            return {
                "id": evoucher.id,
                "title": evoucher.title,
                "description": evoucher.description,
                "is_active": evoucher.is_active,
            }
            delete evoucher.discount_method
            delete evoucher.discount_percent
            delete evoucher.total_quantity
            delete evoucher.current_quantity
            delete evoucher.user_limit
            delete evoucher.gift_limit
            return evoucher
        });
    }

    async one(request: Request, response: Response, next: NextFunction) {
        try {
            return await this.evoucherRepository.findOneOrFail(request.params.id);
        } catch (error) {
            response.status(404);
            return {'message': "Not Found"};
        }
    }

    async save(request: Request, response: Response, next: NextFunction) {
        try {
            let data = request.body;

            if(data.title == undefined || data.title.length == 0){
                response.status(422);
                return {'message': 'Please provide a title'};
            }else if(data.expiry_date == undefined || data.expiry_date.length == 0){
                response.status(422);
                return {'message': 'Please provide a expiry date'};
            }else if(data.amount == undefined || data.amount.length == 0){
                response.status(422);
                return {'message': 'Please provide a amount'};
            }else if(data.total_quantity == undefined || data.total_quantity.length == 0){
                response.status(422);
                return {'message': 'Please provide a total quantity'};
            }else if(data.discount_method == undefined || data.discount_method.length == 0){
                response.status(422);
                return {'message': 'Please provide a discount method. 1 for VISA, 2 for MASTERCARD'};
            }else if(data.discount_percent == undefined || data.discount_percent.length == 0){
                response.status(422);
                return {'message': 'Please provide a discount percent'};
            }else if(data.user_limit == undefined || data.user_limit.length == 0){
                response.status(422);
                return {'message': 'Please provide a user limit'};
            }else if(data.is_gift == undefined || data.is_gift.length == 0){
                response.status(422);
                return {'message': 'Please provide a is gift or not'};
            }else if(data.is_gift){
                if(data.gift_limit == undefined || data.gift_limit.length == 0){
                    response.status(422);
                    return {'message': 'Please provide a gift limit'};
                }
            }else if(!data.is_gift){
                request.body.gift_limit = 0;
            }

            console.log(data.is_gift);

            let total_quantity:number = +request.body.total_quantity;
            let user_limit:number = +request.body.user_limit;
            let gift_limit:number = +request.body.gift_limit;
            console.log(request.body.user_limit.length);
            if(user_limit > total_quantity){
                request.body.user_limit = total_quantity;
            }
            if(gift_limit > total_quantity){
                request.body.gift_limit = total_quantity;
            }

            console.log(`${total_quantity} GG ${request.body.gift_limit}`);

            request.body.current_quantity = total_quantity;
            await this.evoucherRepository.save(request.body); 

            return {"status": 1, "message":"success"}
        } catch (error) {
            response.status(422);
            return {'message': error.message};
        }
    }

    async update(request: Request, response: Response, next: NextFunction) {
        try {
            let evoucher = await this.evoucherRepository.findOneOrFail(request.params.id);
            await this.evoucherRepository.update(request.params.id, request.body);
            return {"status": 1, "message":"success"}
        } catch (error) {
            response.status(422);
            return {'message': error.message};
        }
    }

    // async remove(request: Request, response: Response, next: NextFunction) {
    //     let userToRemove = await this.userRepository.findOne(request.params.id);
    //     await this.userRepository.remove(userToRemove);
    // }

}