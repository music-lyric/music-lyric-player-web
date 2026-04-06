import { ConfigManager, DeepPartial } from '@music-lyric-player/utils'

export interface Config {
  container: {
    fontSize: number
    className: string
  }
  line: {
    wrapper: {
      postion: number
      align: 'left' | 'center' | 'right'
      className: string
    }
    dynamic: {
      enable: boolean
      className: string
    }
    extended: {
      wrapper: {
        className: string
      }
      translate: {
        enable: boolean
      }
      roman: {
        enable: boolean
      }
    }
    interlude: {
      enable: boolean
      breath: boolean
      className: string
    }
    producer: {
      enable: boolean
      className: string
    }
  }
}

const DEFAULT_CONFIG: Config = {
  container: {
    fontSize: 20,
    className: '',
  },

  line: {
    wrapper: {
      postion: 50,
      align: 'left',
      className: '',
    },
    dynamic: {
      enable: true,
      className: '',
    },
    extended: {
      wrapper: {
        className: '',
      },
      translate: {
        enable: true,
      },
      roman: {
        enable: true,
      },
    },
    interlude: {
      enable: true,
      breath: true,
      className: '',
    },
    producer: {
      enable: true,
      className: '',
    },
  },
}

export type ConfigClient = ConfigManager<Config, DeepPartial<Config>>

export const ConfigInstance: ConfigClient = new ConfigManager(DEFAULT_CONFIG, {})
