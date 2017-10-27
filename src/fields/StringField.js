import PropTypes from 'prop-types';
import React from 'react';

const StringField = ({ string }) => {
  return <span>{string}</span>;
};

StringField.propTypes = PropTypes.string;

export default StringField;
