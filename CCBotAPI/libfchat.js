'use strict';
var WebSocket = require('ws');
var request = require("request");
var requireNew = require('require-new');
var jsonfile = require('jsonfile');
var fs = require('fs');
const throttle = require('throttle-function');
var parent;
var pingInterval;
var configDir = process.cwd()+"/config";
var fileRoomsJs = "/config.rooms.js";
var conecting = false;

class FChatLib {


	//{ listeners
	addJoinListener(fn){
		parent.removeJoinListener(fn);
		parent.joinListeners.push(fn);
	}

	removeJoinListener(fn){
		let id = parent.joinListeners.indexOf(fn)
		if (id != -1) {
			parent.joinListeners.splice(i,1);
		}
	}

	addModListener(fn){
		parent.removeModListener(fn);
		parent.channelModListeners.push(fn);
	}

	removeModListener(fn){
		let id = parent.channelModListeners.indexOf(fn)
		if (id != -1) {
			parent.channelModListeners.splice(i,1);
		}
	}

	addConnectionListener(fn){
        parent.removeConnectionListener(fn);
        parent.connectionListeners.push(fn);
    }

    removeConnectionListener(fn){
        let id = parent.connectionListeners.indexOf(fn);
        if(id != -1){
            parent.connectionListeners.splice(id,1);
        }
    }

    addInitialChannelDataListener(fn){
        parent.removeInitialChannelDataListener(fn);
        parent.initialChannelDataListeners.push(fn);
    }

    removeInitialChannelDataListener(fn){
        let id = parent.initialChannelDataListeners.indexOf(fn);
        if(id != -1){
            parent.initialChannelDataListeners.splice(id,1);
        }
    }

    addMessageListener(fn){
        parent.removeMessageListener(fn);
        parent.messageListeners.push(fn);
    }

    removeMessageListener(fn){
        let id = parent.messageListeners.indexOf(fn);
        if(id != -1){
            parent.messageListeners.splice(id,1);
        }
    }

    addPrivateMessageListener(fn){
        parent.removePrivateMessageListener(fn);
        parent.privateMessageListeners.push(fn);
    }

    removePrivateMessageListener(fn){
        let id = parent.privateMessageListeners.indexOf(fn);
        if(id != -1){
            parent.privateMessageListeners.splice(id,1);
        }
    }
	//}

    constructor(options){
		parent = this;
        this.config = {};
        this.config.username = "";
        this.config.password = "";
        this.config.character = "";
        this.config.master = "";
        this.config.cname = "";
        this.config.cversion = "";

        if(typeof options !== 'object'){
            console.log('Wrong parameters passed, you need username, password, character, master, cname and cversion.');
            process.exit();
        }
        else{
            this.config = options;
            if(this.config.username == undefined || this.config.username == "" || this.config.password == undefined || this.config.password == "" || this.config.character == undefined || this.config.character == "" || this.config.master == undefined || this.config.master == ""){
                console.log('Wrong parameters passed, you need username, password, character, master, cname and cversion.');
                process.exit();
            }
        }

        this.connectionListeners = [];
		this.initialChannelDataListeners = [];
        this.messageListeners = [];
        this.pingListeners = [];
        this.privateMessageListeners = [];
        this.commandHandlers = [];
		this.channelModListeners = [];
		this.joinListeners = [];

        this.channels = {};
		
		try {
			if (fs.statSync(configDir+fileRoomsJs)) {
				this.channels = jsonfile.readFileSync(configDir+fileRoomsJs);
			}
		}
		catch(err){
			console.log("Error: "+err);
		}
		

		Object.keys(this.channels).forEach(function(room) { if (parent.channels[room].active == "false") { delete parent.channels[room]; }});


        if(this.config.room !== undefined && Object.keys(this.channels).indexOf(this.config.room) == -1){
            this.channels[this.config.room] = {plugins: []};
            this.updateRoomsConfig(this.channels);
        }


        this.ws = "";
        this.setFloodLimit(2);


        this.generateCommandHandlers();
        this.addMessageListener(this.commandListener); //basic commands + plugins loader, one instance for one bot


        this.addConnectionListener(this.joinChannelOnConnect);
		this.addInitialChannelDataListener(this.initialChannelData);

		this.onlineUsers = {};
		this.roomMods = {};
		this.addModListener(this.modListener);
        this.connect();
		this.roomStatus = {};
    }

