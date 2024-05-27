export class ReError extends Error {
  /**
   * @param {string} message
   * @param {Error | Object} cause
   * @param {string} name
   */
  constructor(message, cause, name) {
    super(message, { cause })
    this.name = `( ${name} )`
    this.code = cause.code
  }

  setCode(code) {
    this.code = code
    return this
  }
}

export const pause = async ms => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}
