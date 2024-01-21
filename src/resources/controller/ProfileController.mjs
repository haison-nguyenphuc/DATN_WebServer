import { AccountModel } from "../model/AccountModel.mjs";

export class ProfileController {

    get(req, res, next) {
        const account = req.session.account;
        res.render('profile', { layout: account.type, account });
    }

    post = async (req, res, next) => {
        const account = req.session.account;
        let message = "Đã lưu thay đổi";
        if (account.password == req.body.confirmPassword) {
            let accounts = await AccountModel.find({ email: account.email });
            accounts[0].name = req.body.newName;
            accounts[0].email = req.body.newEmail;
            accounts[0].phone = req.body.newPhone;

            await AccountModel.update(accounts[0].id, accounts[0]);
            req.session.account = accounts[0];
            res.render('profile', { layout: account.type, account: accounts[0], message });
            console.log(message);
        } else {
            message = 'Mật khẩu hiện tại không chính xác';
            res.render('profile', { layout: account.type, account, message });
            console.log(message);
        }
    }
}