	modListener(parent, data){
		parent.roomMods[data.channel] = data.oplist;
	}

	mainJoinListener(parent, argument) {
		if (argument.character.identity != parent.config.character) { return 0; }
		if(Object.keys(parent.channels).indexOf(argument.channel) == -1){
            parent.channels[argument.channel] = {plugins: []};
			parent.channels[argument.channel].fresh = "true";
		}
		parent.channels[argument.channel].active = "true";
		parent.channels[argument.channel].title = argument.title;
		if (argument.title.substring(0, 8) == "Private ") {
			parent.channels[argument.channel].private = "true";

		} else {
			parent.channels[argument.channel].private = "false";
		}
		parent.updateRoomsConfig(parent.channels);
	}

	initialChannelData(parent, argument) {
		//Aqui recibo la información de todos los canales, como se llaman y que usuarios hay...
		if (parent.channels[argument.channel].private == "false") { return 0; }
		parent.channels[argument.channel].users = argument.users;
	}


	

	joinNewChannel(channel, newPlugin){
        if(Object.keys(parent.channels).indexOf(channel) == -1){
            parent.channels[channel] = {plugins: []};
        }
        parent.sendData('JCH', { channel: channel });
        let commandHandler = requireNew('./commands.js');
        parent.commandHandlers[channel] = commandHandler;
        //save file for rooms
        parent.updateRoomsConfig(parent.channels);
    }

    generateCommandHandlers() {
        //create one commandHandler per room
        Object.keys(parent.channels).forEach(function (room) {
			if (parent.channels[room].active == "false") { return 0; }
            let commandHandler = requireNew('./commands.js');
            commandHandler(parent, undefined, room, parent.config.rooms);
            parent.commandHandlers[room] = commandHandler;
        });
    }

    setFloodLimit(delay){
        this.floodLimit = delay;
        this.sendData = throttle(this.sendWS, {
            window: this.floodLimit,
            limit: 1
        });
    }

    joinChannelOnConnect() {
        Object.keys(parent.channels).forEach(function(room){
			parent.sendData('JCH', { channel: room });
        });
    }

    commandListener(parent, args, chanName) {
        if(typeof parent.commandHandlers[args.channel] !== "undefined")
        {
            try {
                parent.commandHandlers[args.channel](parent, args, chanName);
            }
            catch(ex){
                console.log(ex);
                parent.throwError(args, ex.toString());
            }
        }
    }

    throwError(args, error, chan) {
        console.log("Error: Please message "+parent.config.master+" with the following content:\n Error at "+new Date().toLocaleString()+" on command "+JSON.stringify(args)+" in channel "+args.channel+" with error: "+JSON.stringify(error));
    }

	connect() {
		if (conecting == true) { console.log("Already connecting... 1"); return 0; }
        request.post({ url: 'https://www.f-list.net/json/getApiTicket.php', form: { account: parent.config.username, password: parent.config.password } }, function (err, httpResponse, body) {
			if (body == undefined || body[0] != "{") {
				console.log("No response from getApiTicket");
				setTimeout(parent.connect, 15000);
				return 0;
			}
			console.log("Ticket adquired from getApiTicket, attempting to start WS");
			let response = JSON.parse(body);
            let ticket = response.ticket;
            var json = { "method": "ticket", "account": parent.config.username, "ticket": ticket, "character": parent.config.character, "cname": parent.config.cname, "cversion": parent.config.cversion };
			parent.startWebsockets(json);
        });
    }

