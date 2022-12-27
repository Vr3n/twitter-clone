import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import { tweetSchema } from "../schemas/tweetSchema";

const CreateTweet = () => {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync } = trpc.tweet.create.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("clicked submit!");

    try {
      await tweetSchema.parse({ text });
    } catch (e) {
      setError(e.message);
      return;
    }

    mutateAsync({ text });
  };

  return (
    <>
      {/* {error && <p className="text-sm text-red-500">{}</p>} */}
      <form
        className="flex w-full flex-col rounded-md border-2 p-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <textarea
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 shadow-md"
          placeholder="Tweet about your day!"
        ></textarea>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" type="submit">
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweet;
