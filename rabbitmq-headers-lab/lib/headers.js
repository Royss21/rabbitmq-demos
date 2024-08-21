const queryString = require('query-string')

const envHeadersParseFactory = (options) => (_queryString) => _queryString != null
    ? {...queryString.parse(_queryString, options)}
    : null

const envHeadersParse = envHeadersParseFactory({
    decode: false,
    sort: false,
    parseNumbers: true,
    parseBooleans: true
})

module.exports = {
    envHeadersParse
}
