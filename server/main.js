liveDb = new LiveMysql({
    host: 'localhost'
    , user: 'case'
    , password: 'pass'
    , database: 'case'
    , minInterval: 200
});


var closeAndExit = function () {

    liveDb.end();

    process.exit();

};

// Close connections on hot code push

process.on('SIGTERM', closeAndExit);

// Close connections on exit (ctrl + c)

process.on('SIGINT', closeAndExit);

Meteor.publish('Usersl', function (name) {
    check(name, String);

    return liveDb.select(
        'SELECT * FROM users WHERE steamid64 = ' + liveDb.db.escape(name), [
            {
                table: 'users'
        }
      ]
    );
});


Meteor.publish('allCase', function () {

    return liveDb.select(
        'SELECT * FROM `case` WHERE `id` != 0 ORDER BY `nomer` DESC', [{
            table: 'case'
                }]
    );
});



Meteor.publish('Users', function () {

    return liveDb.select(
        'select * FROM `users`', [{
            table: 'users'
                }]
    );



});




Meteor.publish('TopUser', function () {

    return liveDb.select(
        'select `users`.`id`, `users`.`username`, `users`.`avatar`, `users`.`steamid64`, `game`.`case` as `case`, SUM(game.price) as top_value, SUM(case.price) as moneys, COUNT(game.id) as games_played from `users` inner join `game` on `game`.`userid` = `users`.`id` and `game`.`status` = 1 and `case` > 0 inner join `case` on `case`.`id` = `game`.`case` group by `users`.`id` order by `top_value` desc limit 20', [{
            table: 'users'
            , table: 'game'
                }]
    );
});






Meteor.publish('Case', function (name) {
    check(name, String);

    console.log(name);
    return liveDb.select(
        'SELECT * FROM `case`  inner join `items` on `case`.`id` = `items`.`case_id`    where `case`.`id` = ' + liveDb.db.escape(name), [{
            table: 'case'
                }]
    );


});