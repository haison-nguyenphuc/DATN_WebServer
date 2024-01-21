import { AccountController } from "../resources/controller/AccountController.mjs";
import { AlarmController } from "../resources/controller/AlarmController.mjs";
import { DeviceController } from "../resources/controller/DeviceController.mjs";
import { LocationController } from "../resources/controller/LocationController.mjs";
import { LoginController } from "../resources/controller/LoginController.mjs";
import { OverviewController } from "../resources/controller/OverviewController.mjs";
import { PasswordController } from "../resources/controller/PasswordController.mjs";
import { ProfileController } from "../resources/controller/ProfileController.mjs";

let accountController = new AccountController();
let loginController = new LoginController();
let overviewController = new OverviewController();
let profileController = new ProfileController();
let passwordController = new PasswordController();
let locationController = new LocationController();
let alarmController = new AlarmController();
let deviceController = new DeviceController();

export function route(app, serialController) {

    // /login
    app.get('/login', loginController.get);
    app.post('/login', loginController.post);

    // /overview
    app.get('/overview', overviewController.get);
    app.post('/overview', overviewController.post);

    // /profile
    app.get('/profile', profileController.get);
    app.post('/profile', profileController.post);

    // /password
    app.get('/password', passwordController.get);
    app.post('/password', passwordController.post);

    // /account
    app.get('/account', accountController.get);
    app.post('/account', accountController.post);

    // /device
    app.get('/device', deviceController.get);
    app.post('/device', deviceController.post);
    app.get('/api/device', deviceController.getAPI);
    app.post('/api/device', deviceController.postAPI);

    // /location
    app.get('/location', locationController.get);
    app.post('/location', locationController.post);
    app.get('/api/location', locationController.getAPI);
    app.post('/api/location', locationController.postAPI);

    // /alarm
    app.get('/api/alarm', alarmController.getAPI);
    app.post('/api/alarm', alarmController.postAPI);

    // /send_Datum_to_ESP32
    app.post('/api/turnOnOffAlarm', serialController.postAPI);
    app.get('/api/turnOnOffAlarm', serialController.getAPI);

    // /
    app.use('/', (req, res) => {
        res.redirect('/login');
    });
}