import { LocationModel } from "../model/LocationModel.mjs";
import { turnOffAlarm } from "./SerialController.mjs";

// Initialize localAlarms with individual objects
let localAlarms = Array.from({ length: 36 }, () => ({ alarm: null }));

export class AlarmController {

    getAPI = async (req, res, next) => {
        let locations = await LocationModel.find({});
        let alarmCount = 0;

        for (let i = 0; i < locations.length; i++) {
            if (locations[i].fire === 'YES' && locations[i].deviceState === 'ON') {
                alarmCount++;
                localAlarms[i].alarm = 'ON';

                if (req.session.alarmFlag) {
                    req.session.alarm = 'ON';
                }
            }
        }

        if (alarmCount === 0) {
            req.session.alarmFlag = true;
            req.session.alarm = 'OFF';
        }

        if (turnOffAlarm.state) {
            for (let i = 0; i < locations.length; i++) {
                locations[i].alarm = 'OFF';
                localAlarms[i].alarm = 'OFF';
                await LocationModel.update(locations[i].id, locations[i]);
                turnOffAlarm.state = false;
            }
        }

        res.json({ locations, localAlarms, alarm: req.session.alarm });
    }

    postAPI(req, res, next) {
        if (req.body.turnOffSignal === '1') {
            req.session.alarmFlag = false;
            req.session.alarm = 'OFF';
            res.json({ success: true });
        }
    }
}
