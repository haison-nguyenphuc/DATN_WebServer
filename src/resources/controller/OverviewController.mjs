export class OverviewController {
    
    get(req, res, next) {
        const account = req.session.account;
        res.render('overview', {layout: account.type});
    }

    post(req, res, next) {
        res.redirect('location');
    }

}