    sendWS(command, object) {
        if (parent.ws.readyState === WebSocket.OPEN) {
			//if (parent.config.debug == "true") { console.log(">> " + command + ' ' + JSON.stringify(object)); }
			//console.log(">> " + command + ' ' + JSON.stringify(object));
			if (JSON.stringify(object).length > 50000) { console.log("A LOT OF CHARACTERS! WARNING!"); return 0; }
			parent.ws.send(command + ' ' + JSON.stringify(object));

		}
	}

	sendCommand(command, object) {
		parent.sendData(command, object);
	}

    sendMessage(message, channel){
        let json = {}; if (typeof message !== 'string') { message = JSON.stringify(message); }
        json.channel = channel;
        json.message = message;
        parent.sendData('MSG', json);		
    }

	sendMessage2(message, channel){
        let json = {};
        json.channel = channel;
        json.message = message;
        parent.sendData('MSG', json);
		//log.msg("Bot: " + message);
    }

	sendDescription(description, channel) {
		let json = {};
		json.channel = channel;
		json.description = description;
		parent.sendData("CDS", json);
		//log.msg("Room description:\n"+description);
	}

    sendPrivMessage(character, message){
        let json = {}; if (typeof message !== 'string') { message = JSON.stringify(message); }
        json.message = message;
        json.recipient = character;
        parent.sendData('PRI', json);
		//log.pri("Bot to " + character + ":" + message);
		//if (bot.connected) { bot.sendMessage({ to: discordPrivateRoom, message: "Bot to " + character + ":" + fixBbcode(message) }); }
    }

    restart(){
        this.ws.close();
        process.exit();
    }

    softRestart(){
		//parent.messageListeners = [];
		parent.privateMessageListeners = [];
		parent.commandHandlers = [];
		parent.generateCommandHandlers()
		parent.addMessageListener(parent.commandListener);
    }

    updateRoomsConfig(channels){
        if (!fs.existsSync(configDir)){
            fs.mkdirSync(configDir);
        }
		jsonfile.writeFileSync(configDir+fileRoomsJs, channels, function(err) { console.log(err); });
    }

	debuggy(stuff) {
		return eval(stuff);
	}



