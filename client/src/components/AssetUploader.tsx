import './AssetUploader.css';

import * as React from 'react';
import Dropzone, { DropFileEventHandler } from 'react-dropzone';
import { Asset } from 'skygear';

export enum AssetType {
  File = 'file',
  Image = 'image',
}

function defaultMimeTypeForAssetType(assetType: AssetType): string {
  switch (assetType) {
    case AssetType.File:
      return '';
    case AssetType.Image:
      return 'image/*';
  }
}

interface DroppedFile {
  file: File;
  previewURL?: string;
}

interface Props {
  assetType: AssetType;
  name?: string;
  style?: object;
  previewStyle?: object;
  value?: Asset;
  onChange?: (asset: Asset) => void;
}

function DroppedFile(file: File, previewURL: string): DroppedFile {
  return {
    file,
    previewURL,
  };
}

const Image: React.SFC<{ url: string; previewStyle?: object }> = props => {
  return (
    <div
      className="dropzone-image"
      style={{
        ...(props.previewStyle || {}),
        backgroundImage: `url(${props.url})`,
      }}
    />
  );
};

const AssetDisplay: React.SFC<{
  name?: string;
  url?: string;
  assetType: AssetType;
  previewStyle?: object;
}> = props => {
  const { assetType, name, previewStyle, url } = props;
  if (url == null) {
    return <div>Asset unavailable.</div>;
  }

  switch (assetType) {
    case AssetType.File:
      return (
        <a target="_blank" href={url} onClick={evt => evt.stopPropagation()}>
          {name}
        </a>
      );
    case AssetType.Image:
      return <Image url={url} previewStyle={previewStyle} />;
  }
};

interface DropAreaProps {
  value?: Asset;
  assetType: AssetType;
  previewStyle?: object;
}

const DropArea: React.SFC<DropAreaProps> = props => {
  const { value, assetType, previewStyle } = props;
  if (value == null || value.url == null) {
    return <div>Drop {assetType} here or click to upload.</div>;
  }

  return (
    <AssetDisplay
      url={value.url}
      name={value.name}
      assetType={assetType}
      previewStyle={previewStyle}
    />
  );
};

export class AssetUploader extends React.PureComponent<Props> {
  private droppedFile?: DroppedFile;

  constructor(props: Props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value == null) {
      if (this.droppedFile) {
        releaseDroppedFile(this.droppedFile);
      }

      return;
    }

    if (
      this.droppedFile &&
      this.droppedFile.previewURL !== nextProps.value.url
    ) {
      releaseDroppedFile(this.droppedFile);
    }
  }

  public render() {
    const {
      assetType,
      onChange,
      previewStyle,
      style,
      value,
      ...rest,
    } = this.props;

    return (
      <Dropzone
        {...rest}
        className="dropzone"
        activeClassName="dropzone-active"
        acceptClassName="dropzone-accept"
        rejectClassName="dropzone-reject"
        accept={defaultMimeTypeForAssetType(assetType)}
        disablePreview={true}
        onDropAccepted={this.onDropAccepted}
        style={style}
      >
        <DropArea
          value={value}
          assetType={assetType}
          previewStyle={previewStyle}
        />
      </Dropzone>
    );
  }

  public onDropAccepted: DropFileEventHandler = (accepted: File[]) => {
    const [file] = accepted;
    if (file == null) {
      return;
    }

    if (this.droppedFile !== undefined) {
      releaseDroppedFile(this.droppedFile);
    }

    const previewURL = URL.createObjectURL(file);
    this.droppedFile = DroppedFile(file, previewURL);

    if (this.props.onChange) {
      this.props.onChange(
        new Asset({
          file,
          name: file.name,

          // this makes use of the fact that skygear Asset for upload ignores
          // this url field, so the field is used by this AssetUploader only
          url: previewURL,
        })
      );
    }
  };
}

function releaseDroppedFile(droppedFile: DroppedFile): void {
  if (droppedFile.previewURL != null) {
    URL.revokeObjectURL(droppedFile.previewURL);
  }
}
