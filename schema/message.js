exports.chatSchema = function (body) {
    return {
        users: body.message.users,
        messages: [{
            origin: body.user._id,
            text: body.message.text,
            time: new Date(Date.now()).toLocaleString()    
        }],
        lastMessage: body.message.text
    };
};

exports.textMessageSchema = function (body) {
  
    return {
        origin: body.user._id,
        text: body.message.text,
        time: new Date(Date.now()).toLocaleString()
    };
    
};