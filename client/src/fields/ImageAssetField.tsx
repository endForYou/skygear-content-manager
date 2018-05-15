import classnames from 'classnames';
import * as React from 'react';

import { ImageAssetFieldConfig } from '../cmsConfig';

import { RequiredFieldProps } from './Field';
import { ImageAssetUploader } from './ImageAssetUploader';
import { NullField } from './NullField';

export type ImageAssetFieldProps = RequiredFieldProps<ImageAssetFieldConfig>;

export class ImageAssetField extends React.PureComponent<ImageAssetFieldProps> {
  public renderClearButton() {
    return (
      <div>
        <button className="btn-clear" onClick={this.onClearClick}>
          Clear Image
        </button>
      </div>
    );
  }

  public render() {
    const {
      config: { compact, editable, nullable },
      context: _context,
      className,
      onFieldChange: _onFieldChange,
      value: value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <div className={classnames(className, 'image-input')}>
          <ImageAssetUploader {...this.props} />
          {nullable && this.renderClearButton()}
        </div>
      );
    }

    if (value == null) {
      return (
        <NullField
          {...rest}
          className={classnames(className, 'image-display-null', {
            full: !compact,
          })}
        />
      );
    }

    return (
      <a
        className={classnames(className, 'image-display', { full: !compact })}
        href={value.url}
      >
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
