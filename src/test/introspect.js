const posts = require("./example-posts")

const res = posts.filter(({ read }) => read)

console.log(res)  