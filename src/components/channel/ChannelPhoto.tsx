import {
  Link,
  Image,
  ImageProps,
  Avatar,
  AvatarProps,
  useTheme,
} from "@chakra-ui/react";
import { channel } from "diagnostics_channel";
import { getChannelPhoto } from "../../modules/channel/utils";

interface ChannelPhotoProps extends AvatarProps {
  channelId?: string;
  channel?: {
    id?: string;
    english_name?: string;
    name: string;
  };
  resizePhoto?: number;
}

export function ChannelPhoto({
  channelId,
  channel,
  resizePhoto,
  ...rest
}: ChannelPhotoProps) {
  const id = channelId || channel?.id;
  const src = id && getChannelPhoto(id, resizePhoto);
  const name = channel?.english_name || channel?.name;
  return (
    <Avatar src={src} name={name} loading="lazy" bgColor="unset" {...rest} />
  );
}
