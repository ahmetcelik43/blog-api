const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const PORT =80;
//const functions = require("firebase-functions");
const config=require('./config')

app.use("/auth", require("./router/auth"));
app.use("/admin", require("./middleware/verify"));
app.use("/admin", require("./router/admin"));
app.use("/cats", require("./middleware/verify"));
app.use("/cats", require("./router/cats"));
app.use("/tags", require("./middleware/verify"));
app.use("/tags", require("./router/tag"));

app.get("/", async(request, response, next) => {
    response.send('OK')
})
app.get("/fake-pass", async(request, response, next) => {
        const { password } = request.body;
        console.log(request.body)
        const hashedPass = await bcrypt.hash(request.body.password, 10)
        response.json({
            status: true,
            hashedPass
        });
    })
    //exports.app = functions.https.onRequest(app);
app.listen(PORT, "127.0.0.1",() => {
    console.log("Sunucu Başarılı bir şekilde çalışıyor..." + " port:" + PORT);
});
// const mysql = require('mysql');
// const webPush = require("web-push");
//const vapidKeys = webPush.generateVAPIDKeys();
//console.log(vapidKeys);
// const vapidKeys =
// {
//   publicKey: 'BO_GWC2iDnuJb2oGUSwC9SiUcvpM-HcklMDXDR-UV4WJ8ziq23u1JDntFrCu-h8W8XglgzJV4xutwPefTqBbjGA',
//   privateKey: 'l9jc3ut4N-4o25N4EKKENgwiUC1YBcbh27s8dCzrvCo'
// }
// webPush.setGCMAPIKey('AIzaSyAm5-b8unXmYcXelxm8j7X2csln6trDwME');
//
// webPush.setVapidDetails("mailto:ahmet.celik5443@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);


// app.post("/send_notification", (req, res) => {
//     if (req.body.clientsID && req.body.yazi) {
//
//         req.body.clientsID.forEach(function(id){
//             let id_= JSON.parse(id);
//             webPush.sendNotification(id_,req.body.yazi[0].baslik)
//
//         })
//
//       return res.status(201).send({
//         message: "Bildirimler gönderildi..",
//       });
//     } else {
//       return res.status(400).send({ message: "Eksik bilgi gönderildi..." });
//     }
//   });


//   const socketIO = require('socket.io');
//   const io = socketIO(1234);
//
//   io.on('connection', (socket) => {
//     socket.send('Hoşgeldiniz sayın ' + socket.id);
//     socket.on('disconnect', () => {
//       console.log('Bir kullanıcı ayrıldı: ' + socket.id);
//     });
//   });
// console.log('ok');
/*
{"endpoint":"https://fcm.googleapis.com/fcm/send/czmAx9qMoQE:APA91bGfMbCuWKFWDzMQ8skn76jxJptSrmN3w7M8gF7wR5NGX2ZBzZVR_buyXnWGCKFGEKJ_4Vp-YkDg6TJWG2Ir8U0MeNls997-PPMEb8GnxpZcoXmTXgY91YYDO2zNteGpI3gs5iwO","expirationTime":null,"keys":{"p256dh":"BJ6CnGvYd0p4tOcNCR22ytEaWkLaqZXFmHo9bycAwVb_iCkKA5-dYUxDpM1-IUMhJrgdfExtVgz6zEK1BgvCqqg","auth":"Alu9hVnh1dg6ePXdsd-8Uw"}}*/
