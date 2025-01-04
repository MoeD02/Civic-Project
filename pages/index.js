import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

const Home = () => {
  const parentRef = React.useRef(null);

  // Infinite Query to fetch integers
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["integers"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/integers?page=${pageParam}&limit=20`);
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  // Flatten data into a single array of integers
  const integers = React.useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.data) : []),
    [data]
  );

  // Virtualizer for efficient rendering
  const rowVirtualizer = useVirtualizer({
    count: integers.length + (hasNextPage ? 1 : 0), // Add extra row for loader
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Height of each row
  });

  // Trigger fetching of next page when reaching the last virtualized item
  React.useEffect(() => {
    const lastItemIndex = integers?.length ? integers.length - 1 : -1;
    if (
      rowVirtualizer.getVirtualItems().some(
        (virtualItem) => virtualItem.index === lastItemIndex
      ) &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [rowVirtualizer.getVirtualItems(), integers, hasNextPage, fetchNextPage]);

  return (
    <div
      ref={parentRef}
      style={{
        height: "400px",
        width: "300px",
        overflow: "auto",
        border: "1px solid black",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= integers.length;
          return (
            <div
              key={virtualRow.key}
              ref={virtualRow.measureRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow
                ? isFetchingNextPage
                  ? "Loading..."
                  : "No more data"
                : integers[virtualRow.index]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
