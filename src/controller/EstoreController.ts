import {getRepository, getConnection} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Evoucher} from "../entity/Evoucher";
import {Purchase} from "../entity/Purchase";
// var CreditCard = require('credit-card');
import {validate} from "credit-card";
import config from "../config/config";
import purchaseQueue from "../queue/purchaseQueue"
import { Code } from "../entity/Code";

export class EstoreController {

    private evoucherRepository = getRepository(Evoucher);
    private purchaseRepository = getRepository(Purchase);
    private codeRepository = getRepository(Code);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.evoucherRepository
            .createQueryBuilder('evoucher')
            .select([
                "evoucher.id", 
                "evoucher.title", 
                "evoucher.description",
                "evoucher.image", 
                "evoucher.amount", 
                "evoucher.discount_method", 
                "evoucher.discount_percent",
                "evoucher.current_quantity",
                "evoucher.is_gift",
                "evoucher.expiry_date" ])
            .where('evoucher.expiry_date > :now AND evoucher.is_active=true', { 'now' :new Date().toISOString()})
            .getMany();

        // return await getConnection().createQueryBuilder().select("evoucher").from(Evoucher, "evoucher").execute();

    }

    async one(request: Request, response: Response, next: NextFunction) {
        var evoucher: Evoucher = await this.evoucherRepository
        .createQueryBuilder('evoucher')
        .select([
            "evoucher.id", 
            "evoucher.title", 
            "evoucher.description",
            "evoucher.image", 
            "evoucher.amount", 
            "evoucher.discount_method", 
            "evoucher.discount_percent",
            "evoucher.current_quantity",
            "evoucher.is_gift",
            "evoucher.expiry_date" ])
        .where('evoucher.expiry_date > :now AND evoucher.is_active=true AND evoucher.id = :id', { 'id': request.params.id, 'now' :new Date().toISOString()})
        .getOne();
        
        return evoucher ? evoucher : []
        return this.evoucherRepository.findOne(request.params.id);
    }

    async paymentAll(request: Request, response: Response, next: NextFunction) {
        return config.paymentMethod;
    }

    async checkout(request: Request, response: Response, next: NextFunction) {
        let evoucherId = request.params.id;
        let evoucher: Evoucher;

        try {
            evoucher = await this.evoucherRepository.findOneOrFail(evoucherId);
        } catch (error) {
            response.status(404);
            return {'message': 'Evoucher Not Found'};
        }

        if(!request.body.quantity){
            response.status(404);
            return {'message': 'Please provide a quantity'};
        }else if(!request.body.phone){
            response.status(404);
            return {'message': 'Please provide a phone'};
        }

        let quantity:number = +request.body.quantity;
        let phone = request.body.phone;

        if(quantity > evoucher.current_quantity){
            response.status(404);
            return {'message': `Out of Stock. Available only ${evoucher.current_quantity}`};
        }

        let purchase = await this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('SUM(purchase.quantity)', 'sum')
        .where('purchase.evoucher=:evoucherId and user=:user', {'evoucherId': evoucherId, 'user': response.locals.phone})
        .getRawOne();
        // var purchase = await this.purchaseRepository.createQueryBuilder('purchase').select('purchase.quantity').getRawOne();

        if(purchase && purchase.sum){
            let sum:number = +purchase.sum;
            let userLimit:number = evoucher.user_limit;
            let canBuy:number = userLimit - sum;

            if(sum >= userLimit){
                response.status(422);
                return {'message': 'You have reach your maximum eVoucher limit'};
            }else if(quantity > canBuy){
                response.status(422);
                return {'message': `Exceeding your maximum eVoucher limit. Can buy ${canBuy} more only`};
            }
        }

        if(evoucher.is_gift){
            let giftPurchase = await this.purchaseRepository
            .createQueryBuilder('purchase')
            .select('SUM(purchase.quantity)', 'sum')
            .where('purchase.evoucher=:evoucherId and user=:user and phone=:phone', {'evoucherId': evoucherId, 'user': response.locals.phone, 'phone': phone})
            .getRawOne();

            if(giftPurchase && giftPurchase.sum){
                let sum:number = +giftPurchase.sum;
                let giftLimit:number = evoucher.gift_limit;
                let canBuy:number = giftLimit - sum;
                if(sum >= giftLimit){
                    response.status(422);
                    return {'message': `You have reach maximum gift eVoucher limit for ${phone}`};
                }else if(quantity > canBuy){
                    response.status(422);
                    return {'message': `Exceeding maximum gift eVoucher limit. Can buy ${canBuy} more only for ${phone}`};
                }
            }
        }

        let discountPercent = 1 - evoucher.discount_percent/100;
        let originalPrice = quantity * evoucher.amount;

        let cardType = request.body.cardType;
        let cardNumber = request.body.cardNumber;
        let cardExpMonth = request.body.cardExpMonth;
        let cardExpYear = request.body.cardExpYear;
        let cvv = request.body.cvv;
        
        if(!cardType || !cardNumber || !cardExpMonth || !cardExpYear || !cvv){
            return {
                'message': `Please provide card info to proceed with payment.[cardType , cardNumber, cardExpMonth, cardExpYear, cvv]`,
                'evoucherId': evoucherId,
                'evoucherTitle': evoucher.title,
                'itemAmount': evoucher.amount,
                'totalAmount': {
                    'VISA': evoucher.discount_method==0 ? `${originalPrice * discountPercent} USD with ${evoucher.discount_percent}% discount`: `${originalPrice} USD`,
                    'MASTERCARD': evoucher.discount_method==1 ? `${originalPrice * discountPercent} USD with ${evoucher.discount_percent}% discount`: `${originalPrice} USD`
                },
    
            }
        }

        var card = {
            cardType: cardType,
            number: cardNumber,
            expiryMonth: cardExpMonth,
            expiryYear: cardExpYear,
            cvv: cvv
        };
        var validation = validate(card);

        if(!validation.validCardNumber){
            response.status(422);
            return {'message': `Invalid Card Number`};
        }
        if(!validation.validCvv){
            response.status(422);
            return {'message': `Invalid CVV`};
        }
        if(validation.isExpired){
            response.status(422);
            return {'message': `Card Expire`};
        }

        let itemPrice = evoucher.amount;
        if(cardType == 'VISA' && evoucher.discount_method == 0){
            originalPrice = originalPrice * discountPercent;
            itemPrice = itemPrice * discountPercent;
        }else if(cardType == 'MASTERCARD' && evoucher.discount_method == 1){
            originalPrice = originalPrice * discountPercent;
            itemPrice = itemPrice * discountPercent
        }

        try {
            let result = await this.purchaseRepository.save({
                'user': response.locals.phone,
                'phone': request.body.phone,
                'name': request.body.name,
                'quantity': quantity,
                'evoucher': evoucherId,
                'amount': originalPrice,
                'is_gift': evoucher.is_gift
            });

            await this.evoucherRepository.decrement({id: evoucherId}, "current_quantity", quantity)
            
            purchaseQueue({...result, itemPrice});

            return result;
        } catch (error) {
            response.status(422);
            return {'message': error.message};
        }

        // let userToRemove = await this.userRepository.findOne(request.params.id);
        // await this.userRepository.remove(userToRemove);
    }

    async purchaseHistory(request: Request, response: Response, next: NextFunction) {
        let purchaseHistory = await this.purchaseRepository.find({user: response.locals.phone});
        let data = [];
        for (let index = 0; index < purchaseHistory.length; index++) {
            let purchase = purchaseHistory[index];
            // let evoucher = await this.evoucherRepository.findOne({id: purchase.evoucher});
            data.push({
                'id': purchase.id,
                'evoucher': purchase.evoucher,
                'name': purchase.name,
                'phone': purchase.phone,
                'quantity': purchase.quantity,
                'amount': purchase.amount,
                'is_gift': purchase.is_gift,
                'time': purchase.createdAt
            })
        }

        let usedCode = (await this.codeRepository.find({phone: response.locals.phone, used: true})).map(code => {
            return {"code": code.code, "qr": this.generateQRPath(request, code.qr)}
        })
        let validCode = (await this.codeRepository.find({phone: response.locals.phone, used: false})).map(code => {
            return {"code": code.code, "qr": this.generateQRPath(request, code.qr)}
        })
        return {
            "evoucher": purchaseHistory,
            "usedCode" : usedCode,
            "validCode" : validCode
        };
    }

    async verifyCode(request: Request, response: Response, next: NextFunction){
        try {
            let { evoucher, phone, code, used, amount, qr} = await this.codeRepository.findOneOrFail({'code': request.params.code});
            
            response.send({
                evoucher,
                phone,
                code,
                used,
                amount,
                'qr': this.generateQRPath(request, qr)
            });
            
        } catch (error) {
            return response.status(404).send({'message': 'Invalid Code'});
        }
    }

    async useCode(request: Request, response: Response, next: NextFunction){

        try {
            await this.codeRepository.findOneOrFail({'code': request.params.code, 'used': false});

            await this.codeRepository.update({'code': request.params.code}, {'used': true});

            return {
                'message': 'success'
            };
            // response.send({
            //     evoucher,
            //     phone,
            //     code,
            //     used,
            //     amount,
            //     'qr': this.generateQRPath(request, qr)
            // });
            
        } catch (error) {
            // return response.status(404).send({'message': 'Invalid Code.'});
            response.status(404);
            return {'message': 'Invalid Code.'};
        }
    }

    generateQRPath(request: Request, qr: string){
        return `${request.protocol}://${request.header('host')}/qr/${qr}`
    }

}