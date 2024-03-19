const getUnexpectedBehaviorExample = post => {
  if (!post.published || post.liked) {
    return post
  }
}

const logUnexpectedBehavior = post => {
  const unexpectedBehavior = getUnexpectedBehaviorExample(post)
  if (unexpectedBehavior) {
    console.warn(unexpectedBehavior)
  }
}

const processPost = post => {
  logUnexpectedBehavior(post)

  const {
    _id,
    replyTo,
    bookmarks,
    raw: postContent,
    creator: { _id: creatorId, admin, moderator, roles, about, star, leader, name },
    post: { _id: topicId },
    lastModified,
    createdAt,
    views: numberOfViews,
    noLikes: numberOfLikes,
    liked,
    read,
  } = post

  return {
    _id,
    postContent,
    replyTo,
    topicId,
    creator: {
      id: creatorId,
      admin,
      moderator,
      star,
      leader,
      roles,
      name,
      about,
    },
    bookmarks,
    lastModified,
    createdAt,
    numberOfViews,
    numberOfLikes,
    liked,
    read,
  }
}

const processPosts = posts => {
  return posts.reduce((acc, { spam, hidden, deleted, flagged, ...post }) => {
    if (
      spam ||
      hidden ||
      deleted ||
      flagged ||
      post.suspended_till ||
      !post.creator ||
      !post.post
    ) {
      return acc
    }

    return [...acc, processPost(post)]
  }, [])
}

module.exports = { processPosts }
