import {
  default as React,
  PropTypes,
} from "react";

import {
  default as update,
} from "react-addons-update";

import {
  default as ToastMessage,
} from "./ToastMessage";

function noop () {}

export default React.createClass({
  displayName: "ToastContainer",

  error (message, title, optionsOverride) {
    this._notify(this.props.toastType.error, message, title, optionsOverride);
  },

  info (message, title, optionsOverride) {
    this._notify(this.props.toastType.info, message, title, optionsOverride);
  },

  success (message, title, optionsOverride) {
    this._notify(this.props.toastType.success, message, title, optionsOverride);
  },

  warning (message, title, optionsOverride) {
    this._notify(this.props.toastType.warning, message, title, optionsOverride);
  },

  clear () {
    var {refs} = this,
        key;
    for (key in refs) {
      refs[key].hideToast(false);
    }
  },

  getDefaultProps () {
    return {
      toastType: {
        error: "error",
        info: "info",
        success: "success",
        warning: "warning",
      },
      id: "toast-container",
      toastMessageFactory: React.createFactory(ToastMessage),
      preventDuplicates: false,
      newestOnTop: true,
      onClick: noop,
    };
  },

  getInitialState () {
    return {
      toasts: [],
      toastId: 0,
      previousMessage: null,
    };
  },

  render () {
    return this._render(this.props, this.state);
  },

  _notify (type, message, title, optionsOverride) {
    var {props, state} = this;
    if (props.preventDuplicates) {
      if (state.previousMessage === message) {
        return;
      }
    }
    var key = state.toastId++;
    var toastId = key;
    var newToast = update(optionsOverride || {}, {
      $merge: {
        toastId,
        toastType: type,
        title,
        message,
        key,
        ref: `toasts__${ key }`,
        onClick: this._handle_toast_on_click,
        onRemove: this._handle_toast_remove,
      },
    });
    var toastOperation = {};
    toastOperation[`${ props.newestOnTop ? "$unshift" : "$push" }`] = [newToast];

    var newState = update(state, {
      toasts: toastOperation,
      previousMessage: { $set: message },
    });
    this.setState(newState);
  },

  _handle_toast_on_click (event) {
    this.props.onClick(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  },

  _handle_toast_remove (toastId) {
    var {state} = this;
    state.toasts[`${ this.props.newestOnTop ? "reduceRight" : "reduce" }`]((found, toast, index) => {
      if (found || toast.toastId !== toastId) {
        return false;
      }
      this.setState(update(state, {
        toasts: { $splice: [[index, 1]] },
      }));
      return true;
    }, false);
  },

  _render (props, state) {
    return <div {...props} aria-live="polite" role="alert">
      {state.toasts.map((toast) => {
        return props.toastMessageFactory(toast);
      })}
    </div>;
  },
});
