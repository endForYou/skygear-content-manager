import classnames from 'classnames';
import * as React from 'react';

import {
  ImageDisplayFieldConfig,
  ImageUploaderFieldConfig,
} from '../cmsConfig';

import { RequiredFieldProps } from './Field';
import { ImageAssetUploader } from './ImageAssetUploader';
import { NullField } from './NullField';

export type ImageDisplayFieldProps = RequiredFieldProps<
  ImageDisplayFieldConfig
>;

export const ImageDisplayField: React.SFC<ImageDisplayFieldProps> = ({
  config: { compact },
  className,
  value,
  ...rest,
}) => {
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
};

export type ImageUploaderFieldProps = RequiredFieldProps<
  ImageUploaderFieldConfig
>;

export class ImageUploaderField extends React.PureComponent<
  ImageUploaderFieldProps
> {
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
    const { config: { editable, nullable }, className } = this.props;

    return (
      <div className={classnames(className, 'image-input')}>
        <ImageAssetUploader {...this.props} />
        {nullable && editable && this.renderClearButton()}
      </div>
    );
  }

  private onClearClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (this.props.onFieldChange) {
      this.props.onFieldChange(null);
    }
  };
}
