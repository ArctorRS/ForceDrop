Router.configure({
    layoutTemplate: 'layout'
    , loadingTemplate: 'loading'

});




Router.route('/', {
    name: 'index'
});



Router.route('/top', {
    name: 'top'
});

Router.route("/trades", function () {
    return this.render("trades")
});

Router.route('/login', {
    name: 'login'
    , action(params, queryParams) {
        console.log("Looking at a list?");
    }
});




Router.route("/user/:_id?", function () {

    return this.render("user"), this.ready() && !this.data() ? (this.render("notFound"), this.layout("notFoundLayout")) : void 0
}, {

    data: function () {

        if (isNaN(Number(this.params._id))) {
            if (typeof UserAuth === 'undefined') {
                return this.render("notFound"), this.layout("notFoundLayout");
            } else {
                UserAuth.depend();
                return {
                    user: UserAuth[0]
                };
            }
        } else {
            Users.depend();
            return {
                user: Users[this.params._id - 1]
            };
        }
    }
    , name: "user"
});



Router.route('/case/:id', {
    name: 'game',

    data: function () {
        var id = this.params.id;
        Session.set("currentCaseID", id);
        Session.set("ItemCase", Caseinfo.reactive());
        var id = this.params.id;

        if (typeof UserAuth === 'undefined') {

            console.log(Caseinfo.reactive());
            console.log(228);
            return {
                casein: Caseinfo[0]
                , caseinfo: Caseinfo.reactive()
            };

        } else {
            UserAuth.depend();
            return {
                casein: Caseinfo[0]
                , caseinfo: Caseinfo.reactive()
                , User: UserAuth[0]
            };

        }






    }

});

Router.route('/faq', {
    name: 'faq'
});
Router.route('/partner', {
    name: 'partner'
});