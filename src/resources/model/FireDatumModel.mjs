import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: "localhost",
    user: "hust_apartment",
    password: "12345678",
    database: 'hust_apartment',
});

export const FireDatumModel = {
    find: async (table, conditions = {}) => {
        let query = `SELECT * FROM ${table}`;

        if (Object.keys(conditions).length > 0) {
            query += ' WHERE';
            const conditionsArray = Object.entries(conditions);
            conditionsArray.forEach(([key, value], index) => {
                if (index > 0) {
                    query += ' AND';
                }
                query += ` ${key} = ?`;
            });
        }

        const [results] = await pool.execute(query, Object.values(conditions));
        return results;
    },

    create: async (table, data) => {
        const columns = Object.keys(data).join(', ');
        const values = Object.values(data);
        const placeholders = values.map(() => '?').join(', ');

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const [result] = await pool.execute(query, values);
        return result;
    },

    update: async (table, id, data) => {
        const updateSet = Object.entries(data)
            .map(([key, value]) => `${key} = ?`)
            .join(', ');

        const query = `UPDATE ${table} SET ${updateSet} WHERE id = ?`;
        const [result] = await pool.execute(query, [...Object.values(data), id]);
        return result;
    },
    
    delete: async (table, id) => {
        const query = `DELETE FROM ${table} WHERE id = ?`;
        await pool.execute(query, [id]);
    }
};
