$(document).ready(function () {
    CARD.init();
});

var lastState = [];
var checkTimers = [];


function clearOpened() {
    $("[data-opened=1]").addClass("tada animated").wScratchPad("clear");
}

function loadTicketState() {
    if (currentCase == 'tutorial') {
        return;
    }
    $.get("/casestate",{currentCase:currentCase},
        function (data) {

            if (data.buyed) {
                ticket_id = data.ticket_number;
                $(".game .bilet .play").fadeOut(500);
                $('.playcard').addClass('active');
                if (data.open_slots)
                    data.open_slots.forEach(function (slot, i, a) {
                        var caseScratch = $("#case-" + slot.slot_id + " .item-scratch");
                        caseScratch.addClass(slot.rarity);
                        var img = $('<img>');
                        img.attr('src', '//steamcommunity-a.akamaihd.net/economy/image/class/730/'+slot.classid+'/125fx125f');
                        img.appendTo(caseScratch.children('.picture'));
                        caseScratch.children('.descr').html('<strong>' + slot.weapon_name + '</strong> <span>' + slot.skin_name + '</span>');
                        caseScratch.show();
                        var caseCard = $("#case-" + slot.slot_id);
                        caseCard.data("finalized", 1);
                        caseCard.wScratchPad("clear").wScratchPad("enable", false);
                        //caseCard.attr("data-opened", 1);
                    });
                switch (data.state) {
                    case "lose":

                        if (data.probability_id > 0) {

                            var loseBlock = $('.card-extraerase');
                            var possibleName = data.probable.weapon_name;
                            if (data.probable.skin_name) {
                                possibleName = possibleName + ' | ' + data.probable.skin_name;
                            }
                            loseBlock.find('#possible_item').html(possibleName);
                            loseBlock.find('.extraPrice').html(Number(data.slot_price).toFixed(2));
                            if (data.need_refill) {
                                loseBlock.find('#extraerase').attr('disabled', 'disabled');
                                loseBlock.find('.refill').show();
                            }
                            loseBlock.show();
                            $('.game .arrows').show();
                        }
                        $('.arrows').attr('style', 'background-position: -48px;');
                        $(".scratchcases .scratchcase").each(function () {
                            $("#case-" + $(this).data("id")).wScratchPad("enable", false);
                        });
                        $('.game .arrows').show();
                        $("#case-10").wScratchPad("enable", true);
                        break;
                    case "next":
                        break;
                    default:
                }
            }
            $("#ticket-preloader").hide();
            $(".playcard").show();
        },
        'json'
    );
}

