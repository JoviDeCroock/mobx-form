import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import { Consumer } from './createContext';
import FieldStore from '../stores/FieldStore';

@observer
class Field extends React.Component {
  static propTypes = {
    Component: PropTypes.func.isRequired,
    destroyOnUnmount: PropTypes.bool,
    fieldId: PropTypes.string.isRequired,
    formStore: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    showError: PropTypes.bool,
  }

  static defaultProps = {
    destroyOnUnmount: false,
    placeholder: null,
    showError: true,
  }

  constructor(props) {
    super(props);
    const { formStore, fieldId } = props;
    if (!formStore) {
      throw new Error('The "Field" Component must be inside a "Form" Component.');
    }
    this.store = formStore;
    if (props.onChange) {
      console.warn(`Seems like you passed your own onChange to ${fieldId}, make sure you talk to the "change" injected by Form. If you are not already.`);
    }

    let validationFunction = this.store.validators[fieldId];
    const { isSchemaValidation } = this.store;
    this.isSchemaValidation = isSchemaValidation;
    if (isSchemaValidation) {
      validationFunction = this.store.validateForm;
    }
    const initialValue = this.store.initialValues[fieldId];
    // Options for our Field given upon Form creation
    const options = {
      initialValue,
      isSchemaValidation,
      showError: props.showError,
      validate: validationFunction,
    };
    const field = new FieldStore(fieldId, options);
    // Bind it to this since we'll have to use it more than once
    this.field = field;
    // Add created field to our formStore
    this.store.addField(field);
    this.onChange = this.onChange.bind(this);
  }

  componentWillUnmount() {
    // No residual values! Clean up your doodoo's
    const { destroyOnUnmount } = this.props;
    if (destroyOnUnmount) {
      this.store.reset();
    }
  }

  onChange(value) {
    this.field.onChange(value);
  }

  render() {
    const { Component, fieldId, ...restProps } = this.props;
    const {
      error,
      onFocus,
      value,
      validateField,
      reset,
      touched,
    } = this.field;

    // Value and onChange passed by our Field/Form
    const fieldProperties = {
      error: touched ? error : undefined,
      // Change this to touched: true for schemaValidation
      onBlur: validateField,
      onChange: this.props.onChange ? this.props.onChange : this.onChange,
      onFocus,
      reset,
      value,
    };

    return (
      <Component
        {...restProps}
        {...fieldProperties} />
    );
  }
}

export default props => (
  <Consumer>
    {formStore => <Field formStore={formStore} {...props} />}
  </Consumer>
);
