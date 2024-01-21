import { AccountModel } from "../model/AccountModel.mjs";

export class PasswordController {

    get(req, res, next) {
        const account = req.session.account;
        res.render('password', { layout: account.type })
    }

    post = async (req, res, next) => {
        const account = req.session.account;
        let message = "";
        if (account.password == req.body.currentPassword) {
            if (req.body.newPassword == req.body.confirmPassword) {
                let accounts = await AccountModel.find({ email: account.email });
                accounts[0].password = req.body.newPassword;

                await AccountModel.update(accounts[0].id, accounts[0]);
                req.session.account = accounts[0];
                res.status(200).redirect('/login');
            } else {
                message = 'Mật khẩu mới không chính xác';
                res.render('password', { layout: account.type, message });
                console.log(message);
            }
        } else {
            message = 'Mật khẩu hiện tại không chính xác';
            res.render('password', { layout: account.type, message });
            console.log(message);
        }
    }
}
