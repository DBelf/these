/**
 * Created by dimitri on 21/06/2017.
 */
const MessageInterface = (function messageInterface() {
  const incomingMessageHandlers =
    ['addMessageListener', 'addListener', 'addEventListener', 'addWeakMessageListener'];
  const outgoingMessageHandlers =
    ['sendAsyncMessage', 'sendSyncMessage', 'postMessage', 'sendMessage', 'broadcastMessage'];

  class Message {
    constructor(file, body) {
      this.file = file;
      this.body = body;
    }
  }

  class OutgoingMessage extends Message {

  }

  class IncomingMessage extends Message {

  }


}());
