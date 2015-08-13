/**
 * 用户类操作相关-mongoose相关处理
 */

var mongodb = require('./db'),
    crypto = require('crypto'),
    avatarDir = require('../settings.js').avatarDir,
    mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blog');

var userSchema = new mongoose.Schema({
        'name':'String',
        'password':'String',
        'email':'String',
        'head':'String'
    },{
        'collection':'users'
    }),
    userModel = mongoose.model('User',userSchema);

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
        },
        newUser = new userModel(user);
    newUser.save(function(err,user){
        if(err){
            console.log("出错了");
            console.log(err);
            return callback(err);
        }
        console.log("注册成功");
        callback(null,user);
    });    
};

/**
 * 注册时判断用户名是否存在
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.get = function (name, callback) {
    userModel.findOne({'name':name},function(err,user){
        if(err){
            return callback(err);
        }
        callback(null,user);
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