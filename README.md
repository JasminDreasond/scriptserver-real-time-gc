# scriptserver-real-time-gc

====================

[![](http://i.imgur.com/zhptNme.png)](https://github.com/garrettjoecox/scriptserver)

FYI: This package is an addon for ScriptServer and requires ScriptServer to be set up, please see [here](https://github.com/garrettjoecox/scriptserver) for more information.

## Installation
While in root directory of your server run:
```
npm install scriptserver-real-time-gc
```
And in your `server` file:
```javascript
server.use(require('scriptserver-real-time-gc'));
```

## Usage
This plugin will allow your server to have a game time identical to a real life time, you can freely choose which timezone you want your server to have.

## Configuration
Each feature is configuration driven, pass in a configuration object as the third argument of your Scriptserver before requiring `scriptserver-esssentials`

The following is the default configuration:
```javascript
const server = new ScriptServer({real_clock: {
        
        // Enable Plugin
        enabled: false,

        // Timezone Value (Get your timezone here: https://momentjs.com/timezone/)
        timezone: 'Universal',

        // Amount of hours left in the night to start insomnia
        insomnia: {
            hour: 2,
            minute: 0
        },

        // Night Time
        night: {
            hour: 18,
            minute: 0
        },

        // Day Time
        day: {
            hour: 6,
            minute: 0
        },

        // Set Time Command
        command: 'time set {time_ticks}t {world_name}',

        // World List (For Plugin Servers Only)
        worlds: [],

        // Timeout to Update the Server Time (milliseconds)
        timeout: 5000
        
    }});
```

## This ScriptServer module uses:
  - [scriptserver-event](https://github.com/garrettjoecox/scriptserver-event)
