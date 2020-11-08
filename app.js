const express = require('express'),
	bodyparser = require('body-parser'),
	dotEnv = require('dotenv'),
	dbconn = require('./db');

const app = express();
    
dotEnv.config({ path: './.env' });
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('./public'));

dbconn.connect();
const port = process.env.PORT || 8888;


app.get('/', (req, res)=>{
    res.render("visitor");
});

app.get("/visitor/listing", (req, res)=>{
    const sql = {
        text: `select id, name, mobile, address, destination, to_char(last_intime, 'DD-MM-YYY HH12:MI:SS') custInTime, to_char(last_outtime , 'DD-MM-YYY HH12:MI:SS') custOutTime from visitor_master order by last_outtime desc`,
        values: []
    }
    dbconn
    .query(sql)
    .then(result=>{
        res.send(result.rows)
    }).catch(e=>{
        //console.log(e.message)
        res.status(404).send("Error");
    })
})

app.get("/visitor/log", (req, res)=>{
    const sql = {
        text: `select id, visitor_id, name, mobile, address, destination, to_char(intime, 'DD-MM-YYY HH12:MI:SS') custInTime, to_char(outtime , 'DD-MM-YYY HH12:MI:SS') custOutTime from visitor_log order by intime desc`,
        values: []
    }
    dbconn
    .query(sql)
    .then(result=>{
        res.send(result.rows)
    }).catch(e=>{
        //console.log(e.message)
        res.status(404).send("Error");
    })
})

app.get("/visitor/log/search", (req, res)=>{
    const sql = {
        text: `select id, visitor_id, name, mobile, address, destination, to_char(intime, 'DD-MM-YYY HH12:MI:SS') custInTime, to_char(outtime , 'DD-MM-YYY HH12:MI:SS') custOutTime from visitor_log where name like $1 or cast(mobile as text) like $1 order by intime desc`,
        values: [req.query.logSearchParam+'%']
    }
    dbconn
    .query(sql)
    .then(result=>{
        res.send(result.rows)
    }).catch(e=>{
        //console.log(e.message)
        res.status(404).send("Error");
    })
})

app.get("/visitor/listing/search", (req, res)=>{
    const sql = {
        text: `select id, visitor_id, name, mobile, address, destination, to_char(intime, 'DD-MM-YYY HH12:MI:SS') custInTime, to_char(outtime , 'DD-MM-YYY HH12:MI:SS') custOutTime from visitor_log where cast(mobile as text) like $1 or (intime::date > $2 and intime::date < $3) order by intime desc`,
        values: [req.query.searchParam+'%', req.query.fromDate, req.query.toDate]
    }
    dbconn
    .query(sql)
    .then(result=>{
        res.send(result.rows)
    }).catch(e=>{
        //console.log(e.message)
        res.status(404).send("Error");
    })
})



app.post("/visitor/in", (req, res)=>{ 
    if(!req.body.name || !req.body.mobile || !req.body.address || !req.body.destination){
        return res.sendStatus(404);
    } else{ //check whether visitor available in master table
        const checkMasterVisitor = {
            text   : `select id from visitor_master where name =  $1`,
            values : [ req.body.name ]
        };
    
        dbconn
        .query(checkMasterVisitor)
        .then(id_master=>{
            let updateMasterVisitor = { text: ``, values: [] }

            if(id_master.rows[0] === undefined){ //if not, insert visitor
                updateMasterVisitor = {
                    text: `insert into visitor_master (name, mobile, address, destination, last_intime) values ($1, $2, $3, $4, current_timestamp(0));`,
                    values: [req.body.name, req.body.mobile, req.body.address, req.body.destination]
                }
            } else{ // if yes, update
                updateMasterVisitor = {
                    text: `update visitor_master set last_intime = current_timestamp(0) where name = $1`,
                    values: [req.body.name]
                }

            }
            dbconn
            .query(updateMasterVisitor)
            .then(masterTableSuccess=>{
                const getMasterVisitorID = {
                text   : `select id from visitor_master where name =  $1`,
                values : [ req.body.name ]
                }
                dbconn
                .query(getMasterVisitorID)
                .then(masterID=>{
                    const updateVisitorLog = {
                        text   : `insert into visitor_log (visitor_id, name, mobile, address, destination, intime) values ($1, $2, $3, $4, $5, current_timestamp(0))`,
                        values : [ masterID.rows[0].id, req.body.name, req.body.mobile, req.body.address, req.body.destination ]
                    }
                    dbconn
                    .query(updateVisitorLog)
                    .then(updateLogSuccess=>{
                        res.status(200).send("DB Updated")
                    }).catch(e=>{
                        //console.log("Visitor Log: ", e.message);
                        res.send(e.message);
                    })
                }).catch(e=>{
                    //console.log("Visitor Master: ", e.message);
                    res.send(e.message);
                })

            }).catch(e=>{
                //console.log("Visitor Master: ", e.message);
                res.send(e.message);
            })
        }).catch(e=>{
            //console.log("Visitor Master: ", e.message);
            res.send(e.message);
        })
    }
})

app.post("/visitor/out", (req, res)=>{
    if(!req.body.logId || !req.body.masterId){
        return res.sendStatus(404);
    } else{
        const checkMasterVisitor = {
            text   : `select id from visitor_master where id =  $1`,
            values : [ req.body.masterId ]
        };
    
        dbconn
        .query(checkMasterVisitor)
        .then(masterID=>{
            const updateMasterVisitor = {
                text   : `update visitor_master set last_outtime = current_timestamp(0) where id =  $1`,
                values : [ masterID.rows[0].id ]
            };
            dbconn
            .query(updateMasterVisitor)
            .then(updateMasterSuccess=>{
                const updateVisitorLog = {
                    text   : `update visitor_log set outtime = current_timestamp(0) where id =  $1`,
                    values : [ req.body.logId  ]
                }
                dbconn
                .query(updateVisitorLog)
                .then(updateLogSuccess=>{
                    res.status(200).send("DB Updated");
                }).catch(e=>{
                    //console.log("Visitor Log: ", e.message);
                    res.send(e.message);
                })
            }).catch(e=>{
                //console.log("Visitor Master: ", e.message);
                res.send(e.message);
            })
        }).catch(e=>{
            //console.log("Visitor Master: ", e.message);
            res.send(e.message);
        })
    }
})


app.listen(port, ()=>{console.log("Server started on ", port)});