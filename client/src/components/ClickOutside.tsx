import * as React from 'react';

interface Props {
  onClickOutside: () => void;
}

export class ClickOutside extends React.PureComponent<
  Props & React.HTMLAttributes<HTMLDivElement>
> {
  private isTouch: boolean = false;
  private container: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    document.addEventListener('touchend', this.handle, true);
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('touchend', this.handle, true);
    document.removeEventListener('click', this.handle, true);
  }

  render() {
    const { children, onClickOutside, ...props } = this.props;
    return (
      <div {...props} ref={this.getContainer}>
        {children}
      </div>
    );
  }

  private getContainer = (ref: HTMLDivElement) => {
    this.container = ref;
  };

  private handle = (e: Event) => {
    if (e.type === 'touchend') {
      this.isTouch = true;
    }
    if (e.type === 'click' && this.isTouch) {
      return;
    }
    const { onClickOutside } = this.props;
    const el = this.container;
    const target = e.target as Node;
    if (el && target && !el.contains(target)) {
      onClickOutside();
    }
  };
}
