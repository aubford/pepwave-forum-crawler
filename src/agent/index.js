import "../../config.js"
import OpenAi from "openai"

const openai = new OpenAi(process.env.OPENAI_API_KEY)
openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are a helpful assistant."
    },
    {
      role: "user",
      content: "What is the meaning of life?"
    }
  ]
})

