import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "adm_kinerja",
    password: "sistemaman",
    database: "db_kinerjascada",
});

export default connection.promise();