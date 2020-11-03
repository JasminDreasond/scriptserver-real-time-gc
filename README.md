# scriptserver-real-time-gc

====================

[![](https://i.imgur.com/zhptNme.png)](https://github.com/garrettjoecox/scriptserver)

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
Each feature is configuration driven, pass in a configuration object as the third argument of your Scriptserver before requiring `scriptserver-real-time-gc`

The following is the default configuration:
```javascript
const server = new ScriptServer({
    real_clock: {
        
        // Enable Plugin
        enabled: false,

        // Timezone Value (Get your timezone value here: https://momentjs.com/timezone/)
        timezone: 'Universal',

        // Amount of hours left in the night time to start the insomnia effects
        insomnia: {
            hour: 2,
            minute: 0
        },

        // Night Time (The time that the game night will start)
        night: {
            hour: 18,
            minute: 0
        },

        // Day Time (The time that the game day will start)
        day: {
            hour: 6,
            minute: 0
        },

        /* 
        
            Set Time Command
            This example is the default value used for Minecraft Vanilla Servers

            If you are using plugins, it is recommended that you change this value to adapt the command to be sent.

            These are the 3 values that you can add to your custom command:

            {time_ticks} - This is the time value coverted to sticks
            {time_string} - This is the normal time value (Example: 18:53)
            {world_name} - This value will work if you add world names in the variable "worlds"
        
        */
        command: 'time set {time_ticks}t',

        // World List (For Plugin Servers Only)
        worlds: [],

        // Timeout to Update the Server Time (milliseconds)
        timeout: 5000
        
    }
});
```

## This ScriptServer module uses:
  - [scriptserver-event](https://github.com/garrettjoecox/scriptserver-event)
