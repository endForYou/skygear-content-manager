import { Editor } from '@tinymce/tinymce-react';
import * as React from 'react';

import { WYSIWYGFieldConfig } from '../cmsConfig';
import config from '../config';
import { RequiredFieldProps } from './Field';

// tslint:disable no-submodule-imports ordered-imports
import 'tinymce/tinymce';
import 'tinymce/themes/modern/theme';
// tslint:enable no-submodule-imports ordered-imports

// this list of imports should match EditorInitObj.plugins
// tslint:disable no-submodule-imports
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/tabfocus';
import 'tinymce/plugins/table';
import 'tinymce/plugins/textcolor';
// tslint:enable no-submodule-imports

export type WYSIWYGEditorProps = RequiredFieldProps<WYSIWYGFieldConfig>;

interface State {
  // editorState: EditorState;
  value: string;
}

// tslint:disable max-line-length
const EditorInitObj = {
  height: 480,
  plugins:
    'anchor charmap code colorpicker contextmenu fullscreen hr image imagetools link lists nonbreaking paste tabfocus table textcolor',
  selector: 'textarea',
  skin_url:
    (config.publicUrl === '.' ? '' : config.publicUrl) +
    '/tinymce/skins/lightgray',
  toolbar1:
    'bold italic strikethrough forecolor backcolor | link image | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
};
// tslint:enable max-line-length

export class WYSIWYGEditor extends React.PureComponent<
  WYSIWYGEditorProps,
  State
> {
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
    const editable = this.props.config.editable;
    const { value } = this.state;

    const disabled = editable === undefined ? false : !editable;

    return (
      <Editor
        init={{ ...EditorInitObj, readonly: disabled }}
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
}
