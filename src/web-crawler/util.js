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

