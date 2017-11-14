import * as React from 'react';

import { ImageAssetFieldConfig } from '../cmsConfig';

import { RequiredFieldProps } from './Field';
import { ImageAssetUploader } from './ImageAssetUploader';
import { NullField } from './NullField';

import './ImageAssetField.css';

export type ImageAssetFieldProps = RequiredFieldProps<ImageAssetFieldConfig>;

export class ImageAssetField extends React.PureComponent<ImageAssetFieldProps> {
  public render() {
    const {
      config: { editable },
      context: _context,
      onFieldChange: _onFieldChange,
      value: value,
      ...rest,
    } = this.props;

    if (editable) {
      return <ImageAssetUploader {...this.props} />;
    }

    if (value === undefined) {
      return <NullField {...rest} />;
    }

    return (
      <a href={value.url}>
        <div
          className="image-asset-image"
          style={{
            backgroundImage: `url(${value.url})`,
            height: 200,
            width: 200,
          }}
        />
      </a>
    );
  }
}
