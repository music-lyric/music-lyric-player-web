import { DomLyricPlayerConfig } from '@root/config'

export class ComponentContext {
  private client: DomLyricPlayerConfig.RootManager

  constructor(client: DomLyricPlayerConfig.RootManager) {
    this.client = client
  }

  get config() {
    return this.client.current
  }
}
