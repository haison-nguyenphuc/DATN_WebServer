import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: "localhost",
    user: "hust_apartment",
    password: "12345678",
    database: 'hust_apartment',
});

const createAccountsTable = async (table) => {
    const query = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            email VARCHAR(255),
            password VARCHAR(255),
            location VARCHAR(255),
            phone VARCHAR(20),
            type VARCHAR(50)
        )
    `;
    await pool.execute(query);
};

const createLocationsTable = async (table) => {
    const query = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            location VARCHAR(255),
            alarm VARCHAR(255),
            fire VARCHAR(255),
            deviceID VARCHAR(255),
            deviceState VARCHAR(255)
        )
    `;
    await pool.execute(query);
};

const createDeviceTable = async (table) => {
    const query = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            location VARCHAR(255),
            deviceID VARCHAR(255),
            state VARCHAR(255),
            time VARCHAR(255)
        )
    `;
    await pool.execute(query);
};

const createDataTable = async (table) => {
    const query = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            location VARCHAR(255),
            temperatureValue VARCHAR(255),
            temperatureState VARCHAR(255),
            smokeValue VARCHAR(255),
            smokeState VARCHAR(255),
            flameState VARCHAR(255),
            pinValue VARCHAR(255),
            fire VARCHAR(20),
            alarm VARCHAR(20),
            time VARCHAR(255)
        )
    `;
    await pool.execute(query);
};

const createFireDataTable = async (table) => {
    const query = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            location VARCHAR(255),
            temperatureValue VARCHAR(255),
            temperatureState VARCHAR(255),
            smokeValue VARCHAR(255),
            smokeState VARCHAR(255),
            flameState VARCHAR(255),
            pinValue VARCHAR(255),
            fire VARCHAR(20),
            alarm VARCHAR(20),
            time VARCHAR(255)
        )
    `;
    await pool.execute(query);
};

export const database = {
    'init': () => {
        createAccountsTable('`Quản lý tài khoản`');

        createLocationsTable('`Quản lý vị trí`');

        createDeviceTable('`Quản lý thiết bị`');

        for (let i = 1; i <= 5; i++) {
            let table = "`Dữ liệu " + `hành lang tầng ${i}` + "`";
            createDataTable(table);
            table = "`Dữ liệu " + `cầu thang ${i}-${i + 1}` + "`";
            createDataTable(table);

            for (let j = 1; j <= 4; j++) {
                let roomID = 100 * i + j;
                table = "`Dữ liệu " + `phòng ${roomID}` + "`";
                createDataTable(table);
            }
        }

        for (let i = 1; i <= 5; i++) {
            let table = "`Dữ liệu cháy " + `hành lang tầng ${i}` + "`";
            createFireDataTable(table);
            table = "`Dữ liệu cháy " + `cầu thang ${i}-${i + 1}` + "`";
            createFireDataTable(table);

            for (let j = 1; j <= 4; j++) {
                let roomID = 100 * i + j;
                table = "`Dữ liệu cháy " + `phòng ${roomID}` + "`";
                createFireDataTable(table);
            }
        }
    }
}