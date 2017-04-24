import { observable } from 'mobx';
import { formatConditionals } from './conditionals';

class Field {
  key = null;
  component = null;

  @observable valid = true;
  @observable value = null;
  conditionals = false;
  hasChanged = false;
  isBlurred = false;

  constructor(component, key, props = {}, valid = false) {
    if(!component) {
      throw new Error('Element instance reference is required');
    }

    if(!key) {
      throw new Error('Element key is required');
    }

    this.component = component;
    this.key = key;
    this.valid = valid;
    this.value = props['#default_value'] || '';
    this.props = props;
    this.conditionals = formatConditionals(props['#states']);
  }

  getStorage(fields = false) {
    if(Array.isArray(fields)) {
      const data = {};
      fields.forEach((f) => {
        data[f] = this[f];
      }); // Add property from field storage for each field key in fields array.
      return data;
    } else if(typeof fields === 'string') {
      return this[fields];
    }
    return this;
  }

  getValue() {
    return this.value;
  }

  setStorage(patch) {
    Object.keys(patch).forEach((patchKey) => {
      this[patchKey] = patch[patchKey];
    });
  }
}

class FormStore {
  @observable settings = {};
  @observable fields = [];
  @observable formProperties = {
    hasRequiredFields: false,
  };
  key = null;

  constructor(formId, settings) {
    this.key = formId;
    this.settings = settings;
  }

  checkConditionals(excluded = []) {
    this.fields.forEach(field => field.component.checkConditionals(excluded));
  }

  createField(component, key, props, valid) {
    const existingFieldIndex = this.getFieldIndex(key);
    const field = new Field(component, key, props, valid);
    if(existingFieldIndex > -1) {
      // console.warn('Field', key, 'already exists! Overriding...');
      this.fields[existingFieldIndex] = field;
      return field;
    }
    this.fields.push(field);
    return field;
  }

  getField(key) {
    return this.fields.find(field => field.key === key);
  }

  getFieldIndex(key) {
    return this.fields.findIndex(field => field.key === key);
  }
}

export default FormStore;
