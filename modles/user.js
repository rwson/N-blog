/**
 * 用户类操作相关-mongodb和async相关
 */

var mongodb = require('./db'),
    crypto = require('crypto'),
    avatarDir = require('../settings.js').avatarDir,
    async = require('async');

/**
 * user类
 * @param {[type]} user [description]
 */
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

/**
 * 存储用户信息
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.prototype.save = function (callback) {
    var md5 = crypto.createHash('md5'),
        emailMd5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = 'http://zh-tw.gravatar.com/avatar' + emailMd5 + '?s=48',
        user = {
            'name': this.name,
            'password': this.password,
            'email': this.email,
            'head':head
        };

    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('users',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.insert(user,{
                'safe':true
            },function(err,user){
                cb(err,user);
            });
        }
    ],
    function(err,user){
        mongodb.close();
        callback(err,user[0]);
    });
};

/**
 * 注册时判断用户名是否存在
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.get = function (name, callback) {

    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('users',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.findOne({
                'name':name
            },function(err,user){
                cb(err,user);
            });
        }
    ],
    function(err,user){
        mongodb.close();
        callback(err,user);
    });
};

/**
 * 更新某个用户的信息
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.update = function(name,callback){
    mongodb.open(function(err,db){
        //  打开数据库

        if(err){
            return callback(err);
        }
        //  打开失败
    });
};

module.exports = User;