import {
  Box,
  Center,
  Code,
  Flex,
  Heading,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SongTable } from "../components/data/SongTable";
import { PageContainer } from "../components/layout/PageContainer";
import { PlaylistHeading } from "../components/playlist/PlaylistHeading";
import { useClient } from "../modules/client";
import {
  usePlaylist,
  usePlaylistWriter,
} from "../modules/services/playlist.service";
import { useStoreActions } from "../store";
import {
  identifyDescription,
  identifyPlaylistBannerImage,
  identifyTitle,
} from "../utils/PlaylistHelper";
import { PlaylistButtonArray } from "../components/playlist/PlaylistButtonArray";
import React from "react";
import { QueryStatus } from "../components/common/QueryStatus";
import { ContainerInlay } from "../components/layout/ContainerInlay";
import { BGImgContainer, BGImg } from "../components/common/BGImgContainer";
import { ErrorFallback } from "../ErrorFallback";
const SongEditableTable = React.lazy(
  () => import("../components/data/SongTableEditable")
);

export default function Playlist() {
  let params = useParams();
  let playlistId = params.playlistId!;
  let { user, isLoggedIn } = useClient();

  const { data: playlist, ...status } = usePlaylist(playlistId);

  const { mutateAsync: writeNewPlaylist } = usePlaylistWriter();

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditMode(false);
  }, [playlistId]);

  const { banner, title, description } = useMemo(() => {
    return (
      (playlist && {
        banner: identifyPlaylistBannerImage(playlist),
        title: identifyTitle(playlist),
        description: identifyDescription(playlist),
      }) ||
      {}
    );
  }, [playlist]);

  const queueSongs = useStoreActions((actions) => actions.playback.queueSongs);
  const setPlaylist = useStoreActions(
    (actions) => actions.playback.setPlaylist
  );

  // const bgColor = useColorModeValue("bgAlpha.50", "bgAlpha.900");

  const writablePlaylist: Partial<WriteablePlaylist> = useMemo(() => {
    let c: Partial<WriteablePlaylist> = {
      ...playlist,
      content: playlist?.content?.map((x) => x.id),
    };
    return c;
  }, [playlist]);

  // Editing:
  const [newSongIds, setNewSongIds] = useState<string[] | null>(null);

  const toast = useToast();

  const finishSongEditing = async () => {
    if (newSongIds !== null) {
      const newWritable: Partial<WriteablePlaylist> = {
        ...playlist,
        content: newSongIds,
      };
      writeNewPlaylist(newWritable).then(
        (_) => {
          //success:
          toast({ variant: "subtle", status: "success", title: "Saved" });
          setEditMode(false);
        },
        (err) => {
          toast({
            variant: "solid",
            status: "error",
            title: "Failed to Save",
            description: err,
          });
          setEditMode(false);
        }
      );
    } else {
      setEditMode(false);
    }
  };
  console.log(status.error);

  if (status.error && (status?.error as any)?.status >= 400) {
    return (
      <Box pt="10vh" px={6}>
        <Center role="alert" my={10}>
          <VStack spacing={4}>
            <Heading>
              You do not have access to this playlist (or it doesn't exist)
            </Heading>
            <Code>{(status?.error as Error)?.toString()}</Code>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (!playlist)
    return (
      <QueryStatus queryStatus={status} height="100%" justifyContent="center" />
    );

  return (
    <PageContainer key={"playlist_" + playlistId}>
      <BGImgContainer height="200px">
        <BGImg banner_url={banner || ""} height="200px"></BGImg>
      </BGImgContainer>
      <ContainerInlay mt="12">
        <PlaylistHeading
          title={title || "..."}
          description={description || "..."}
          canEdit={isLoggedIn && playlist.owner == user?.id}
          editMode={false}
          setDescription={(text) => {
            writeNewPlaylist({ ...writablePlaylist, description: text });
          }}
          setTitle={(text) => {
            writeNewPlaylist({ ...writablePlaylist, title: text });
          }}
          count={
            (editMode
              ? newSongIds?.length ?? playlist?.content?.length
              : playlist?.content?.length) || 0
          }
        />
        <PlaylistButtonArray
          playlist={playlist}
          canEdit={isLoggedIn && playlist.owner === user?.id}
          editMode={editMode}
          onPlayClick={() => {
            setPlaylist({ playlist });
          }}
          onAddQueueClick={() => {
            playlist.content &&
              queueSongs({
                songs: [...playlist.content],
                immediatelyPlay: false,
              });
          }}
          onEditClick={() => {
            setEditMode(true);
          }}
          onFinishEditClick={finishSongEditing}
        />
        {playlist.content &&
          (editMode ? (
            <Suspense fallback={<div>Loading...</div>}>
              <SongEditableTable
                songs={playlist.content}
                songsEdited={setNewSongIds}
              />
            </Suspense>
          ) : (
            // <Suspense fallback={<div>Loading...</div>}>
            <SongTable songs={playlist.content} virtualized />
            // </Suspense>
          ))}
      </ContainerInlay>
    </PageContainer>
  );
}
