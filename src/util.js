export class ReError extends Error {
  /**
   * @param {string} message
   * @param {Error | Object} cause
   * @param {string} funcName
   */
  constructor(message, cause, funcName) {
    super(message, { cause })
    this.name = `( ${funcName} )`
    this.code = cause.code
  }

  setCode(code) {
    this.code = code
    return this
  }
}

/**
 * @returns {Promise<string>}
 */
export const fetchText = async (...fetchArgs) => {
  const response = await fetch(/**@type * */ ...fetchArgs)
  return await response.text()
}

/**
 * @returns {Promise<string>}
 */
export const fetchJson = async (...fetchArgs) => {
  const response = await fetch(/**@type * */ ...fetchArgs)
  return await response.json().catch(err => {
    console.error("Bad JSON Response: ", JSON.stringify(response))
    console.error("URL: ", JSON.stringify(fetchArgs))
    throw new ReError("Bad JSON", err, "fetchJson")
  })
}

export const pause = async ms => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

