import { DatumModel } from "../model/DatumModel.mjs";
import { SerialPort } from 'serialport';
import { LocationModel } from "../model/LocationModel.mjs";
import { DeviceModel } from "../model/DeviceModel.mjs";
import { sessionAccountPassword } from "./LoginController.mjs";
import { ReadlineParser } from '@serialport/parser-readline'

let turnOnOffSignal = 'OFF';
let serialConnectState = 'OFF';
let baseTime = new Date();

export let turnOffAlarm = {
    state: true
};

async function checkDeviceConnect() {
    let connectState = 'ON';
    let currentTime = new Date();

    let devices = await DeviceModel.find({});

    for (let i = 0; i < devices.length; i++) {
        let timeOut = Math.floor((currentTime.getTime() - new Date(devices[i].time).getTime()) / 1000);

        if (devices[i].location == "Không sử dụng") {
            connectState = 'OFF';
        } else {
            if (timeOut > 20) {
                connectState = 'OFF';
            } else {
                connectState = 'ON';
            }
        }
        devices[i].state = connectState;

        await DeviceModel.update(devices[i].id, devices[i]);

        let locations = await LocationModel.find({ deviceID: devices[i].deviceID });

        if (locations.length > 0) {
            locations[0].deviceState = connectState;
            await LocationModel.update(locations[0].id, locations[0]);
        }
    }
}

export class SerialController {

    constructor() {
        this.connect();
        setInterval(checkDeviceConnect, 1000);
    }

    getAPI = async (req, res, next) => {
        const locations = await LocationModel.find({});
        res.json({ locations, serialConnectState, password: sessionAccountPassword });
    };


    postAPI = (req, res, next) => {
        turnOnOffSignal = req.body.turnOnOffSignal;
        let signal;

        if (turnOnOffSignal == 'OFF') {
            turnOffAlarm.state = true;
            signal = '1';
        } else {
            signal = '0';
        }

        if (this.hasDatum == false) {
            this.serialPort.write(signal, (err) => {
                if (err) {
                    console.log('Error on write: ', err.message);
                } else {
                    console.log(signal);
                }
            });
        }
    }

    collectData() {
        this.parser.on('data', async data => {
            this.hasDatum = true;
            let sensorData = data.toString().split(' ');
            let currentTime = new Date();

            if (sensorData.length == 10) {
                sensorData[4] = (sensorData[4] == 0) ? 'NORMAL' : 'FIRE';
                sensorData[5] = (sensorData[5] == 0) ? 'NORMAL' : 'FIRE';
                sensorData[6] = (sensorData[6] == 0) ? 'NORMAL' : 'FIRE';
                sensorData[7] = (sensorData[7] == 0) ? 'NO' : 'YES';
                sensorData[8] = (sensorData[8] == 0) ? 'OFF' : 'ON';

                sensorData = {
                    deviceID: sensorData[0],
                    location: "",
                    pinValue: sensorData[1],
                    temperatureValue: sensorData[2],
                    smokeValue: sensorData[3],
                    temperatureState: sensorData[4],
                    flameState: sensorData[5],
                    smokeState: sensorData[6],
                    fire: sensorData[7],
                    alarm: sensorData[8],
                }
                console.log(sensorData);
                const devices = await DeviceModel.find({ deviceID: sensorData.deviceID });

                if (devices.length === 0) {
                    const device = {
                        location: "Không sử dụng",
                        deviceID: sensorData.deviceID,
                        state: "OFF",
                        time: currentTime
                    };

                    await DeviceModel.create(device);
                } else {
                    if (devices[0].location != "Không sử dụng") {
                        sensorData.location = devices[0].location;
                        devices[0].time = currentTime;
                        let table = "";

                        if (sensorData.fire == 'YES') {
                            table = '`' + 'dữ liệu cháy ' + sensorData.location + '`';
                        } else {
                            table = '`' + 'dữ liệu ' + sensorData.location + '`';
                        }

                        const datum = {
                            location: sensorData.location,
                            temperatureValue: sensorData.temperatureValue,
                            temperatureState: sensorData.temperatureState,
                            smokeValue: sensorData.smokeValue,
                            smokeState: sensorData.smokeState,
                            flameState: sensorData.flameState,
                            pinValue: sensorData.pinValue,
                            fire: sensorData.fire,
                            alarm: sensorData.alarm,
                            time: currentTime
                        };

                        const location = {
                            location: sensorData.location,
                            fire: sensorData.fire,
                            alarm: sensorData.alarm,
                            deviceID: sensorData.deviceID,
                            deviceState: 'ON'
                        }

                        await DeviceModel.update(devices[0].id, devices[0]);

                        let oldData = await DatumModel.find('`' + 'dữ liệu ' + sensorData.location + '`', {});

                        if (datum.fire == 'NO') {
                            if (oldData.length < 1) {
                                await DatumModel.create(table, datum);
                            } else {
                                let length = oldData.length;
                                oldData = oldData[length - 1];
                                let firstCondition = Math.abs(parseInt(oldData.temperatureValue) - parseInt(datum.temperatureValue)) < 3;
                                let secondCondition = Math.abs(parseInt(oldData.smokeValue) - parseInt(datum.smokeValue)) < 10;
                                let thirdCondition = (oldData.flameState == datum.flameState) && (oldData.alarm == datum.alarm);
                                let fourthConditon = ((currentTime.getTime() - baseTime.getTime())) / 1000 < 3600;

                                if (firstCondition && secondCondition && thirdCondition && fourthConditon) {
                                    await DatumModel.update(table, oldData.id, datum);
                                } else {
                                    await DatumModel.create(table, datum);

                                    if (!fourthConditon) {
                                        baseTime = currentTime;
                                    }
                                }
                            }
                        } else {
                            for (let i = 0; i < oldData.length; i++) {
                                let dataTime = new Date(oldData[i].time);
                                if ((currentTime.getTime() - dataTime.getTime()) / 1000 > 3600) {
                                    break;
                                }

                                oldData[i].id = null;
                                let checkData = await DatumModel.find(table, {time: oldData[i].time});

                                if (checkData.length < 1) {
                                    await DatumModel.create(table, oldData[i]);
                                }
                            }

                            await DatumModel.create(table, datum);
                        }

                        const locations = await LocationModel.find({ location: sensorData.location });

                        if (locations.length === 0) {
                            await LocationModel.create(location);
                        } else {
                            await LocationModel.update(locations[0].id, location);
                        }
                    } else {
                        devices[0].time = currentTime;

                        await DeviceModel.update(devices[0].id, devices[0]);
                    }
                }
            } else {
                console.log('Dữ liệu không đúng định dạng.');
            }
            this.hasDatum = false;
        });
    }

    connect = () => {
        console.log('Đang thử kết nối ...');
        this.serialPort = new SerialPort({ path: 'COM3', baudRate: 115200 });
        this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
        this.hasDatum = false;
        serialConnectState = 'OFF';
        clearInterval(this.reconnect);

        // Gán sự kiện mở cổng
        this.serialPort.on('open', () => {
            console.log('Cổng đã mở.');
            clearInterval(this.reconnect);
            serialConnectState = 'ON';
            this.collectData();
        });

        // Xử lý sự kiện đóng cổng
        this.serialPort.on('close', () => {
            console.log('Cổng đã đóng. Đang thử mở lại...');
            this.reconnect = setInterval(() => this.connect(), 2000);
        });

        // Xử lý sự kiện lỗi
        this.serialPort.on('error', (err) => {
            console.error('Lỗi:', err.message);
            clearInterval(this.reconnect);
            this.reconnect = setInterval(() => this.connect(), 2000);
        });
    }
}


