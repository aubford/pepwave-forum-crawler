const topics = require("./topics")

const a = topics.filter(({ creator }) => creator.roles.length).map(({ creator }) => creator)

a
