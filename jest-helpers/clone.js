module.exports = function clone (json) {
  return JSON.parse(JSON.stringify(json))
}
