import { DeviceModel } from "../model/DeviceModel.mjs";
import { LocationModel } from "../model/LocationModel.mjs";
import { sessionAccountType } from "./LoginController.mjs";

export class DeviceController {

    get(req, res, next) {
        res.render('device', { layout: sessionAccountType });
    }

    post(req, res, next) {
        res.render('device', { layout: sessionAccountType });
    }

    getAPI = async (req, res, next) => {
        let locations = await LocationModel.find({});
        let devices = await DeviceModel.find({});
        let alarm = 'OFF';
        let connectDeviceCount = 0;

        for (let i = 0; i < locations.length; i++) {
            if (locations[i].deviceState == 'ON') {
                connectDeviceCount++;
            }

            if (locations[i].alarm == "ON") {
                alarm = 'ON';
            }
        }

        res.json({ devices, alarm, connectDeviceCount });
    }

    postAPI = async (req, res, next) => {
        let deviceList = req.body;

        for (let i = 0; i < deviceList.length; i++) {
            let locations = await LocationModel.find({deviceID: deviceList[i].deviceID});
            let devices = await DeviceModel.find({deviceID: deviceList[i].deviceID});

            if (locations.length > 0) {
                locations[0].deviceID = "";
                locations[0].deviceState = "";
                await LocationModel.update(locations[0].id, locations[0]);
            }

            devices[0].location = deviceList[i].location;
            await DeviceModel.update(devices[0].id, devices[0]);
        }
    }

}