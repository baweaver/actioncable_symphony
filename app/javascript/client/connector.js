export class Connector {
  constructor(...promises) {
    this.requirements = promises;
    this.isConnecting  = true;
    this.isConnected   = false;
    this.cannotConnect = false;
    this.promise       = Promise.all(promises);
  }

  connect(fn) {
    return this.then(fn);
  }

  then(fn) {
    return this.promise.then((data) => {
      this.isConnecting = false;
      this.isConnected  = true;

      return fn(data);
    }).catch(() => {
      this.isConnecting  = false;
      this.cannotConnect = true;
    });
  }
}
