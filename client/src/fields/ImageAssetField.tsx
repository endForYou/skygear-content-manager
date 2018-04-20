import * as React from 'react';

import { ImageAssetFieldConfig } from '../cmsConfig';

import { RequiredFieldProps } from './Field';
import { ImageAssetUploader } from './ImageAssetUploader';
import { NullField } from './NullField';

import './ImageAssetField.css';

export type ImageAssetFieldProps = RequiredFieldProps<ImageAssetFieldConfig>;

export class ImageAssetField extends React.PureComponent<ImageAssetFieldProps> {
  public renderClearButton() {
    return (
      <button className="btn btn-light mt-2" onClick={this.onClearClick}>
        Clear Image
      </button>
    );
  }

  public render() {
    const {
      config: { editable },
      context: _context,
      onFieldChange: _onFieldChange,
      value: value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <div>
          <ImageAssetUploader {...this.props} />
          {this.renderClearButton()}
        </div>
      );
    }

    if (value == null) {
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

  private onClearClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (this.props.onFieldChange) {
      this.props.onFieldChange(null);
    }
  };
}
