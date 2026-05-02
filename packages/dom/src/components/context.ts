import { Config } from '@root/config'

export class ComponentContext {
  private client: Config.RootManager

  constructor(client: Config.RootManager) {
    this.client = client
  }

  get config() {
    return this.client.current
  }
}
