import {EvoucherController, AuthController, EstoreController} from "./controller";
import { checkJwt, checkJwtPhone, isAdmin } from "./middleware";

export const Routes = [{
    method: "get",
    route: "/api/evouchers",
    controller: EvoucherController,
    action: "all",
    middleware: [checkJwt]
}, {
    method: "get",
    route: "/api/evouchers/:id",
    controller: EvoucherController,
    action: "one",
    middleware: [checkJwt]
}, {
    method: "post",
    route: "/api/evouchers",
    controller: EvoucherController,
    action: "save",
    middleware: [checkJwt, isAdmin]
}, {
    method: "put",
    route: "/api/evouchers/:id",
    controller: EvoucherController,
    action: "update",
    middleware: [checkJwt, isAdmin]
}, {
    method: "delete",
    route: "/api/evouchers/:id",
    controller: EvoucherController,
    action: "remove",
    middleware: [checkJwt, isAdmin]
},


{
    method: "post",
    route: "/api/login",
    controller: AuthController,
    action: "login"
}

, {
    method: "post",
    route: "/api/estore/login",
    controller: AuthController,
    action: "loginPhone",
}, {
    method: "get",
    route: "/api/estore/voucher",
    controller: EstoreController,
    action: "all",
    middleware: [checkJwtPhone]
}, {
    method: "get",
    route: "/api/estore/voucher/:id",
    controller: EstoreController,
    action: "one",
    middleware: [checkJwtPhone]
}, {
    method: "post",
    route: "/api/estore/voucher/:id/checkout",
    controller: EstoreController,
    action: "checkout",
    middleware: [checkJwtPhone]
}, {
    method: "get",
    route: "/api/estore/purchase-history",
    controller: EstoreController,
    action: "purchaseHistory",
    middleware: [checkJwtPhone]
}, {
    method: "get",
    route: "/api/estore/payment-method",
    controller: EstoreController,
    action: "paymentAll",
    middleware: [checkJwtPhone]
}, {
    method: "get",
    route: "/api/estore/code/verify/:code",
    controller: EstoreController,
    action: "verifyCode",
    middleware: [checkJwtPhone]
}, {
    method: "get",
    route: "/api/estore/code/use/:code",
    controller: EstoreController,
    action: "useCode",
    middleware: [checkJwtPhone]
}

];