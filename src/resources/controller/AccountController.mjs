import { AccountModel } from "../model/AccountModel.mjs";
import { sessionAccountPassword } from "./LoginController.mjs";

export class AccountController {

    get(req, res, next) {
        const account = req.session.account;

        if (account.type == 'admin') {
            res.render('account', { layout: 'admin' });
        }
    }

    post = async (req, res, next) => {
        let message = "";
        if (sessionAccountPassword == req.body.confirmPassword) {
            if (req.body.register == "") {
                if (req.body.email != "" && req.body.accountname != "" && req.body.location != "") {
                    const rooms = await AccountModel.find({ location: req.body.location });
                    const emails = await AccountModel.find({ email: req.body.email });

                    if (emails.length === 0) {
                        if (req.body.accountType != 'admin') {
                            if (rooms.length === 0) {
                                let account = {
                                    name: req.body.accountname,
                                    email: req.body.email,
                                    password: '1',
                                    location: req.body.location,
                                    phone: req.body.phone,
                                    type: req.body.accountType
                                };

                                await AccountModel.create(account);
                                message = 'Đăng ký thành công';
                                res.status(200).render('account', { layout: 'admin', message });
                                console.log(message);
                            } else {
                                message = 'Số phòng đã được đăng ký';
                                res.status(200).render('account', { layout: 'admin', message });
                                console.log(message);
                            }
                        } else {
                            let account = {
                                name: req.body.accountname,
                                email: req.body.email,
                                password: '1',
                                location: "",
                                phone: req.body.phone,
                                type: req.body.accountType
                            };

                            await AccountModel.create(account);
                            message = 'Đăng ký thành công';
                            res.status(200).render('account', { layout: 'admin', message });
                            console.log(message);
                        }
                    } else {
                        message = 'Email đã được đăng ký';
                        res.status(200).render('account', { layout: 'admin', message });
                        console.log(message);
                    }
                } else {
                    message = 'Thông tin không chính xác';
                    res.status(200).render('account', { layout: 'admin', message });
                }
            } else {
                if (req.body.email != "") {
                    const accounts = await AccountModel.find({ location: req.body.location, email: req.body.email });
                    await AccountModel.delete(accounts[0].id);
                    message = 'Tài khoản đã bị xóa';
                    res.status(200).render('account', { layout: 'admin', message });
                } else {
                    message = 'Thông tin không chính xác';
                    res.status(200).render('account', { layout: 'admin', message });
                }
            }
        } else {
            message = 'Mật khẩu hiện tại không chính xác';
            res.status(200).render('account', { layout: 'admin', message });
            console.log(message);
        }
    }
}