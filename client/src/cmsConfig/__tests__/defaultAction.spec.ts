import { mapDefaultActionToAction } from '../defaultActions';

describe('mapDefaultActionToAction', () => {
  it('should replace default action', () => {
    const input = {
      type: 'AddButton',
    };
    const result = mapDefaultActionToAction(input);
    expect(result).toEqual({
      href: '/records/{record_type}/new',
      label: 'Add',
      type: 'Link',
    });
  });

  it('should ignore unrecognizable type', () => {
    const input = {
      type: 'Unknown',
    };
    const result = mapDefaultActionToAction(input);
    expect(result).toEqual(input);
  });

  it('should replace default action, with customized value', () => {
    const input = {
      label: 'Customized',
      type: 'AddButton',
    };
    const result = mapDefaultActionToAction(input);
    expect(result).toEqual({
      href: '/records/{record_type}/new',
      label: 'Customized',
      type: 'Link',
    });
  });

  it('should replace default aciton, but ignore unrecognizable custom key', () => {
    const input = {
      $label: 'Customized',
      type: 'AddButton',
    };
    const result = mapDefaultActionToAction(input);
    expect(result).toEqual({
      href: '/records/{record_type}/new',
      label: 'Add',
      type: 'Link',
    });
  });
});