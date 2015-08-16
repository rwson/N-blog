/**
 * 评论类
 */

var mongodb = require('./db'),
	async = require('async');

/**
 * 评论类
 * @param {[type]} name    [description]
 * @param {[type]} day     [description]
 * @param {[type]} title   [description]
 * @param {[type]} comment [description]
 */
function Comment(name,day,title,comment){
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
}

/**
 * 存储一条留言信息
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Comment.prototype.save = function(callback){
	var name = this.name,
		day = this.day,
		title = this.title,
		comment = this.comment;

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
				'name':name,
				'title':title,
				'time.day':day
			},{
				'$push':{
					'comments':comment
				}
			},function(err){
				cb(err);
			});
		}
	],function(err){
		mongodb.close();
		callback(err);
	});
};

/**
 * 如果当前用户是文章作者,可以删除评论
 * @param  {[type]}   name     [description]
 * @param  {[type]}   day      [description]
 * @param  {[type]}   title    [description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Comment.delete = function(name,day,title,id,callback){
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
                'title': title,
                'time.day': day
            }, function (err, doc) {
                cb(err, doc, collection);
            });
		},
		function(doc,collection,cb){
			if(doc){
				var comment = doc.comments,
					tmpArr = [];
				comment.forEach(function(item, index){
					if(item.id == id){
					}else{
						tmpArr.push(item);
					}
				});
				collection.update({
	                'title':title,
	                'time.day':day,
	                'name':name
	            },{
	                '$set':{
	                    'comments':tmpArr
	                }
	            },
	            function(err){
	                cb(err);
	            });
			}
		}
	],function(err){
		mongodb.close();
		callback(err);
	});
};

module.exports = Comment;