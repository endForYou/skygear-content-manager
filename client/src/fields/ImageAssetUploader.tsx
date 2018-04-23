import * as React from 'react';

import { ImageAssetFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';
import { RequiredFieldProps } from './Field';

export type ImageAssetUploaderProps = RequiredFieldProps<ImageAssetFieldConfig>;

class ImageAssetUploaderImpl extends React.PureComponent<
  ImageAssetUploaderProps
> {
  public render() {
    const { onFieldChange, ...rest } = this.props;
    return (
      <AssetUploader
        {...rest}
        accept="image/*"
        assetType={AssetType.Image}
        onChange={onFieldChange}
        style={{
          height: 232,
          width: 232,
        }}
        previewStyle={{
          height: 200,
          width: 200,
        }}
      />
    );
  }
}

export const ImageAssetUploader: React.ComponentClass<
  ImageAssetUploaderProps
> = ImageAssetUploaderImpl;
