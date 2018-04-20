import { Editor } from '@tinymce/tinymce-react';
import * as React from 'react';

import { connect } from 'react-redux';
import { WYSIWYGFieldConfig } from '../cmsConfig';
import { AppConfig } from '../config';
import { RootState } from '../states';
import { RequiredFieldProps } from './Field';

export interface WYSIWYGEditorProps
  extends RequiredFieldProps<WYSIWYGFieldConfig> {
  appConfig: AppConfig;
}

interface State {
  // editorState: EditorState;
  value: string;
}

// tslint:disable max-line-length
const makeDefaultEditorInitObj = (config: AppConfig) => ({
  height: 480,
  plugins:
    'anchor charmap code colorpicker contextmenu fullscreen hr image imagetools link lists nonbreaking paste tabfocus table textcolor',
  skin_url:
    (config.staticUrl === '.' ? '/' : config.staticUrl) +
    'tinymce/skins/lightgray',
  toolbar1:
    'bold italic strikethrough forecolor backcolor | link image | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
});
// tslint:enable max-line-length

class WYSIWYGEditorImpl extends React.PureComponent<WYSIWYGEditorProps, State> {
  constructor(props: WYSIWYGEditorProps) {
    super(props);

    const { value } = this.props;

    this.state = {
      value,
    };
  }

  public componentWillReceiveProps(nextProps: WYSIWYGEditorProps) {
    this.setState({ value: nextProps.value });
  }

  public render() {
    const { config: userConfig, editable } = this.props.config;
    const { value } = this.state;

    // tslint:disable-next-line: no-any
    const editorEditInitObj: any = {
      ...this.defaultEditorInitObj,
      ...userConfig,
    };
    if (!editable) {
      editorEditInitObj.readonly = true;
      editorEditInitObj.menubar = false;
      editorEditInitObj.toolbar = false;
      editorEditInitObj.object_resizing = false;
    }

    return (
      <Editor
        init={editorEditInitObj}
        value={value}
        onEditorChange={this.handleEditorChange}
      />
    );
  }

  private handleEditorChange = (content: string) => {
    const { onFieldChange } = this.props;

    this.setState({ value: content });
    if (onFieldChange) {
      onFieldChange(content);
    }
  };

  private get defaultEditorInitObj() {
    return makeDefaultEditorInitObj(this.props.appConfig);
  }
}

export const WYSIWYGEditor = connect((state: RootState) => ({
  appConfig: state.appConfig,
}))(WYSIWYGEditorImpl);
