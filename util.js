/**
 * @returns {Promise<string>}
 */
const fetchText = async (...fetchArgs) => {
  const response = await fetch(/**@type * */ ...fetchArgs)
  return await response.text()
}

/**
 * @returns {Promise<string>}
 */
const fetchJson = async (...fetchArgs) => {
  const response = await fetch(/**@type * */ ...fetchArgs)
  return await response.json()
}

Promise.stagger = async (asyncFunc, paramArr, ms) => {
  const staggered = paramArr.map(async (params, idx) => {
    await new Promise(resolve => setTimeout(resolve, idx * ms))
    const normalized = [].concat(params)
    return asyncFunc(...normalized)
  })
  return await Promise.all(staggered)
}

const pause = async ms => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  fetchText,
  fetchJson,
  pause,
}
