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

interface State {
  value?: Asset;
  droppedFile?: DroppedFile;
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
        <a target="_blank" href={url}>
          {name}
        </a>
      );
    case AssetType.Image:
      return <Image url={url} previewStyle={previewStyle} />;
  }
};

interface DropAreaProps extends State {
  assetType: AssetType;
  previewStyle?: object;
}

const DropArea: React.SFC<DropAreaProps> = props => {
  const { value, droppedFile, assetType, previewStyle } = props;
  if (droppedFile !== undefined) {
    return (
      <AssetDisplay
        url={droppedFile.previewURL}
        name={droppedFile.file.name}
        assetType={assetType}
        previewStyle={previewStyle}
      />
    );
  }

  if (value === undefined || value.url === undefined) {
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

export class AssetUploader extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.setState({ value: nextProps.value });
  }

  public render() {
    const {
      assetType,
      onChange,
      previewStyle,
      style,
      value: _value,
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
          {...this.state}
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

    if (this.state.droppedFile !== undefined) {
      releaseDroppedFile(this.state.droppedFile);
    }

    const previewURL = URL.createObjectURL(file);

    this.setState({ droppedFile: DroppedFile(file, previewURL) });

    if (this.props.onChange) {
      this.props.onChange(fileToAsset(file));
    }
  };
}

function releaseDroppedFile(droppedFile: DroppedFile): void {
  if (droppedFile.previewURL != null) {
    URL.revokeObjectURL(droppedFile.previewURL);
  }
}

function fileToAsset(file: File): Asset {
  return new Asset({
    file,
    name: file.name,
  });
}
