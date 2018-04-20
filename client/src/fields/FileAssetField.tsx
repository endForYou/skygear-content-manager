import * as React from 'react';

import { FileAssetFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';

import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type FileAssetFieldProps = RequiredFieldProps<FileAssetFieldConfig>;

export class FileAssetField extends React.PureComponent<FileAssetFieldProps> {
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
        <AssetUploader
          {...rest}
          assetType={AssetType.File}
          onChange={onFieldChange}
          style={{
            height: 155,
            width: 232,
          }}
        />
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
}
