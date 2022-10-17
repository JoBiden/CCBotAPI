var fChatLibInstance;
var channel;

/*const Investment = Object.freeze({
	Casual: 0,
	Involved: 1,
	Investment: 2,
	Consequence: 3
})

const InteractionTypes = Object.freeze({
	Cum: 0,
	Cuddle: 1,
	Kiss: 2,
	Handhold: 3,
	Mark: 4,
	Consume: 5,
	Monstrify: 6,
	Petrify: 7,
	Plant: 8,
	Objectify: 9,
	Entitle: 10,
	Milk: 11,
	Breed: 12,
	Dressup: 13,
	Employ: 14,
	Infest: 15,
	Rewrite: 16,
	Pay: 17,
	Bond: 18,
	Train: 19,
	Corrupt: 20,
	Odorize: 21,
	Feed: 22,
	Golden: 23,
	Curse: 24,
	Break: 25,
	Pledge: 26,
	Dose: 27,
})*/

RegisterProfile = function (character) {

}


module.exports = function (parent, chanName) {
    fChatLibInstance = parent;

    var cmdHandler = {};
    channel = chanName;

    
	cmdHandler.register = function (args, data) {
		console.log("!register called by " + data.character)
		if (RegisterProfile(data.character)){
			fChatLibInstance.sendMessage(data.character + " has now been registered! You can whisper the bot with most commands, such as !volunteer and !help", channel);
		} 
		else { //Register Profile returned false because character is already registered
			fChatLibInstance.sendMessage(data.character + " is already registered. Are you showing someone the ropes or just being silly?", channel);
		}
		console.log("register call complete.")
	}	


	
	/* cmdHandler.guide = function (args, data) {
        console.log(data);
        var message = "Here's a few things to start: \n";
        message += "The command received the following args: "+JSON.stringify(args)+"\n";
        message += "The command received the following data: "+JSON.stringify(data)+"\n";
        message += "The character who sent the message is:"+data.character+"\n";
        message += "The message was received in the channel:"+data.channel+ " and it's also passed everytime here: "+channel+"\n";
        message += "You can call functions outside of the scope: "+getRandomInt(0,10)+"\n";
        fChatLibInstance.sendMessage(message, channel);
    }; */
	
    /* fChatLibInstance.addJoinListener(function(parent, data){
        fChatLibInstance.sendMessage("Yay, someone joined the channel! Welcome "+data.character.identity, channel);
    }); */
	
	//fChatLibInstance.addMessageListener(function(parent, data){
    //    fChatLibInstance.sendMessage("Message: "+JSON.stringify(data), channel);
    //});
	
	/* fChatLibInstance.addPrivateMessageListener(function(parent, data) {
		fChatLibInstance.sendPrivMessage(data.character, "You said: "+message);
	}); */

    return cmdHandler;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}