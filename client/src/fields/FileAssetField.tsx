import * as React from 'react';

import { FileAssetFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';

import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type FileAssetFieldProps = RequiredFieldProps<FileAssetFieldConfig>;

export class FileAssetField extends React.PureComponent<FileAssetFieldProps> {
  public renderClearButton() {
    return (
      <button className="btn btn-light mt-2" onClick={this.onClearClick}>
        Clear File
      </button>
    );
  }

  public render() {
    const {
      config: { editable },
      context: _context,
      onFieldChange,
      value: value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <div>
          <AssetUploader
            {...rest}
            value={value}
            assetType={AssetType.File}
            onChange={onFieldChange}
            style={{
              height: 155,
              width: 232,
            }}
          />
          {this.renderClearButton()}
        </div>
      );
    }

    if (value === undefined) {
      return <NullField {...rest} />;
    }

    return (
      <div>
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
