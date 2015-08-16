/**
 * 发表类相关
 */

var mongodb = require('./db'),
    async = require('async');

/**
 * Post类
 * @param {[type]} name  [description]
 * @param {[type]} head  [description]
 * @param {[type]} title [description]
 * @param {[type]} tags  [description]
 * @param {[type]} post  [description]
 */
function Post(name, head, title, tags, post) {
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

/**
 * 存储文章的相关信息
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.prototype.save = function (callback) {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1 < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1),
        day = date.getDate() < 9 ? "0" + date.getDate() : date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes() < 9 ? "0" + date.getMinutes() : date.getMinutes(),

        time = {
            'date': date,
            'year': year,
            'month': year + "-" + month,
            'day': year + "-" + month + "-" + day,
            'minutes': year + "-" + month + "-" + day + " " + hour + ":" + minute
        },
    //	存储各种时间格式

        post = {
            'name': this.name,
            'head': this.head,
            'time': time,
            'title': this.title,
            'post': this.post,
            'tags': this.tags,
            'reprint_info': {},
            'comments': [],
            'pv': 0
        };
    //	要存储的文档格式

    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection('posts', function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.insert(post, {
                'safe': true
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        mongodb.close();
        callback(err);
    });
};


/**
 * 读取所有文章及相关信息
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getAll = function (name, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection('posts', function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({
                'time': -1
            }).toArray(function (err, docs) {
                cb(err, docs);
            });
        }
    ], function (err, docs) {
        mongodb.close();
        callback(err, docs);
    });
};

/**
 * 分页实现,一次获取10篇文章
 * @param  {[type]}   name     [description]
 * @param  {[type]}   page     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getTen = function (name, page, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err,db);
            });
        },
        function (db, cb) {
            db.collection('posts', function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.count(query, function (err, total) {
                collection.find(query, {
                    'skip': (page - 1) * 10,
                    'limit': 10
                }).sort({
                    'time': -1
                }).toArray(function (err, docs) {
                    callback(err, docs, total);
                });
            });
        }
    ], function (err, docs, total) {
        mongodb.close();
        callback(err, docs, total);
    });
};

/**
 * 获取一篇文章
 * @param  {[type]}   name     [description]
 * @param  {[type]}   day      [description]
 * @param  {[type]}   title    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getOne = function (name, day, title, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err,db);
            });
        },
        function (db, cb) {
            db.collection('posts', function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.findOne({
                'name': name,
                'title': title,
                'time.day': day
            }, function (err, doc) {
                cb(err, doc, collection);
            });
        },
        function (doc,collection,cb) {
            collection.update({
                'name': name,
                'title': title,
                'time.day': day
            }, {
                '$inc': {
                    'pv': 1
                }
            }, function (err) {
                cb(err,doc);
            });
        }
    ], function (err, doc) {
        mongodb.close();
        callback(err, doc);
    });
};

/**
 * 返回之前发表或者最后一次编辑提交的内容
 * @param  {[type]}   name     [description]
 * @param  {[type]}   day      [description]
 * @param  {[type]}   title    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.edit = function (name, day, title, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.findOne({
                'name':name,
                'time.day':day,
                'title':title
            },function(err,doc){
                cb(err,doc);
            });
        }
    ],function(err,doc){
        mongodb.close();
        callback(err,doc);
    });
};

/**
 * 把文章更新到数据库
 * @param  {[type]}   name     [description]
 * @param  {[type]}   day      [description]
 * @param  {[type]}   title    [description]
 * @param  {[type]}   post     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.update = function (name, day, title, post, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.update({
                'title':title,
                'time.day':day,
                'name':name
            },{
                '$set':{
                    'post':post
                }
            },
            function(err){
                cb(err);
            });
        }
    ],function(err){
        mongodb.close();
        callback(err);
    });
};

/**
 * 从数据库中删除一篇文章
 * @param  {[type]}   name     [description]
 * @param  {[type]}   day      [description]
 * @param  {[type]}   title    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.remove = function (name, day, title, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.findOne({
                'name': name,
                'time.day': day,
                'title': title
            }, function (err, doc) {
                cb(err,doc,collection);
            });
        },
        function(doc,collection,cb){
            var reprint_from;
            if (doc.reprint_info.reprint_from) {
                reprint_from = doc.reprint_info.reprint_from;
            }
            if (reprint_from) {
                collection.update({
                    'name': reprint_from.name,
                    'time.day': reprint_from.day,
                    'title': reprint_from.title
                }, {
                    '$pull': {
                        'reprint_info.reprint_to': {
                            'name': name,
                            'day': day,
                            'title': title
                        }
                    }
                }, function (err) {
                    //  更新原文中的转载信息,$pull用于删除数组中的特定项

                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                    //  更新失败

                });
            }
            collection.remove({
                'name': name,
                'time.day': day,
                'title': title
            }, {
                'w': 1
            }, function (err) {
                cb(err);
            });
        }
    ],function(err){
        mongodb.close();
        callback(err);
    });
};

/**
 * 返回所有文章的存档信息
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getArchive = function (callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.find({}, {
                'name': 1,
                'time': 1,
                'title': 1
            }).sort({
                'time': -1
            }).toArray(function (err, docs) {
                cb(err,docs);
            });
        }
    ],function(err,docs){
        mongodb.close();
        callback(err,docs);
    });
};

/**
 * 获取所有的分类标签
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getTags = function (callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.distinct('tags', function (err, docs) {
                cb(err,docs);
            });
        }
    ],function(err,docs){
        mongodb.close();
        callback(err,docs);
    });
};

/**
 * 获取指定的分类标签
 * @param  {[type]}   tag      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.getTag = function (tag, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.find({
                'tags': tag
            }, {
                'name': 1,
                'time': 1,
                'title': 1
            }).toArray(function (err, docs) {
                cb(err,docs);
            });
        }
    ],function(err,docs){
        mongodb.close();
        callback(err,docs);
    });
};

/**
 * 根据条件搜索
 * @param  {[type]}   keyword  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Post.search = function (keyword, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({
                'title': pattern
            }, {
                'time': 1,
                'title': 1,
                'name': 1
            }).sort({
                'time': -1
            }).toArray(function (err, docs) {
                cb(err,docs);
            });
        }
    ],function(err,docs){
        callback(err,docs);
    });
};

/**
 * 转载一篇文章
 * @param  {[type]}   reprint_from [description]
 * @param  {[type]}   reprint_to   [description]
 * @param  {Function} callback     [description]
 * @return {[type]}                [description]
 */
Post.reprint = function (reprint_from, reprint_to, callback) {
    async.waterfall([
        function(cb){
            mongodb.open(function(err,db){
                cb(err,db);
            });
        },
        function(db,cb){
            db.collection('posts',function(err,collection){
                cb(err,collection);
            });
        },
        function(collection,cb){
            collection.findOne({
                'name': reprint_from.name,
                'time.day': reprint_from.day,
                'title': reprint_from.title
            }, function (err, doc) {
                cb(err,doc,collection);
            });
        },
        function(doc,collection){
            var date = new Date(),
                time = {
                    'date': date,
                    'year': date.getFullYear(),
                    'month': date.getFullYear() + "-" + (date.getMonth() + 1),
                    'day': date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                    'minutes': date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
                };
            delete doc._id;
            doc.name = reprint_to.name;
            doc.head = reprint_to.head;
            doc.time = time;
            doc.title = doc.title.search(/[转载]/g) > -1 ? doc.title : "[转载]" + doc.title;
            doc.comments = [];
            doc.reprint_info = {
                'reprint_from': reprint_from
            };
            doc.pv = 0;
            collection.update({
                'name': reprint_from.name,
                'time.day': reprint_from.day,
                'title': reprint_from.title
            }, {
                '$push': {
                    'reprint_info.reprint_to': {
                        'name': doc.name,
                        'day': time.day,
                        'title': doc.title
                    }
                }
            }, function (err) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.insert(doc, {
                    'safe': true
                }, function (err, post) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, post[0]);

                });
            });
        },
        function(doc){}
    ],function(){
        mongodb.close();
    });
};

module.exports = Post;