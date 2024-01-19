class StorageHelper {
  getLocal(key: string) {
    return localStorage.getItem(key);
  }

  setLocal(key: string, value: any) {
    return localStorage.setItem(key, value);
  }

  removeLocal(key: string) {
    return localStorage.removeItem(key);
  }

  getSession(key: string) {
    return sessionStorage.getItem(key);
  }

  setSession(key: string, value: any) {
    return sessionStorage.setItem(key, value);
  }

  removeSession(key: string) {
    return sessionStorage.removeItem(key);
  }
}

export default StorageHelper;
