class LoaderManager {
    constructor() {
        this.subscribers = new Set();
        this.requestCount = 0;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notify() {
        this.subscribers.forEach(callback => callback(this.requestCount > 0));
    }

    showLoader() {
        this.requestCount++;
        if (this.requestCount === 1) {
            this.notify();
        }
    }

    hideLoader() {
        this.requestCount = Math.max(0, this.requestCount - 1);
        if (this.requestCount === 0) {
            this.notify();
        }
    }
}

export const loaderManager = new LoaderManager();
