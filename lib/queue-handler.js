const {BaseQueueHandler} = require('rabbit-queue');
const {runMethod} = require('@feathersjs/transport-commons/lib/socket/utils');
const {parseEventName} = require('./event-helper');

/**
 * Feathers service RabbitMQ queue handler
 */
class ServiceQueueHandler extends BaseQueueHandler {
  /**
   * ServiceQueueHandler constructor
   *
   * @param  {string} queueName RabbitMQ queue name
   * @param  {object} rabbit    RabbitMQ connection
   * @param  {object} options   Queue options
   * @param  {object} {app      Feathers instance
   * @param  {object} logger}   Logger instance
   */
  constructor(queueName, rabbit, options, {app, logger}) {
    super(queueName, rabbit, options);
    this.app = app;
    this.logger = logger;
  }

  /**
   * Handle RabbitMQ message
   *
   * @param  {object} obj  RabbitMQ message info
   * @return {Promise}     Promise ressult
   */
  handle(obj) {
    const {app} = this;
    const {path, method} = parseEventName(obj.msg.properties.headers.eventType);

    return new Promise(resolve => {
      runMethod(app, {provider: 'rabbot'}, path, method, [
        obj.event,
        function (err, result) {
          return err ? resolve(err) : resolve(result);
        }
      ]);
    });
  }

  /**
   * After unsuccessful process message
   *
   * @param  {object} { msg   RabbitMQ message info
   * @param  {object} event } RabbitMQ event info
   */
  afterDlq({msg, event}) {
    this.logger.error('DLQ: ', msg, event);
  }
}

module.exports = {ServiceQueueHandler};