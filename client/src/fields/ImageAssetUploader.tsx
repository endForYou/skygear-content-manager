import * as React from 'react';
import Dropzone, { DropFileEventHandler, ImageFile } from 'react-dropzone';
import { Asset } from 'skygear';

import { ImageAssetFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';
import './ImageAssetUploader.css';

type ImageAssetUploaderProps = RequiredFieldProps<ImageAssetFieldConfig>;

interface State {
  value?: Asset;
  droppedImage?: DroppedImage;
}

interface DroppedImage {
  file: ImageFile;
  previewURL: string;
}

function DroppedImage(file: ImageFile, previewURL: string): DroppedImage {
  return {
    file,
    previewURL,
  };
}

const Image: React.SFC<{ url: string }> = props => {
  return (
    <div
      className="dropzone-image"
      style={{
        backgroundImage: `url(${props.url})`,
        height: 200,
        width: 200,
      }}
    />
  );
};

const DropArea: React.SFC<State> = props => {
  const { value, droppedImage } = props;
  if (droppedImage !== undefined) {
    return <Image url={droppedImage.previewURL} />;
  }

  if (value === undefined || value.url === undefined) {
    return <div>Drop image here or click to upload.</div>;
  }

  return <Image url={value.url} />;
};

export class ImageAssetUploader extends React.PureComponent<
  ImageAssetUploaderProps,
  State
> {
  constructor(props: ImageAssetUploaderProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: ImageAssetUploaderProps) {
    this.setState({ value: nextProps.value });
  }

  public render() {
    const {
      className: _className,
      config: config,
      context: _context,
      onFieldChange: _onFieldChange,
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
        accept="image/*"
        disablePreview={true}
        onDropAccepted={this.onDropAccepted}
        style={{
          height: 232,
          width: 232,
        }}
      >
        <DropArea {...this.state} />
      </Dropzone>
    );
  }

  public onDropAccepted: DropFileEventHandler = (accepted: ImageFile[]) => {
    const [file] = accepted;
    if (file === undefined) {
      return;
    }

    if (this.state.droppedImage !== undefined) {
      releaseDroppedImage(this.state.droppedImage);
    }

    const previewURL = URL.createObjectURL(file);

    this.setState({ droppedImage: DroppedImage(file, previewURL) });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(fileToAsset(file));
    }
  };
}

function releaseDroppedImage(droppedImage: DroppedImage): void {
  URL.revokeObjectURL(droppedImage.previewURL);
}

function fileToAsset(file: File): Asset {
  return new Asset({
    file,
    name: file.name,
  });
}
