import React, { useState, useEffect } from "react";
import CreateTweet from "./createTweet";
import type { RouterOutputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

const localeList = dayjs.Ls;

dayjs.updateLocale("en", {
  relativeTime: {
    ...localeList["en"]?.relativeTime,
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    d: "1d",
    dd: "%dh",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;

    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

const updateCache = ({
  client,
  variables,
  data,
  action,
}: {
  client: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "dislike";
}) => {
  client.setQueryData(
    [
      ["tweet", "list"],
      {
        input: {
          limit: 10,
        },
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<RouterOutputs["tweet"]["list"]>;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
              };
            }
            return tweet;
          }),
        };
      });

      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
};

const Tweet = ({
  tweet,
  client,
}: {
  tweet: RouterOutputs["tweet"]["list"]["tweets"][number];
  client: QueryClient;
}) => {
  const likeMutation = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "like" });
    },
  }).mutateAsync;
  const disLikeMutation = trpc.tweet.dislike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "dislike" });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;

  return (
    <div className="my-2 w-full rounded-md border p-2 shadow-md">
      <div className="flex items-center p-2">
        {tweet.author?.image && (
          <Image
            src={tweet.author?.image}
            alt={`${tweet.author.name} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="ml-2 flex flex-col">
          <div className="flex items-center gap-1">
            <p className="font-bold">{tweet.author.name} </p>
            <p className="text-xs text-gray-500">
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <p>{tweet.text}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 p-2">
        {hasLiked ? (
          <AiFillHeart
            color="red"
            size="1.5rem"
            onClick={() => {
              disLikeMutation({
                tweetId: tweet.id,
              });
            }}
          />
        ) : (
          <AiOutlineHeart
            size="1.5rem"
            onClick={() => {
              likeMutation({
                tweetId: tweet.id,
              });
            }}
          />
        )}
        <span className="text-sm text-gray-500">{tweet.likes.length}</span>
      </div>
    </div>
  );
};

const Timeline = () => {
  const scrollPosition = useScrollPosition();

  const client = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.list.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <>
      <CreateTweet />
      {tweets.map((tweet) => (
        <Tweet tweet={tweet} key={tweet.id} client={client} />
      ))}
      {!hasNextPage && <p className="text-center">No more Tweets to show!</p>}
    </>
  );
};

export default Timeline;
