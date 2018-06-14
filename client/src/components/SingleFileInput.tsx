import './SingleFileInput.scss';

import classnames from 'classnames';
import * as React from 'react';

interface Props {
  className?: string;
  accept?: string;
  title: string;
  file?: File;
  onFileSelected: (file?: File) => void;
}

export class SingleFileInput extends React.PureComponent<Props> {
  private fileInput: HTMLInputElement | null = null;

  public componentWillUnmount() {
    this.fileInput = null;
  }

  public render() {
    const { accept, className, file, title } = this.props;

    const inputProps = { accept };

    return (
      <div className={classnames('single-file-input', className)}>
        <button className="input-button primary-button" onClick={this.onClick}>
          {title}
        </button>

        <div
          className={classnames('file-name', {
            empty: file == null,
          })}
        >
          {file == null ? 'No file selected.' : file.name}
        </div>

        <input
          {...inputProps}
          ref={ref => (this.fileInput = ref)}
          style={{ display: 'none' }}
          type="file"
          onChange={this.onChange}
        />
      </div>
    );
  }

  private onClick = () => {
    if (this.fileInput) {
      // reset value to trigger event for the same file
      this.fileInput.value = '';
      this.fileInput.click();
    }
  };

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const file = event.target.files[0];
      this.props.onFileSelected(file);
    }
  };
}
