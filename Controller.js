import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";
const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

class Controller {
    static downTimes = {}; // Store downtime information per server
    static tanggal = {}; // Store tanggal_down information per server
    static validation = (req, res, next) => {
        const errors = validation_result(req).mapped();
        if (Object.keys(errors).length) {
            return res.status(422).json({
                ok: 0,
                status: 422,
                errors,
            });
        }
        next();
    };
    
    static create = async (req, res, next) => {
        console.log("awal request");
         // Declare down_time outside the conditional statement
        //console.log("first" + down_time);
        const alat = 'VOIP'
        try {
            const { ip, status, time, durasidown } = matchedData(req);
            //let results = [];
            if (status == 'down') {
                console.log(status);
                console.log(ip);
                console.log(time);
                var today_down = new Date();
                var tanggal = today_down.getFullYear() + '-' + (today_down.getMonth() + 1).toString().padStart(2, '0') + '-' + today_down.getDate().toString().padStart(2, '0');
                console.log(tanggal);
                Controller.tanggal[ip] = tanggal;
                Controller.downTimes[ip] = time;
                const [insert] = await DB.execute(
                    "INSERT INTO `his_voip` (`alat`, `ip`, `tanggal_down`, `waktu_down`) VALUES (?,?,?,?)",
                    [alat,ip,tanggal,time] 
                );
                const [update] = await DB.execute(
                    "UPDATE `real_voip` SET `status` = ? where `ip` = ?",
                    [status,ip]
                );
                const [update1] = await DB.execute(
                    "CALL updatesite_voip()"
                );
                res.status(201).json({
                    ok: 1,
                    status: 201,
                    message: "Post has been created successfully",
                    post_id: insert.insertId,
                    post_id: update.insertId,
                    post_id: update1.insertId,
                });
                console.log("berhasil insert data ke database");
            } else {
                console.log(status);
                console.log(ip);
                console.log(time);
                var today_up = new Date();
                var tanggal = today_up.getFullYear() + '-' + (today_up.getMonth() + 1).toString().padStart(2, '0') + '-' + today_up.getDate().toString().padStart(2, '0');
                console.log(tanggal);
                const down_time_key = Controller.downTimes[ip];
                const tanggal_down = Controller.tanggal[ip];
                if(down_time_key && tanggal_down){
                    console.log("masuk perhitungan perbedaan bulan");
                    var tanggal_up = new Date(tanggal);  
                    var tanggaldown = new Date(tanggal_down);
                    function monthDiff(date1, date2) {
                        console.log("masuk fungsi monthdiff");
                        var months;
                        months = (date2.getFullYear() - date1.getFullYear()) * 12;
                        months += date2.getMonth() - date1.getMonth();
                        return months;
                    }
                    var monthDifference = monthDiff(tanggaldown, tanggal_up);
                    console.log('Month Difference:', monthDifference);
                    if(monthDifference === 0){
                        console.log("tidak ada perbedaan bulan");
                        const [update] = await DB.execute(
                            "UPDATE `his_voip` SET `tanggal_up` = ?, `waktu_up`=?, `durasi_down`=? where `alat`=? and `ip`=? and `tanggal_down`=? and `waktu_down`=?",
                            [tanggal, time, durasidown, alat, ip, tanggal_down, down_time_key]
                        );
                        const [update1] = await DB.execute(
                            "UPDATE `real_voip` set `status`=? where `ip`=?",
                            [status,ip]
                        );
                        res.status(201).json({
                            ok: 1,
                            status: 201,
                            message: "Post has been created successfully",
                            post_id: update.insertId,
                            post_id: update1.insertId,
                        });
                        console.log("berhasil insert data ke database");
                        } 
                else {
                    console.log("ada perbedaan bulan");
                    let newDate1 = null;
                    let results = [];
                    const [tableupdate1] = await DB.execute(
                        "UPDATE `real_voip` SET `link_status` = ? WHERE `ip` = ?",
                        [status, ip]
                    );
                    results.push({
                        operation: "update1",
                        post_id: tableupdate1.insertId,
                    });
                    for (var i = 1; i <= monthDifference; i++) {
                        var newDate = new Date(tanggaldown);
                        var endDate = new Date(tanggaldown);
                      
                        newDate.setDate(1);
                        endDate.setDate(1);
                        endDate.setMonth(tanggaldown.getMonth() + i);
                        endDate.setDate(0);
                      
                        newDate.setMonth(tanggaldown.getMonth() + i);
                        var formattednewDate = newDate.toISOString().slice(0, 10);
                        var formattedendDate = endDate.toISOString().slice(0, 10);

                        //const downTimeObject = new Date(`${tanggal_down} ${down_time_key}`);
                        //const currentTimeObject = new Date(`${formattedendDate} 23:59:59`);
                        if (i === 1) {
                            const [result1] = await DB.execute(
                                "UPDATE `his_voip` SET  `Tanggal_Up`=?, `Waktu_Up`=?  WHERE `Tanggal_Down`=? AND `Waktu_Down`=?  and `ip` = ?",
                                [formattedendDate, "23:59:59", tanggal_down, down_time_key,  ip]
                            );
                            results.push({
                                operation: "update",
                                post_id: result1 ? result1.insertId : null,
                            });
                            //endDate1 = formattedendDate;
                            newDate1 = formattednewDate;
                        } else {
                            const [update] = await DB.execute(
                                "UPDATE `his_voip` SET  `Tanggal_Up`=?, `Waktu_Up`=?  WHERE `Tanggal_Down`=? AND `Waktu_Down`=?  and `ip` = ?",
                                [formattedendDate, "23:59:59", newDate1, "00:00:00",  ip]
                            );
                            results.push({
                                operation: "update",
                                post_id: update ? update.insertId : null,
                            });
                        }
                        
                        //endDate1 = formattedendDate;
                        newDate1 = formattednewDate;
                        const [insertupdate] = await DB.execute(
                            "INSERT INTO `his_voip` (`alat`, `ip`, `Tanggal_Down`, `Waktu_Down`, `Tanggal_Up`, `Waktu_Up`) VALUES (?,?,?,?,?,?)",
                            [alat,ip, formattednewDate, "00:00:00", tanggal, time ]
                        );
                        results.push({
                            operation: "insert",
                            post_id: insertupdate.insertId,
                        });
                        const [update_durasi] = await DB.execute(
                            "Call calculation_durasi_voip ()"
                        );
                        results.push({
                            operation: "update_durasi",
                            post_id : update_durasi.insertId,
                        });
                    }
                    res.status(201).json({
                        ok: 1,
                        status: 201,
                        message: "Post has been created successfully",
                        results,
                    });
                    console.log("berhasil insert data ke database");
                }      
                    
                }
            }
        } catch (e) {
            next(e);
        }
    };


}

export default Controller;