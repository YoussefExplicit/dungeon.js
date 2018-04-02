const GuildChannel = require('./GuildChannel');
const Message = require('./Message');
const request = require('../Connection');

/**
 * This class represents a Text Channel
 * @extends {GuildChannel} 
 */

class TextChannel extends GuildChannel {
  constructor(raw, client) {
    super(raw, client);

    /**
     * This is the ID of the last message in the channel
     * @type {String}
     */

    this.lastMessageID = raw.last_message_id;

    /**
     * Whether the channel is nsfw or not
     * @type {Boolean}
     */

    this.nsfw = raw.nsfw;

    /**
     * The topic of the channel
     * @type {String}
     */
    
    this.topic = raw.topic;

  }

  /**
   * @description This method will send a mssage to the channel specified
   * @param {String|Object} content The string if it's a normal message or object if it's a richembed
   * @param {Object} [opt = {}] The options, nonce and tts
   * @returns {Promise<Message>} Returns a promise and discord message
   * @example
   * msg.channel.send({title: "Ping!", body: "This User Was Pinged!", color: 0x00AE86});
   * msg.channel.send("Hi!", {tts: true});
   */

  send(content, opt = {}) {
    if (!content) throw new this.client.MissingParameter('You are missing the parameter \'content\'!');
    if (typeof content === 'object') throw new this.client.WrongType('Embeds currently not supported.'); // While embeds are being fixed, turned off for the time being.

    let embed;
    if (typeof content === 'object') {
      embed = {
        title: (content && content.title) || null,
        description: (content && content.body) || null,
        url: (content && content.url) || null,
        timestamp: (content && content.timestamp) || null,
        color: (content && content.color) || null,
        //footer: {} 
      };
    }
    return new Promise((res) => {
      if (embed) {
        request.req('POST', `/channels/${this.id}/messages`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          embed: embed || null
        }, this.client.token)
          .then(m => {
            setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });  
      } else {
        request.req('POST', `/channels/${this.id}/messages`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          content: content || null
        }, this.client.token)
          .then(m => {
            setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          }); 
      }     
    });
  }

  /**
   * @description This method will get the most recent message sent
   * @returns {Promise<Message>} Returns a promise and a discord message
   */

  lastMessage() {
    return new Promise((res) => {
      request.req('GET',`/channels/${this.id}/messages/${this.lastMessageID}`, {}, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
        })
        .catch(console.log);
    });
  }

  /**
   * @description Will fetch a message if not cached
   * @param {String} id The ID of the message
   * @returns {Promise<Message>} Returns a promise and a discord message
   */

  getMessage(id) {
    if (!id) throw new this.client.MissingParameter('You are missing the parameter \'snowflake\'!');
    return new Promise((res) => {
      request.req('GET', `/channels/${this.id}/messages/${id}`, {}, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
        });
    });
  }

  /**
   * @description Will fetch a group of messages if not cached
   * @param {Array} id An array of message snowflakes
   * @returns {Promise<Message>} Returns a promise and (a) discord message(s)
   */

  getMessages(opt = {}) {
    if (!opt) throw new this.client.MissingParameter('You are missing the parameter \'options\'!');
    return new Promise((res) => {
      request.req('GET', `/channels/${this.id}/messages`, {
        around: opt.around || null,
        before: opt.before || null,
        after: opt.after || null,
        limit: opt.limit || null
      }, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
        });
    });
  }


  /**
   * @description Sets the nsfw of the channel
   * @param {Boolean} boolean Whether the channel should be nsfw or not
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setNSFW(boolean) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        nsfw: boolean
      }, this.client.token).then(m => {
        const TextChannel = require('./TextChannel');
        setTimeout(res, 100, res(new TextChannel(this.client.channel_methods().fromRaw(m), this.client)));
      });
    });
  }


  /**
   * @description Sets the topic of the channel
   * @param {String} newtopic The topic of the channel
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setTopic(newtopic) {
    if (this.type === 'voice') throw new this.client.WrongType('This method only available on text based channels');

    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        topic: newtopic
      }, this.client.token).then(m => {
        setTimeout(res, 100, res(new TextChannel(this.client.channel_methods().fromRaw(m), this.client)));
      });
    });
  }

}

module.exports = TextChannel;