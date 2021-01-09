const currentInvoke = {}

function getCurrentInvoke () {
  return currentInvoke
}

function setCurrentInvoke ({ event, context }) {
  currentInvoke.event = event
  currentInvoke.context = context
}

module.exports = {
  getCurrentInvoke,
  setCurrentInvoke
}
