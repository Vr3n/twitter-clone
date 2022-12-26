import { object, string } from "zod";

export const tweetSchema = object({
  text: string({
    required_error: "Tweet text is missing!",
  })
    .min(10)
    .max(280),
});
