import { AccountModel } from "../model/AccountModel.mjs";

export let sessionAccountPassword = "";
export let sessionAccountType = "";
export let sessionAccountLocation = "";

export class LoginController {

    //[get] /login
    get(req, res, next) {
        res.render('login', { layout: 'login' });
    }

    //[post] /login
    post = async (req, res, next) => {
        const account = req.body;
        const accounts = await AccountModel.find({ 'email': account.email, 'password': account.password });
        console.log(accounts);

        if (accounts.length) {
            req.session.account = accounts[0];
            sessionAccountPassword = accounts[0].password;
            sessionAccountType = accounts[0].type;
            sessionAccountLocation = accounts[0].location;
            req.session.alarmFlag = true;
            res.redirect('/overview');
        } else {
            res.redirect('/login');
        }
    }

}