const fs = require("fs")

const main = async function () {
  const res = await fetch("https://forum.peplink.com/api/v1/category?limit=1000")
  const { data } = await res.json()
  return data.map(({ name, _id, slug }) => ({ name, id: _id, slug }))
}

main().then(res => fs.writeFileSync("data/categories.json", JSON.stringify(res, null, 2)))
