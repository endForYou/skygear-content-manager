import classnames from 'classnames';
import * as React from 'react';

import { FileAssetFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';

import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type FileAssetFieldProps = RequiredFieldProps<FileAssetFieldConfig>;

export class FileAssetField extends React.PureComponent<FileAssetFieldProps> {
  public renderClearButton() {
    return (
      <button className="btn-clear" onClick={this.onClearClick}>
        Clear File
      </button>
    );
  }

  public render() {
    const {
      config: { accept, compact, editable, nullable },
      context: _context,
      className,
      onFieldChange,
      value: value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <div className={className}>
          <AssetUploader
            {...rest}
            accept={accept}
            value={value}
            assetType={AssetType.File}
            onChange={onFieldChange}
            style={{
              height: 155,
              width: 348,
            }}
          />
          {nullable && this.renderClearButton()}
        </div>
      );
    }

    if (value === undefined) {
      return (
        <NullField
          {...rest}
          className={classnames(className, 'file-display-null', {
            full: !compact,
          })}
        />
      );
    }

    return (
      <div
        className={classnames(className, 'file-display', { full: !compact })}
      >
        <a target="_blank" href={value.url}>
          {value.name}
        </a>
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