function checkStatus(id) {
    if (!lastState[id]) {
        return;
    }
    clearInterval(checkTimers[id]);
    lastStateSlot = lastState[id];
    switch (lastStateSlot.action) {
        case "win":
            $('.win img').attr('src', '//steamcommunity-a.akamaihd.net/economy/image/class/730/'+lastStateSlot.classid+'/153fx153f')
            $('.win .name').text(lastStateSlot.weapon_name+' | '+lastStateSlot.skin_name)
            $(".playcard").addClass("won_" + lastStateSlot.rarity);
            $('.btn-sell-item span').text(lastStateSlot.steam_price);
            $('.btn-sell-item').data('bsh', lastStateSlot.bsh);
            $('.btn-sell-item').data('order',lastStateSlot.csid);
            if (!lastStateSlot.sellable) {
                $(".btn-sell-item").hide();
            }
            if (lastStateSlot.csid)
                $(".btn-sell-item").data('csid', lastStateSlot.csid);
            $.post("/reveal", {
                    card: ticket_id
                },
                function (data) {
                    //console.log(data);
                    if (data.slots)
                        data.slots.forEach(function (slot, i, a) {
                            if (!slot) return;
                            var caseScratch = $("#case-" + i + " .item-scratch");
                            caseScratch.addClass(slot.rarity);
                            var img = $('<img>');
                            img.attr('src', '//steamcommunity-a.akamaihd.net/economy/image/class/730/'+slot.classid+'/125fx125f');
                            img.appendTo(caseScratch.children('.picture'));
                            caseScratch.children('.descr').html('<strong>' + slot.weapon_name + '</strong> <span>' + slot.skin_name + '</span>');
                            caseScratch.show();
                            caseScratch.siblings('canvas').fadeOut();
                            var caseCard = $("#case-" + slot.slot_id);
                            caseCard.data("finalized", 1);
                        });
                    setTimeout(function () {
                        $('.win').fadeIn('fast');
                    }, 1000);

                },
                'json'
            );
            break;
        case "lose":
            if (lastStateSlot.probability_id > 0) {
                var loseBlock = $('.card-extraerase');
                var possibleName = lastStateSlot.probable.weapon_name;
                if (lastStateSlot.probable.skin_name) {
                    possibleName = possibleName + ' | ' + lastStateSlot.probable.skin_name;
                }
                loseBlock.find('#possible_item').html(possibleName);
                if (lastStateSlot.slot_price > 0) {
                    loseBlock.find('.extraPrice').html(Number(lastStateSlot.slot_price).toFixed(2));
                }
                if (lastStateSlot.need_refill) {
                    loseBlock.find('#extraerase').attr('disabled', 'disabled');
                    loseBlock.find('.refill').show();
                }

                loseBlock.fadeIn();
                $('.arrows').attr('style', 'background-position: -48px;');
                $('.game .arrows').show();

            } else if (currentCase == 'tutorial') {
                $('.playcard-teacher3').fadeIn();
            }

            $('.arrows').attr('style', 'background-position: -48px;');
            $('.game .arrows').show();
            $(".scratchcases .scratchcase").each(function () {
                $("#case-" + $(this).data("id")).wScratchPad("enable", false);
            });
            $("#case-10").wScratchPad("enable", true);
            break;
        default:
    }

}

function caseScratched(id) {
    $.post("/play", {
            action: 'scratch',
            act: 'scratch',
            data: id
        },
        function (data) {
            if (data.success) {
                var caseScratch = $("#case-" + id + " .item-scratch");
                caseScratch.addClass(data.rarity);
                var img = $('<img>'); //Equivalent: $(document.createElement('img'))
                img.attr('src', '//steamcommunity-a.akamaihd.net/economy/image/class/730/'+data.classid+'/125fx125f');
                img.appendTo(caseScratch.children('.picture'));
                caseScratch.children('.descr').html('<strong>' + data.weapon_name + '</strong> <span>' + data.skin_name + '</span>');
                caseScratch.show();
                lastState[id] = data;
                if (data.action != 'next') {
                    $(".scratchcases .scratchcase").each(function () {
                        if ($(this).data("id") != id)
                            $("#case-" + $(this).data("id")).wScratchPad("enable", false);
                    });
                }
            } else {
                showNotification(data.error, 'error');
            }
        },
        'json'
    );
}

function enableCard() {
    $(".scratchcases .scratchcase").each(function () {
        var t = $(this).data("id");
        var caseCard = $("#case-" + t);
        caseCard.wScratchPad({
            size: 25,
            bg: "/images/empty.png",
            fg: "/images/wash.png",
            cursor: 'url("/images/coin.png") 5 5, default',
            scratchMove: function (a, e) {
                if (e > 60 && !caseCard.data("finalized")) {
                    caseCard.data("finalized", 1);
                    this.clear();
                    checkTimers[t] = setInterval(function () {
                        checkStatus(t);
                    }, 100);
                    //checkStatus(t);
                    caseCard.addClass("tada animated")
                }
            },
            scratchDown: function (a, e) {
                if (!caseCard.data("opened")) {
                    clearOpened();
                    caseScratched(t);
                    caseCard.attr("data-opened", 1);
                }
            }
        });
    });
    var caseCard = $("#case-10");
    caseCard.wScratchPad({
        size: 25,
        bg: "/images/empty.png",
        fg: "/images/garanty.png",
        cursor: 'url("/images/coin.png") 5 5, default',
        scratchMove: function (a, e) {
            if (e > 60 && !caseCard.data("finalized")) {
                caseCard.data("finalized", 1);
                this.clear();
                checkTimers[10] = setInterval(function () {
                    checkStatus(10);
                }, 100);
//                checkStatus(10);
                caseCard.addClass("tada animated")
            }
        },
        scratchDown: function (a, e) {
            if (!caseCard.data("opened")) {
                $('.card-extraerase').fadeOut();
                $(".playcard").removeClass("active_arrow_left");
                //clearOpened();

                caseScratched(10);
                caseCard.attr("data-opened", 1);
            }
        }
    });
    caseCard.wScratchPad("enable", false);
}

