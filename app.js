const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { MongoClient } = require('mongodb');
const email = require('./email.js');

const app = express();

const dbUrl = 'mongodb://127.0.0.1:27017';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', './views');

// parse application/json
app.use(bodyParser.json());


app.get('/login', (req, res) => {  //登录路由
    res.render('login');
});

app.get('/active', (req, res) => {  //邮箱激活路由
    const query = req.query;  //获取参数
    MongoClient.connect(dbUrl, (err, client) => {  //链接数据库
        if (err) {
            console.log(err);
            res.send('<script>alert("服务链接失败，请稍后重试！");</script>');
            return;
        }
        const db = client.db('emails');  //链接哪个数据库
        //查找数据库
        db.collection('userInfo').findOne({ "email": query.user, "code": parseFloat(query.code) }, (err, data) => {
            if (err) {
                console.log(err);
                res.send('<script>alert("服务链接失败，请稍后重试！");</script>');
                return;
            }
            if (data) {  //如果查找到当前用户信息
                db.collection('userInfo').update({ "email": query.user }, { $set: { "active": 1 } }, (err, data2) => {
                    if (err) {
                        console.log(err);
                        res.send('<script>alert("服务链接失败，请稍后重试！");</script>');
                        return;
                    }
                    res.send('<script>alert("邮箱激活成功！赶快去登录吧！");</script>');
                });
                
            } else {  //如果没有当前用户信息
                res.send('<script>alert("邮箱激活失败，请确定邮箱激活链接是否输入正确！");</script>');
            }
        });
    });
});

app.post('/doLogin', (req, res) => {
    const code = Math.random();
    let obj = {
        "email": req.body.username,
        "password": req.body.password,
        code,
        "active": 0
    };

    MongoClient.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err);
            res.send('<script>alert("服务链接失败，请稍后重试！"); location.href="/login"</script>');
            return;
        }
        const db = client.db('emails');
        db.collection('userInfo').findOne({ "email": req.body.username }, (err, data) => {
            if (data) {
                if (data.active === 0) {
                    db.collection('userInfo').update({ "email": req.body.username }, { $set: { "code": code, "password": req.body.password } }, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.send('<script>alert("服务链接失败，请稍后重试！"); location.href="/login"</script>');
                            return;
                        }
                        email(req.body.username, code);
                        res.send('<script>alert("注册成功,请前往邮箱激活"); location.href="/login"</script>');
                    })
                } else if (data.active === 1) {
                    res.send('<script>alert("此邮箱已经被注册！"); location.href="/login"</script>');
                }
            } else {
                db.collection('userInfo').insertOne(obj, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.send('<script>alert("服务链接失败，请稍后重试！"); location.href="/login"</script>');
                        return;
                    }
                    email(req.body.username, code);
                    res.send('<script>alert("注册成功,请前往邮箱激活"); location.href="/login"</script>');
                });
            }
        })
    });

});

app.listen(3000, '127.0.0.1', () => {
    console.log('server run at 127.0.0.1:3000');
});