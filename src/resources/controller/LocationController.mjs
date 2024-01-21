import { AccountModel } from "../model/AccountModel.mjs";
import { DatumModel } from "../model/DatumModel.mjs";
import { LocationModel } from "../model/LocationModel.mjs";
import { sessionAccountType } from "./LoginController.mjs";
import { sessionAccountLocation } from "./LoginController.mjs";

let location = "";
let index = "";
const floorCount = 5;
const roomCount = 4;

let localData = new Array();

for (let i = 1; i <= floorCount; i++) {
    for (let j = 1; j <= roomCount; j++) {
        localData.push({ location: `Phòng ${100 * i + j}`, data: null, alarm: false, deviceState: 'OFF' });
    }
    localData.push({ location: `Hành lang tầng ${i}`, data: null, alarm: false, deviceState: 'OFF' });
    localData.push({ location: `Cầu thang ${i}-${i + 1}`, data: null, alarm: false, deviceState: 'OFF' });
}

export class LocationController {

    get(req, res, next) {
        const account = req.session.account;
        res.render('location', { layout: sessionAccountType });
        location = req.query.params;

        if (location.includes("-")) {
            location = "Cầu thang " + location;
        } else if (location.length < 3) {
            location = "Hành lang tầng " + location;
        } else {
            location = "Phòng " + location;
        }

        index = localData.findIndex((item) => item.location === location);
    }

    post(req, res, next) {
    }

    getAPI = async (req, res, next) => {
        const normalTable = '`' + 'dữ liệu ' + location + '`';
        const fireTable = '`' + 'dữ liệu cháy ' + location + '`';
        const [accounts, locations, normalData, fireData] = await Promise.all([
            AccountModel.find({ location: location }),
            LocationModel.find({ location: location }),
            DatumModel.find(normalTable, {}),
            DatumModel.find(fireTable, {})
        ]);

        let data = normalData.concat(fireData);
        let account = accounts[0];

        if (data.length > 0) {
            localData[index].deviceState = locations[0].deviceState;

            if (localData[index].deviceState == 'ON') {
                if (!localData[index].alarm) {
                    localData[index].data = data[0];

                    for (let i = 0; i < data.length; i++) {
                        let timeMax = new Date(localData[index].data.time);
                        let time = new Date(data[i].time);
                        if (time > timeMax) {
                            localData[index].data = data[i];
                        }
                    }

                    if (localData[index].data.fire == 'YES') {
                        localData[index].alarm = true;
                    }
                }
            }
        }

        let datum = localData[index].data;

        if (sessionAccountType == 'admin') {
            res.json({ account, datum, sessionAccountType, location: locations[0] });
        } else {
            if (sessionAccountLocation == location) {
                res.json({ account, datum, sessionAccountType, location: locations[0] });
            } else {
                res.json({ datum, sessionAccountType, location: locations[0] });
            }
        }
    }

    postAPI(req, res, next) {
        if (req.body.resetDataSignal) {
            localData[index].alarm = false;

            if (localData[index].deviceState == 'OFF') {
                localData[index].data = null;
            }
        }

        res.json({}).status(200);
    }

}