function showNotification(text, type) {
    var n = noty({
        text: text,
        type: type,
        animation: {
            open: {height: 'toggle'},
            close: {height: 'toggle'},
            easing: 'swing',
            speed: 500
        },
        timeout: 5000,
        layout: 'bottom'
    });
}
$(document).ready(function () {

    $(document).on('click', ".btn-sell-item", function(e) {
        var that = $(this);
        var type = that.is(".sellBotBtn") ? 'sell' : 'wai';
        $('.box-modal_close').show();
        $.ajax({
            url: '/select/aj_sell_or_wait',
            type: 'POST',
            dataType: 'json',
            data: {
                act: 'sellORwait',
                action: 'sellORwait', type: type, bsh: that.data('bsh'), order_id: that.data('order') },
            success: function(data) {
                $("#aftersellBlock1").show();
                if (data.status == 'success') {
                    $('.btn-sell-item').hide();
                    $('.btn-takeit').hide();
                    $('.game .bilet .win .buttons a:nth-of-type(1)').hide();
                    $('.game .bilet .win .buttons a:nth-of-type(3)').hide();
                    updateBalance(data.balance);
                } else {
                }
            }
        });
    });
    $('#gogame').click(function (e) {
        e.preventDefault();


        $.post('/newgame', {'case': currentCase, action: 'openCase'}, function (data) {
                if (data.success) {
                    $(".game .bilet .play").fadeOut(500);
                    if (data.balance) {
                        updateBalance(data.balance);
                    }
                    $('.playcard').addClass('active');
                    ticket_id = data.ticket_number;
                    if (currentCase == 'tutorial') {
                        $('.playcard-teacher1').fadeIn();
                    }
                }
                if (data.status == 'error_steam') {
                    noty({
                        text: '<div><div><strong>Error</strong><br>' + data.msg + '</div></div>',
                        layout: 'topRight',
                        type: 'error',
                        theme: 'relax',
                        timeout: 8000,
                        closeWith: ['click'],
                        animation: {
                            open: 'animated flipInX',
                            close: 'animated flipOutX'
                        }
                    });
                }
                if (data.status == 'error_bot') {
                    noty({
                        text: '<div><div><strong>Error</strong><br>' + data.msg + '</div></div>',
                        layout: 'topRight',
                        type: 'error',
                        theme: 'relax',
                        timeout: 8000,
                        closeWith: ['click'],
                        animation: {
                            open: 'animated flipInX',
                            close: 'animated flipOutX'
                        }
                    });

                }


            },
            'json'
        );
    });
    $('#extraerase').click(function (e) {
        e.preventDefault();

        $.post("/play", {  action: 'shans'},
            function (data) {
                if (data.success) {
                    $('.card-extraerase').hide();
                    $(".playcard").removeClass("active_case10 active_arrow_right active_arrow_left");
                    $(".scratchcases .scratchcase").each(function () {
                        $("#case-" + $(this).data("id")).wScratchPad("enable", true);
                    });
                    $("#case-10").wScratchPad("enable", false);
                    if (data.balance) {
                        updateBalance(data.balance);
                    }
                } else {
                    showNotification(data.error, 'error');
                }
            },
            'json'
        );
    });
    enableCard();
    setTimeout(loadTicketState, 500);

    $('.go-next').click(function (e) {
        location.reload();
    });

});