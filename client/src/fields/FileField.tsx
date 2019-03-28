import classnames from 'classnames';
import * as React from 'react';

import { FileDisplayFieldConfig, FileUploaderFieldConfig } from '../cmsConfig';
import { AssetType, AssetUploader } from '../components/AssetUploader';

import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';
import { ValidationAlert } from './validation/ValidationAlert';

export type FileDisplayFieldProps = RequiredFieldProps<FileDisplayFieldConfig>;

export const FileDisplayField: React.SFC<FileDisplayFieldProps> = ({
  config: { compact },
  className,
  value,
  validationError: _validationError,
  ...rest
}) => {
  if (value == null) {
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
    <div className={classnames(className, 'file-display', { full: !compact })}>
      <a target="_blank" href={value.url}>
        {value.name}
      </a>
    </div>
  );
};

export type FileUploaderFieldProps = RequiredFieldProps<
  FileUploaderFieldConfig
>;

export class FileUploaderField extends React.PureComponent<
  FileUploaderFieldProps
> {
  public renderClearButton() {
    return (
      <div>
        <button className="btn-clear" onClick={this.onClearClick} type="button">
          Clear File
        </button>
      </div>
    );
  }

  public render() {
    const {
      config: { accept, editable, nullable },
      context: _context,
      className,
      onFieldChange,
      value: value,
      validationError,
      ...rest
    } = this.props;

    return (
      <div className={classnames(className, 'file-input')}>
        <ValidationAlert validationError={validationError} />
        <AssetUploader
          {...rest}
          accept={accept}
          value={value}
          assetType={AssetType.File}
          onChange={onFieldChange}
          style={{
            borderColor: hasValidationError(validationError)
              ? '#dc3545'
              : undefined,
            height: 155,
            width: 348,
          }}
          disabled={!editable}
        />
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
