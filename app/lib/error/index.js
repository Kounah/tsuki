const RequestError = require('./RequestError');
const MissingParameterError = require('./MissingParameterError');
const NotFoundError = require('./NotFoundError');
const ForbiddenActionError = require('./ForbiddenActionError');
const EndpointRemovedError = require('./EndpointRemovedError');
const MongooseExecError = require('./MongooseExecError');
const MongooseNotFoundError = require('./MongooseNotFoundError');
const UnauthorizedError = require('./UnauthorizedError');

Error.stackTraceLimit = Infinity;

/**
 * handles various error types in a manner that every possible type gives a RequestError
 * @param {Error|RequestError} err the error object
 * @returns {RequestError}
 */
function handle(err) {
  if(typeof err === 'object') {
    if(err instanceof RequestError) {
      return err;
    } else if(err instanceof Error) {
      return new RequestError(err);
    } else return new RequestError({
      message: `An ${err.constructor.name || 'object'} has been thrown as Error though it was not an instance of Error`,
      status: 500,
      data: err,
      name: 'ThrownObjectError',
      inner: new Error('Caught by handler.')
    });
  } else if(typeof err === 'undefined') {
    return new RequestError({
      message: 'An undefined error has been thrown.',
      status: 500,
      data: err,
      name: 'ThrownUndefinedError',
      inner: new Error('Caught by handler.')
    });
  } else return new RequestError({
    message: `A ${typeof err} value has been thrown as Error`,
    status: 500,
    data: err,
    name: 'ThrownValueError',
    inner: new Error('Caught by handler.')
  });
}

/**
 * creates a handler that sends a Request Error to the response
 * @param {Error} err
 * @param {Express.Request} req express request
 * @param {Express.Response} res express response
 * @param {(err: Error) => void} next
 */
function handleError(err, req, res, next) {
  let handled = handle(err);

  console.error(handled.message, handled);

  res
    .status(handled.status)
    .set('Error-Type', handled.constructor.name)
    .json(handled);
}

async function handleAsyncResult(v, depth) {
  if(typeof depth !== 'number') depth = 0;
  console.log(`${depth} -> ${typeof v}:`, v);
  if(typeof v === 'object') {
    if(v.constructor.name === 'AsyncFunction') {
      return handleAsyncResult(await v(), depth + 1);
    } else if(v instanceof Promise) {
      return handleAsyncResult(await v, depth + 1);
    } else return v;
  } else if(typeof v == 'function') {
    return handleAsyncResult(v(), depth + 1);
  } else {
    console.log(`${depth} -> returning:`, v);
    return v;
  }
}

module.exports = {
  RequestError,
  MissingParameterError,
  NotFoundError,
  ForbiddenActionError,
  EndpointRemovedError,
  MongooseExecError,
  MongooseNotFoundError,
  UnauthorizedError,

  handle,
  handler: handleError,
  handleAsyncResult
};