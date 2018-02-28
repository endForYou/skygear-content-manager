import * as React from 'react';
import { ImportActionConfig } from '../cmsConfig';

export interface ImportButtonProps {
  actionConfig: ImportActionConfig;
  onFileSelected(actionConfig: ImportActionConfig, file: File): void;
}

export class ImportButton extends React.PureComponent<ImportButtonProps> {

  private fileInput: HTMLInputElement | null;

  constructor(props: ImportButtonProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public onClick(event: React.MouseEvent<HTMLElement>) {
    if (this.fileInput) {
      // reset value to trigger event for the same file
      this.fileInput.value = '';
      this.fileInput.click();
    }
  }

  public onChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (event.target.files) {
      const { actionConfig, onFileSelected } = this.props;
      const file = event.target.files[0];
      onFileSelected(actionConfig, file);
    }
  }

  public render() {
    const { actionConfig } = this.props;
    const title = actionConfig.label || actionConfig.name;

    return (
      <div
        className="btn btn-light"
        onClick={this.onClick}
      >
        {title}
        <input
          ref={ref => this.fileInput = ref}
          style={{display: 'none'}}
          type="file"
          onChange={this.onChange}
        />
      </div>
    );
  }
}
