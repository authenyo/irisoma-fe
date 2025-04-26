// This somewhat mysterious module will load a json string
// and then extract only the 'notifications' part. This is
// meant to be used to load the partial i18n we need for
// the service worker.
module.exports = function (source) {
  const object = JSON.parse(source)
  const smol = {
    notifications: object.notifications || {}
  }

  return JSON.stringify(smol)
}
