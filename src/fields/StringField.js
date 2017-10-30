import * as PropTypes from 'prop-types';
import * as React from 'react';

const StringField = ({ string }) => {
  return <span>{string}</span>;
};

StringField.propTypes = PropTypes.string;

export default StringField;