    startWebsockets(json) {
		if (conecting == true) {
			console.log("Already connecting...");
			return 0;
		}
		conecting = true;
        if (this.config.debug == "true") {
            this.ws = new WebSocket('wss://chat.f-list.net/chat2'); //************************* debug
        }
        else {
            this.ws = new WebSocket('wss://chat.f-list.net/chat2');
		}

		pingInterval = setTimeout(function () { console.log("The server has taken more than 40 seconds to send any messages, attempting to reconnect"); parent.ws.close(); }, 40000);
		
        this.ws.on('open', function(test) {
			console.log("WS open");
            parent.sendWS('IDN', json);
        });

        this.ws.on('close', function(test, test2) {
            console.log("WS close");
			clearTimeout(pingInterval);
			setTimeout(()=>{parent.connect()}, 11000);
			conecting = false;
			console.log(test);
			console.log(test2);
        });

        this.ws.on('error', function(test, test2) {
            console.log("WS error");
			clearTimeout(pingInterval);
            setTimeout(()=>{parent.connect()}, 10000);
			conecting = false;
			console.log(test);
			console.log(test2);
        });

        this.ws.on('message', function incoming(data) {
			data = data.toString()
            clearTimeout(pingInterval);
			pingInterval = setTimeout(function () { console.log("The server has taken more than 40 seconds to send any messages, attempting to reconnect"); parent.ws.close(); }, 40000);
			
            if (data != null) {
                this.command = this.argument = "";
                this.command = splitOnce(data, " ")[0].trim();
                try{
                    this.argument = JSON.parse(data.substring(this.command.length).trim());
					if (this.argument.channel) { this.argument.channel = this.argument.channel.toLowerCase(); }
                }
                catch (e) {
                }
				//let dontShow = ["LIS","FRL","VAR","STA","NLN","FLN","PIN","ADL","IGN","COL","CDS"];
				//if (parent.config.rooms == "debug") { if (dontShow.indexOf(this.command) == -1) { console.log("<< "+data); } }
                switch (this.command) {
					case "COL":
						for (var i in parent.channelModListeners) {
							parent.channelModListeners[i](parent, this.argument);
						}
						break;
					case "LIS":
						let temp = this.argument.characters;
						for (let i = 0; i < temp.length; i++) {
							let chara = temp[i];
							//console.log(chara[0]);
							parent.onlineUsers[chara[0]] = {gender: chara[1], status: chara[2], statusMessage: chara[3]};
						}
						break;
					case "STA": //STA { status: "status", character: "channel", statusmsg:"statusmsg" }
                        //for (var i in parent.statusListeners) {
                        //    parent.statusListeners[i](parent, this.argument);
                        //}
						try {
							parent.onlineUsers[this.argument.character].status = this.argument.status;
							parent.onlineUsers[this.argument.character].statusMessage = this.argument.statusmsg;
						} catch (e) {}
                        break;
					case "NLN":
                        //for (var i in parent.onlineListeners) {
                        //    parent.onlineListeners[i](parent, this.argument);
                        //}
                        parent.onlineUsers[this.argument.identity] = {gender: this.argument.gender, status: this.argument.status, statusMessage: ""};
						break;
                    case "CON":
                        for (var i in parent.connectionListeners) {
                            parent.connectionListeners[i](parent, this.argument);
                        }
                        break;
					case "ICH":
                        for (var i in parent.initialChannelDataListeners) {
                            parent.initialChannelDataListeners[i](parent, this.argument);
                        }
                        break;
                    case "JCH":
                        for (var i in parent.joinListeners) {
                            parent.joinListeners[i](parent, this.argument);
                        }
						//parent.joinListener(this.argument);
                        break;
					case "LCH":
                        for (var i in parent.leaveListeners) {
                            parent.leaveListeners[i](parent, this.argument);
                        }
						parent.leaveListener(this.argument);
                        break;
					case "FLN":
                        for (var i in parent.leaveListeners) {
                            parent.leaveListeners[i](parent, this.argument);
                        }
                        break;
                    case "PIN":
                        //parent.ws.send("PIN");
						//console.log(">> PIN");
						if (parent.ws.readyState === WebSocket.OPEN) {
							parent.ws.send("PIN");
						}
						break;
                    case "PRI": //PRI { "character": string, "message": string }
                        for (var i in parent.privateMessageListeners) {
							this.argument.publico = false;
                            parent.privateMessageListeners[i](parent, this.argument);
                        }
						//log.pri(this.argument.character + ": " + this.argument.message);
						//if (bot.connected) { bot.sendMessage({ to: discordPrivateRoom, message: this.argument.character + ": " + this.argument.message }); }
                        break;
                    case "MSG": //MSG { "character": string, "message": string, "channel": string }
                        for (var i in parent.messageListeners) {
							this.argument.publico = true;
                            parent.messageListeners[i](parent, this.argument, this.argument.channel);
                        }
						//console.log("from the MSG section: "+JSON.stringify(this.argument)+" "+this.argument.channel);
						//log.msg(this.argument.character + ": " + this.argument.message);
						//if (bot.connected) { bot.sendMessage({ to: getDiscordRoom(this.argument.channel), message: this.argument.character + ": " + this.argument.message }); }
                        break;
					case "ERR":
						console.log("Number: "+this.argument.number+", Message: "+this.argument.message);
						break;
                }
            }
        });
    }
}

function splitOnce(str, delim) {
    var components = str.split(delim);
    var result = [components.shift()];
    if (components.length) {
        result.push(components.join(delim));
    }
    return result;
}

module.exports = FChatLib;
