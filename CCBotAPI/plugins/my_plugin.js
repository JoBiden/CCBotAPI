var fChatLibInstance;
var channel;

module.exports = function (parent, chanName) {
    fChatLibInstance = parent;

    var cmdHandler = {};
    channel = chanName;

    
	cmdHandler.guide = function (args, data) {
        console.log(data);
        var message = "Here's a few things to start: \n";
        message += "The command received the following args: "+JSON.stringify(args)+"\n";
        message += "The command received the following data: "+JSON.stringify(data)+"\n";
        message += "The character who sent the message is:"+data.character+"\n";
        message += "The message was received in the channel:"+data.channel+ " and it's also passed everytime here: "+channel+"\n";
        message += "You can call functions outside of the scope: "+getRandomInt(0,10)+"\n";
        fChatLibInstance.sendMessage(message, channel);
    };
	
    fChatLibInstance.addJoinListener(function(parent, data){
        fChatLibInstance.sendMessage("Yay, someone joined the channel! Welcome "+data.character.identity, channel);
    });
	
	fChatLibInstance.addMessageListener(function(parent, data){
        fChatLibInstance.sendMessage("Message: "+JSON.stringify(data), channel);
    });
	
	fChatLibInstance.addPrivateMessageListener(function(parent, data) {
		fChatLibInstance.sendPrivMessage(data.character, "You said: "+message);
	});

    return cmdHandler;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}