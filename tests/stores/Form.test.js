import FormStore from '../../src/FormStore';
import FieldStore from '../../src/FieldStore';

describe('FormStore', () => {
  it('All types should be right', () => {
    const handleSubmit = () => console.log('hello');
    const formStore = new FormStore({ handleSubmit });
    expect(typeof formStore.fields).toEqual('object');
    expect(typeof formStore.validators).toEqual('object');
  });

  it('Should error when not passing a handleSubmit.', () => {
    try {
      const formStore = new FormStore();
      // We should never reach this.
      expect(false).toEqual(true);
    } catch (e) {
      expect(e.message).toEqual('Please pass a handleSubmit function.');
    }
  });

  it('Should error when passing a string as handleSubmit.', () => {
    try {
      const formStore = new FormStore({ handleSubmit: 'notAFunction' });
      // We should never reach this.
      expect(false).toEqual(true);
    } catch (e) {
      expect(e.message).toEqual('Please pass a handleSubmit function.');
    }
  });

  it('Should succesfully construct with a handleSubmit function.', () => {
    const handleSubmit = () => console.log('hello');
    const formStore = new FormStore({ handleSubmit });
    expect(typeof formStore.handleSubmit).toEqual('function');
  });

  it('Should succesfully add validators.', () => {
    const handleSubmit = () => console.log('hello');
    const validators = {
      func: () => console.log('Validating text'),
    };

    const formStore = new FormStore({ handleSubmit, validators });
    expect(typeof formStore.validators.func).toEqual('function');
  });

  it('Should succesfully add initialValues.', () => {
    const handleSubmit = () => console.log('hello');
    const initialValues = {
      testField: 'test',
    };

    const formStore = new FormStore({ handleSubmit, initialValues });
    expect(formStore.initialValues.testField).toEqual('test');
  });

  it('Should succesfully add validator functions and ignore non functions.', () => {
    const handleSubmit = () => console.log('hello');
    const validators = {
      func: () => console.log('Validating text'),
      nonFunc: 'herrow',
    };

    const formStore = new FormStore({ handleSubmit, validators });
    expect(typeof formStore.validators.func).toEqual('function');
    expect(formStore.validators.nonFunc).toEqual(undefined);
  });

  it('Should add a field when creating one.', () => {
    const handleSubmit = () => console.log('hello');
    const formStore = new FormStore({ handleSubmit });
    const fieldStore = new FieldStore('testField');
    formStore.addField(fieldStore);

    // Tests
    const formField = formStore.fields.testField;
    expect(typeof formField).toEqual('object');
    expect(formField.validate).toEqual(null);
    expect(formField.fieldId).toEqual('testField');
  });

  it('should not submit when invalid', () => {
    const handleSubmit = () => console.log('hello');
    const validators = {
      testField: (value) => {
        if (value.length <= 3) {
          return 'error'
        }
      }
    }
    const initialValues = {
      testField: 'Rik',
    }

    const formStore = new FormStore({ handleSubmit, validators, initialValues});
    formStore.addField(new FieldStore('testField', {
      validate: validators.testField,
      initialValue: initialValues.testField,
    }));

    formStore.onSubmit();
    expect(formStore.fields.testField.error).toEqual('error');
    formStore.onChange('testField', 'Riki');
    expect(formStore.fields.testField.value).toEqual('Riki');
    formStore.onSubmit();
    expect(formStore.fields.testField.error).toEqual(null);
  });
})
