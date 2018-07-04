import * as React from 'react';

import { ImageUploaderFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';
import { RequiredFieldProps } from './Field';

export type ImageAssetUploaderProps = RequiredFieldProps<
  ImageUploaderFieldConfig
>;

class ImageAssetUploaderImpl extends React.PureComponent<
  ImageAssetUploaderProps
> {
  public render() {
    const { config: { editable }, onFieldChange, ...rest } = this.props;
    const {
      preview_height: previewHeight = 200,
      preview_width: previewWidth = 200,
    } =
      this.props.config.config || {};
    return (
      <AssetUploader
        {...rest}
        accept="image/*"
        assetType={AssetType.Image}
        onChange={onFieldChange}
        style={{
          height: previewHeight + 32,
          width: previewWidth + 32,
        }}
        previewStyle={{
          height: previewHeight,
          width: previewWidth,
        }}
        disabled={!editable}
      />
    );
  }
}

export const ImageAssetUploader: React.ComponentClass<
  ImageAssetUploaderProps
> = ImageAssetUploaderImpl;
