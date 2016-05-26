                                                                                                                //
Steam = {
	retrieveCredential: function(credentialToken) {
		return Oauth.retrieveCredential(credentialToken);
	},
	getIdentity: getIdentity
};

Oauth.registerService('steam', 2, null, function (query) {
 	query.state = _.last(query['openid.return_to'].split('?close&'));
	var steamId = getSteamId(query);
	var identity = getIdentity(steamId);
    
     
    identity.id = identity.steamid;
	delete identity["steamid"];
	identity.username = identity.personaname;
	identity.avatar = {small: identity.avatar, medium: identity.avatarmedium, full: identity.avatarfull};
	delete identity["avatarmedium"];
	delete identity["avatarfull"];
    
    

        
    liveDb.db.query('SELECT * FROM `users` WHERE `steamid64` = ' + identity.id, function (err, rows) {
        if('undefined' == typeof rows[0])  
        {
     
    liveDb.db.query("INSERT INTO `users` (`id`, `username`, `steamid64`, `avatar`,   `partner`) VALUES('', '" + identity.personaname + "','" +  identity.id + "','" + identity.avatar.full + "','0')");
        
        }else{
            
            liveDb.db.query("UPDATE users SET  `username` = '"+identity.personaname+"' , `avatar` = '"+identity.avatar.full+"' WHERE `users`.`id` = "+rows[0].id);
            
        }
          
    });
    


     
    
    
 
    
    
    
    
    
	return {
       serviceData: identity,
		options: {profile: { name: identity.personaname  ,  steamid: identity.id }}
	};




});

var getSteamId = function (query) {
	var config = ServiceConfiguration.configurations.findOne({service: 'steam'});
	if (!config)
		throw new ServiceConfiguration.ConfigError("Service not configured");

	var response;
	try {
		response = HTTP.post("https://steamcommunity.com/openid/login", { params: _.extend(query, { 'openid.mode': 'check_authentication' }) });
	} catch (err) {
		throw _.extend(new Error("Failed to complete OAuth handshake with Steam. " + err.message), { response: err.response });
	}

	if (response.content && response.content.indexOf("is_valid:true") !== -1) {
		return _.last(query['openid.claimed_id'].split('/'));
	} else {
		throw new Error("Failed to complete OAuth handshake with Steam. " + response.data.error);
	}
};

function getIdentity(steamId) {
	var config = ServiceConfiguration.configurations.findOne({service: 'steam'});
	if (!config)
		throw new ServiceConfiguration.ConfigError("Service not configured");

	var response;
	try {
		response = HTTP.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/", {
			params: {
				key: config.apiKey,
				steamids: steamId
			}
		});

		return _.first(response.data.response.players);
	} catch (err) {
		throw _.extend(new Error("Failed to fetch identity from Steam. " + err.message), { response: err.response });
	}
};


