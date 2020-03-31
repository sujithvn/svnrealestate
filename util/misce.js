
const processMessage = inMessage => {
    const outMessage = {};
    const outMessages = [];
    let alertType = "";
    if (inMessage.length > 0) {
      alertType = inMessage[0];
      outMessage.msg = inMessage[1];
      outMessages.push(outMessage);
    }
    return [outMessages, alertType];
  };

  module.exports = { processMessage };