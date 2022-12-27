import React, { useState, useEffect } from "react";
import CreateTweet from "./createTweet";
import type { RouterOutputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";

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

const Tweet = ({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["list"]["tweets"][number];
}) => {
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
    </div>
  );
};

const Timeline = () => {
  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.list.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  console.log("data", data);

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
        <Tweet tweet={tweet} key={tweet.id} />
      ))}
      {hasNextPage ? (
        <button
          className="btn-primary"
          disabled={isFetching}
          onClick={() => {
            console.log("clicked");
          }}
        >
          Load more tweets!
        </button>
      ) : (
        <p className="text-center">No more Tweets to show!</p>
      )}
    </>
  );
};

export default Timeline;
