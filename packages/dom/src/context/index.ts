import { ConfigClient } from '@root/config'

export class Context {
  private client: ConfigClient

  constructor(client: ConfigClient) {
    this.client = client
  }

  get config() {
    return this.client.current
  }
}
