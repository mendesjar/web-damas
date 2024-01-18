import { StorageHelper } from "../helpers";

class SessionService {
  storageHelper: StorageHelper;
  constructor() {
    this.storageHelper = new StorageHelper();
  }

  getUsuario() {
    const dadosSession: any = this.storageHelper.getLocal("user");
    const dados = JSON.parse(dadosSession);
    return dados;
  }
}

export default SessionService;
