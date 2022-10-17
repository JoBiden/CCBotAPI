var glob = require("glob");
var requireNew = require('require-new');
var jsonfile = require('jsonfile');
var firstStart = true;
var pluginsLoaded = [];
var commandHandler = {};
var fChatLibInstance = {};
var channelName = "";
var fileName;

commandHandler.help = function (args, data) {
    var commandsHelp = "";
    var cmdArrSorted = [];
    for(var i in commandHandler){
        if(typeof commandHandler[i] == "function"){
            // commandsHelp += ", !"+i;
            cmdArrSorted.push(i);
        }
    }
    cmdArrSorted.sort();
    for(var i in cmdArrSorted){
        commandsHelp += ", !"+cmdArrSorted[i];
    }
    commandsHelp = commandsHelp.substr(1);
    fChatLibInstance.sendPrivMessage(data.character, 'Here are the available commands:'+commandsHelp);
};



commandHandler.restart = function (args, data) {
    if (data.channel != channelName) { return 0; }
    if(data.character == fChatLibInstance.config.master || data.character == "Kenia Nya"){
        fChatLibInstance.restart();
    }
};

commandHandler.loadplugin = function (args, data) {
	if(data.character == fChatLibInstance.config.master || data.character == "Kenia Nya"){
        if(args == undefined || args == ""){
            fChatLibInstance.sendMessage("Wrong parameter. Example: !loadplugin pluginname\n"+listAvailablePlugins(), data.channel);
        }
        else{
			var files =  glob.sync(process.cwd()+"/plugins/"+args+".js");
			var strAddedCommands = "";

			for (var i = 0; i < files.length; i++) {

				var newHandler = requireNew(files[i])(fChatLibInstance, channelName);

				//lowercase alias
				for(var j = 0; j < Object.keys(newHandler).length; j++){
					strAddedCommands += "!"+Object.keys(newHandler)[j].toLowerCase() + ", ";
					if(Object.keys(newHandler)[j].toLowerCase() != Object.keys(newHandler)[j]){
						newHandler[Object.keys(newHandler)[j].toLowerCase()] = newHandler[Object.keys(newHandler)[j]];
					}
				}
				commandHandler = Object.assign(commandHandler,newHandler);

			};

			strAddedCommands = strAddedCommands.substr(0, strAddedCommands.length - 2);
			if(strAddedCommands == ""){
				fChatLibInstance.sendMessage("There weren't any loaded commands for this plugin. Are you sure it exists?", channelName);
			}
			else{
				fChatLibInstance.sendMessage("The following commands were loaded: "+strAddedCommands, channelName);
				if(pluginsLoaded.indexOf(args) == -1){
					pluginsLoaded.push(args);
					fChatLibInstance.channels[channelName].plugins = pluginsLoaded;
					fChatLibInstance.updateRoomsConfig(fChatLibInstance.channels);
				}
			}
        }
    }
};

commandHandler.loadplugin2 = function (args, data) {
    if (data.character == "this is a command sent by the bot itself"){
        var files =  glob.sync(process.cwd()+"/plugins/"+args+".js");
		for (var i = 0; i < files.length; i++) {

			var newHandler = requireNew(files[i])(fChatLibInstance, channelName);

			//lowercase alias
			for(var j = 0; j < Object.keys(newHandler).length; j++){
				if(Object.keys(newHandler)[j].toLowerCase() != Object.keys(newHandler)[j]){
					newHandler[Object.keys(newHandler)[j].toLowerCase()] = newHandler[Object.keys(newHandler)[j]];
				}
			}
			commandHandler = Object.assign(commandHandler,newHandler);
		};
		if(pluginsLoaded.indexOf(args) == -1){
			pluginsLoaded.push(args);
			fChatLibInstance.channels[channelName].plugins = pluginsLoaded;
			fChatLibInstance.updateRoomsConfig(fChatLibInstance.channels);
		}
	}
};



commandHandler.unloadplugin = function (args, data) {
    if(data.character == fChatLibInstance.config.master || data.character == "Kenia Nya"){
		var files = glob.sync(process.cwd()+"/plugins/"+args+".js");
		if (pluginsLoaded.indexOf(args) != -1) {
			pluginsLoaded.splice(pluginsLoaded.indexOf(args), 1);
			fChatLibInstance.channels[channelName].plugins = pluginsLoaded;
			fChatLibInstance.updateRoomsConfig(fChatLibInstance.channels);
		}
		fChatLibInstance.softRestart();
    }
};

/*
 * Load external plugins
 * ---------------------------------------------------------------------------
 */

function loadPluginOnStart(pluginsPathArray) {
    var strAddedCommands = "";

    for (var i = 0; i < pluginsPathArray.length; i++) {

        var newHandler = requireNew(pluginsPathArray[i])(fChatLibInstance, channelName);

        //lowercase alias
        for(var j = 0; j < Object.keys(newHandler).length; j++){
            strAddedCommands += "!"+Object.keys(newHandler)[j].toLowerCase() + ", ";
            if(Object.keys(newHandler)[j].toLowerCase() != Object.keys(newHandler)[j]){
                newHandler[Object.keys(newHandler)[j].toLowerCase()] = newHandler[Object.keys(newHandler)[j]];
            }
        }
        commandHandler = Object.assign(commandHandler,newHandler);

    };
}

module.exports = function (parent, data, chanName, rooms) {

    channelName = chanName;

    fChatLibInstance = parent;

    if(firstStart){
        firstStart = false;
        if (rooms == "debug") { fileName = process.cwd()+"/config/config.roomsDebug.js"; } else { fileName = process.cwd()+"/config/config.rooms.js"; }
        jsonfile.readFile(fileName, function(err, rooms){
            if(!err){
                if(rooms[chanName] != undefined && rooms[chanName].plugins != undefined){
                    pluginsLoaded = rooms[chanName].plugins;
                    if(pluginsLoaded.length > 0){
                        var pluginsPaths = [];
                        for(var i = 0; i < pluginsLoaded.length; i++){
                            pluginsPaths.push(process.cwd()+"/plugins/"+pluginsLoaded[i]+".js");
                        }
                        loadPluginOnStart(pluginsPaths);
                    }
                }
            }
        });

    }

    if (data && data.message && data.message.length > 2 && data.message[0] == '!') {

        var opts = {
            command: String(data.message.split(' ')[0]).replace('!', '').trim().toLowerCase(),
            argument: data.message.substring(String(data.message.split(' ')[0]).length).trim()
        };

        if (typeof commandHandler[opts.command] === 'function') {
            commandHandler[opts.command](opts.argument, data);
        } else {
            //not found
        }
    }
};
