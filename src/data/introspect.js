const topics = require("./topics")
const { keyBy, size} = require("lodash/collection")
const fs = require("fs")

const numTopics = size(topics)

numTopics /* ?+ */

// const res = keyBy(
//   topics.map(({ views, ...topic }) => ({ ...topic, numberOfViews: views })),
//   "id"
// )
//
// fs.writeFile("./topics.json", JSON.stringify(res), err => {
//   if (err) {
//     console.log(err)
//   }
//   console.log("success!")
// })
