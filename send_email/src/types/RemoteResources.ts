export type RemoteResourceInfo = {
  name: string;
  url: string;
  rel: string;
};

export type RemoteResource = {
  info: RemoteResourceInfo;
  content: string;
};
