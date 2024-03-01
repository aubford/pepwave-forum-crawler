const fetchPostsForTopic = () =>
  fetch(
    "https://forum.peplink.com/api/v1/post/65d9eb7fd362e71c2a51368d/reply?limit=1000&sort_by=createdAt&order_by=asc&replyNo=1"
  )