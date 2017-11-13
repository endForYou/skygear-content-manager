import * as React from 'react';
import { Asset } from 'skygear';

import { ImageAssetFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type ImageAssetFieldProps = RequiredFieldProps<ImageAssetFieldConfig>;

interface State {
  value?: Asset;
}

export class ImageAssetField extends React.PureComponent<
  ImageAssetFieldProps,
  State
> {
  constructor(props: ImageAssetFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: ImageAssetFieldProps) {
    this.setState({ value: nextProps.value });
  }

  public render() {
    const {
      config: { editable },
      context: _context,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const { value } = this.state;

    if (editable) {
      return <span {...rest}>{value && value.url}</span>;
    } else {
      return value === undefined ? (
        <NullField />
      ) : (
        <img {...rest} src={value.url} />
      );
    }
  }
}
