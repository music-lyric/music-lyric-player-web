import { ConfigClient } from '@root/config'

export class ComponentContext {
  private client: ConfigClient

  constructor(client: ConfigClient) {
    this.client = client
  }

  get config() {
    return this.client.current
  }
}
