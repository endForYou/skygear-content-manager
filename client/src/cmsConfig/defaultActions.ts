interface DefaultAction {
  configurableKeys: string[];
  // tslint:disable-next-line: no-any
  value: any;
}

const defaultActionMap: { [key: string]: DefaultAction } = {
  add_button: {
    configurableKeys: ['label'],
    value: {
      href: '/records/{record_type}/new',
      label: 'Add',
      type: 'link',
    },
  },
  edit_button: {
    configurableKeys: ['label'],
    value: {
      href: '/record/{record.id}/edit',
      label: 'Edit',
      type: 'link',
    },
  },
  show_button: {
    configurableKeys: ['label'],
    value: {
      href: '/record/{record.id}',
      label: 'Show',
      type: 'link',
    },
  },
};

const defaultActionTypes = Object.keys(defaultActionMap);

// tslint:disable-next-line: no-any
export function mapDefaultActionToAction(input: any): any {
  if (defaultActionTypes.indexOf(input.type) !== -1) {
    return mergeActionWithInput(defaultActionMap[input.type], input);
  }

  return input;
}

// tslint:disable-next-line: no-any
export function mergeActionWithInput(defaultAction: any, input: any): any {
  return defaultAction.configurableKeys.reduce(
    // tslint:disable-next-line: no-any
    (acc: any, key: string) =>
      input[key] ? { ...acc, [key]: input[key] } : acc,
    { ...defaultAction.value }
  );
}
