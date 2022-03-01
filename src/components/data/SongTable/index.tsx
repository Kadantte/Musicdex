import { Box, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import React, { useCallback, useContext, useMemo } from "react";
import { FixedSizeList } from "react-window";
import WindowScroller from "react-virtualized/dist/es/WindowScroller";
import { memoize } from "lodash-es";
import { DEFAULT_MENU_ID } from "../../common/CommonContext";
import { FrameRef } from "../../layout/Frame";
import { RowProps, SongRow } from "./SongRow";

export type SongTableCol =
  | "idx"
  | "title"
  | "og_artist"
  | "duration"
  | "sang_on"
  | "menu";

interface SongTableProps {
  songs?: Song[];
  playlist?: PlaylistFull;
  // reactive hooks:
  songDropdownMenuRenderer?: (cellInfo: any) => JSX.Element;
  virtualized?: boolean;

  menuId?: string;
  rowProps?: RowProps;
}

const memoized = memoize(
  (
    songList: Song[],
    menuId?: any,
    rowProps?: RowProps,
    playlist?: PlaylistFull
  ) => ({
    songList,
    menuId,
    rowProps,
    playlist,
  })
);
export const SongTable = ({
  songs,
  menuId = DEFAULT_MENU_ID,
  virtualized = false,
  rowProps,
  playlist,
  ...rest
}: SongTableProps & BoxProps) => {
  const detailLevel = useBreakpointValue<SongTableCol[] | undefined>(
    {
      base: ["idx", "og_artist", "sang_on", "duration"],
      sm: ["idx", "og_artist", "sang_on"],
      md: ["idx", "og_artist"],
      lg: [],
      xl: [],
    },
    "xl"
  );
  const props = useMemo(
    () => ({ ...rowProps, hideCol: rowProps?.hideCol ?? detailLevel }),
    [detailLevel, rowProps]
  );
  const songList = playlist?.content || songs;
  const data = memoized(songList!, menuId, props, playlist);
  const frameRef = useContext(FrameRef);
  const list = React.useRef<any>(null);
  const onScroll = useCallback(({ scrollTop }) => {
    list.current?.scrollTo(scrollTop);
  }, []);

  if (!songList) return <>No Songs</>;

  return virtualized ? (
    <WindowScroller onScroll={onScroll} scrollElement={frameRef.current}>
      {({ height }) => {
        return (
          <FixedSizeList
            height={height || frameRef.current.getBoundingClientRect().height}
            width="100%"
            itemCount={songList.length}
            itemSize={60}
            itemData={data}
            ref={list}
            style={{ height: "100vh !important" }}
          >
            {SongRow}
          </FixedSizeList>
        );
      }}
    </WindowScroller>
  ) : (
    <Box {...rest}>
      {songList.map((song, index) => (
        <SongRow
          data={data}
          index={index}
          style={{}}
          key={`${data.menuId}${song.id}`}
        />
      ))}
    </Box>
  );
};
