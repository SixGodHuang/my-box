/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

export class EventDispatcher {
  _listeners: any = {};

  constructor() {}

  addEventListener(type: string, listener: any) {
    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  hasEventListener(type: string, listener: any) {
    const listeners = this._listeners;
    return (
      listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
    );
  }

  removeEventListener(type: string, listener: any) {
    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any) {
    const listeners = this._listeners;
    const listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      event.target = this;

      const array = listenerArray.slice(0);
      for (let ary of array) {
        ary.call(this, event);
      }

      event.target = null;
    }
  }
}
