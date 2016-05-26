//Your client side DOES NOT REQUIRE ANY CHANGES!!!
/*
select `users`.`id`, `users`.`username`, `users`.`avatar`, `users`.`steamid64`, `game`.`case` as `case`, SUM(game.price) as top_value, SUM(case.price) as moneys, COUNT(game.id) as games_played from `users` inner join `game` on `game`.`userid` = `users`.`id` and `game`.`status` = 1 and `case` > 0 inner join `case` on `case`.`id` = `game`.`case` group by `userss`.`id` order by `top_value` desc limit 20
*/


Case = new MysqlSubscription('allCase');
TopUser = new MysqlSubscription('TopUser');
Users = new MysqlSubscription('Users');




if (Meteor.isClient) {


    Tracker.autorun(function () {

      
            Caseinfo = new MysqlSubscription('Case', Session.get('currentCaseID'));
       


    })

  

    Meteor.startup(function () {


        if (Meteor.user()) {
            Steaid64 = Meteor.user().profile.steamid;
            UserAuth = new MysqlSubscription('Usersl', Steaid64);
            Template.header.helpers({

                User: function () {
                    UserAuth.depend();
                    return UserAuth[0];
                }
            });
        }
    });





    Meteor.OpenCase = function (options) {
        $('.canvas-container-inner').html();

        function getImage(str, w, h) {
            w = w || 384;
            h = h || 384;
            return '//steamcommunity-a.akamaihd.net/economy/image/class/730/' + str + '/' + w + 'fx' + h + 'f';
        }

        function getName(name) {
            var arr = name.split('|');
            return (arr.length == 1) ? name : arr[1];
        }
        Array.prototype.shuffle = function () {
            var o = this;
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        }
        Array.prototype.mul = function (k) {
            var res = []
            for (var i = 0; i < k; ++i) res = res.concat(this.slice(0))
            return res
        }
        Math.rand = function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function fillCarusel() {
            var casesCarusel = $('.canvas-container-inner');

            var cases = [];
            for (var i in Session.get('ItemCase')) {
                if (Session.get('ItemCase').hasOwnProperty(i)) {
                    cases.push(Session.get('ItemCase')[i]);
                }
            }
            console.log(cases);
            var a1 = cases.filter(function (weapon) {
                return weapon.type == 'milspec'
            }).slice(0).mul(5).shuffle()
            var a2 = cases.filter(function (weapon) {
                return weapon.type == 'restricted'
            }).slice(0).mul(5).shuffle()
            var a3 = cases.filter(function (weapon) {
                return weapon.type == 'classified'
            }).slice(0).mul(4).shuffle()
            var a4 = cases.filter(function (weapon) {
                return weapon.type == 'covert'
            }).slice(0).mul(4).shuffle()
            var a5 = cases.filter(function (weapon) {
                return weapon.type == 'rare'
            }).slice(0).mul(2).shuffle()

            var arr = a1.concat(a2, a3, a4, a5).shuffle().shuffle().shuffle()


            //  var arr = cases.slice(0).shuffle();
            var el = ''
            arr.forEach(function (item, i, arr) {


                el += '<div class="itm ' + item.type + '">' +
                    '<img src="' + getImage(item.classid, 80, 70) + '" alt="" title=""/> <div class="name"> ' + item.market_name + '</div> </div>'


            });
            casesCarusel.css("margin-left", "0px")
            casesCarusel.html('<div id="caruselLine"></div><div id="aCanvas"><div id="caruselOver"></div><div id="casesCarusel" class="slider" style="margin-left: 0px;">' + el + '</div></div>')
        }

        fillCarusel();
        console.log(5);
        $('#casesCarusel').animate({
            marginLeft: -1 * Math.rand(1331 + 16 * 124, 1331 + 16 * 124 + 109)
        }, {
            duration: 10000
            , easing: 'swing'
            , //easing: 'easeInSine',
            start: function () {
                // opencaseaudio.play()
            }
            , complete: function () {
                //  openingCase = false;
                // caseCloseAudio.play()
                //additem(currentCase, upchancePrice, id_item, game_id);

                setTimeout(function () {



                    //   $('.win').fadeIn(300);
                    // $('.game .bilet .win .name').html(weapon.fullname + ' | ' + weapon.spacename)
                    // $('.game .bilet .win img').attr('src', getImage(weapon.classid, 383, 383))
                }, 1000)

            }
        })

    }

    Template.game.events({
        'click button.opencase, .button.opencase': function () {
            Meteor.OpenCase();

        }

    });


    Template.faq.events({

        'click .faq-q': function (e) {

            return $(e.currentTarget).toggleClass("active").next(".faq-a").slideToggle(300);
        }

    });

    Template.header.events({





        'click .authblock.login': function () {
            Meteor.loginWithSteam();
        },

        'click .userblock a.quit': function () {
            Meteor.logout();

        },



        'click a.user-balance.refill': function () {
            noty({
                text: '<div><div><strong>Ошибка</strong><br>5</div></div>'
                , layout: 'topRight'
                , type: 'error'
                , theme: 'relax'
                , timeout: 8000
                , closeWith: ['click']
                , animation: {
                    open: 'animated flipInX'
                    , close: 'animated flipOutX'
                }
            });
        }




    });




    Template.top.helpers({

        TopUser: function () {
            return TopUser.reactive();
        }
    });


    Template.footer.helpers({

        stats: function () {
            return {
                case: Case.reactive().length
                , usercount: Users.reactive().length
            }
        }
    });


    Template.index.helpers({
        cases: function () {
            return Case.reactive();
        }
    });



}