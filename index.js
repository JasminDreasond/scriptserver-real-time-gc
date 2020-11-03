const _ = require('lodash');
module.exports = function () {

    // Setup
    const server = this;
    const moment = require('moment-timezone');
    const plugin_cache = {
        insomnia: {
            enabled: null
        },
        moment: null,
        started: false,
        clock: {
            is: 'none',
            amountMinutes: {
                left: 0,
                consumed: 0,
                total: 0
            },
            minute: 0,
            hour: 0,
            mine: {
                values: {
                    fullTime: 24000,
                    intro: 0,
                    day: 1000,
                    noon: 6000,
                    sunset: 12000,
                    night: 13000,
                    midnight: 18000,
                    sunrise: 23000,
                    newIntro: 24000,
                    minute: 1200
                },
                now: 0
            }
        },
        string: {
            hour: '00',
            minute: '00'
        }
    };

    // Config
    const real_clock = server.config.real_clock = _.defaultsDeep({}, server.config.real_clock, {
        enabled: true,
        timezone: 'Universal',
        command: 'time set {time_ticks}t {world_name}',
        insomnia: {
            hour: 2,
            minute: 0
        },
        night: {
            hour: 18,
            minute: 0
        },
        day: {
            hour: 6,
            minute: 0
        },
        worlds: [],
        timeout: 5000
    });

    // Fix Timezone
    if (typeof real_clock.timezone !== "string" || !moment.tz.zone(real_clock.timezone)) {
        real_clock.timezone = null;
    }

    server.use(require('scriptserver-event'));

    // Starter and Stoper 
    server.on('start', () => {

        // Start
        plugin_cache.started = true;
        clock_function();

        // Set Game Rule
        server.send('gamerule doDaylightCycle false').catch(function (err) {
            return;
        });

        return;
    });

    server.on('stop', () => {
        plugin_cache.started = true;
        return;
    });

    // Get New Time
    const get_new_time = function (full_clock, calculate_clock, total_time, consumed_time) {

        // Return
        return Math.round(
            Number(consumed_time * full_clock) / total_time
        ) + calculate_clock;

        /* 
            Rule 3
            total_time = full_clock
            consumed_time = x 
        */

    };

    // Clock Function
    const clock_function = async function () {

        // Detect Plugin Started
        if (plugin_cache.started && real_clock.enabled) {

            // Prepare Time
            plugin_cache.moment = moment();

            // Convert to Timezone
            if (real_clock.timezone) {
                plugin_cache.moment.tz(real_clock.timezone);
            }

            // Prepare Cache
            const tiny_cache = {
                moment: {
                    start: plugin_cache.moment.clone().second(0).hour(real_clock.day.hour).minute(real_clock.day.minute).date(plugin_cache.moment.date()).month(plugin_cache.moment.month()).year(plugin_cache.moment.year()),
                    end: plugin_cache.moment.clone().second(0).hour(real_clock.night.hour).minute(real_clock.night.minute).date(plugin_cache.moment.date()).month(plugin_cache.moment.month()).year(plugin_cache.moment.year())
                }
            };

            // Set Insomnia Time
            if (real_clock.insomnia.hour > 0 || real_clock.insomnia.minute > 0) {
                tiny_cache.moment.insomnia = tiny_cache.moment.start.clone().subtract(real_clock.insomnia.hour, 'hour').subtract(real_clock.insomnia.minute, 'minute');
            } else {
                tiny_cache.moment.insomnia = null;
            }

            // Prepare Clock Cache
            plugin_cache.clock.minute = plugin_cache.moment.minute();
            plugin_cache.clock.hour = plugin_cache.moment.hour();

            // Zeros
            if (plugin_cache.clock.minute < 10) {
                plugin_cache.string.minute = '0' + plugin_cache.clock.minute.toString();
            } else {
                plugin_cache.string.minute = plugin_cache.clock.minute.toString();
            }

            if (plugin_cache.clock.hour < 10) {
                plugin_cache.string.hour = '0' + plugin_cache.clock.hour.toString();
            } else {
                plugin_cache.string.hour = plugin_cache.clock.hour.toString();
            }

            // Detect Clock Time

            // Get Total Value
            plugin_cache.clock.amountMinutes.total = tiny_cache.moment.end.diff(tiny_cache.moment.start, 'minutes', true);

            // Day
            if (
                plugin_cache.moment.isSameOrAfter(tiny_cache.moment.start) &&
                plugin_cache.moment.isBefore(tiny_cache.moment.end)
            ) {

                // Set Is Time
                plugin_cache.clock.is = 'day';

                // Prepare Time Left
                plugin_cache.clock.amountMinutes.left = tiny_cache.moment.end.diff(plugin_cache.moment, 'minutes', true);

                // Get Value Consumed
                plugin_cache.clock.amountMinutes.consumed = plugin_cache.clock.amountMinutes.total - plugin_cache.clock.amountMinutes.left;

                // Convert to Ticks
                plugin_cache.clock.mine.now = get_new_time(
                    plugin_cache.clock.mine.values.sunset,
                    plugin_cache.clock.mine.values.intro,
                    plugin_cache.clock.amountMinutes.total,
                    plugin_cache.clock.amountMinutes.consumed
                );

            }

            // Night
            else {

                // Set Is Time
                plugin_cache.clock.is = 'night';

                // Prepare Time Left
                if(plugin_cache.moment.isBefore(tiny_cache.moment.start)){
                    plugin_cache.clock.amountMinutes.left = tiny_cache.moment.start.diff(plugin_cache.moment, 'minutes', true);
                } else {
                    plugin_cache.clock.amountMinutes.left = tiny_cache.moment.start.add(1, 'day').diff(plugin_cache.moment, 'minutes', true);
                }

                // Fix Insomnia Time
                if (tiny_cache.moment.insomnia) {
                    tiny_cache.moment.insomnia.add(1, 'day');
                }

                // Get Value Consumed
                plugin_cache.clock.amountMinutes.consumed = plugin_cache.clock.amountMinutes.total - plugin_cache.clock.amountMinutes.left;

                // Convert to Ticks
                plugin_cache.clock.mine.now = get_new_time(
                    plugin_cache.clock.mine.values.fullTime - plugin_cache.clock.mine.values.sunset,
                    plugin_cache.clock.mine.values.sunset,
                    plugin_cache.clock.amountMinutes.total,
                    plugin_cache.clock.amountMinutes.consumed
                );

            }

            // Detect Insomnia

            // Add
            if (tiny_cache.moment.insomnia && plugin_cache.moment.isSameOrAfter(tiny_cache.moment.insomnia)) {
                if (plugin_cache.insomnia.enabled !== true) {
                    server.send('gamerule doInsomnia true').then(function () {
                        plugin_cache.insomnia.enabled = true;
                        return;
                    }).catch(function (err) {
                        return;
                    });
                }
            }

            // Remove
            else {
                if (plugin_cache.insomnia.enabled !== false) {
                    server.send('gamerule doInsomnia false').then(function () {
                        plugin_cache.insomnia.enabled = false;
                        return;
                    }).catch(function (err) {
                        return;
                    });
                }
            }

            // Delete Cache
            delete tiny_cache;

            // Set Time

            // Multi Worlds
            if (Array.isArray(real_clock.worlds) && real_clock.worlds.length > 0) {

                // Get Worlds
                for (const item in real_clock.worlds) {

                    // Is String
                    if (typeof real_clock.worlds[item] === "string") {

                        // Send Command
                        server.send(

                            // Variable
                            real_clock.command

                                // Time in Ticks
                                .replace('{time_ticks}', plugin_cache.clock.mine.now)

                                // Time in Clock
                                .replace('{time_string}', `${plugin_cache.string.hour}:${plugin_cache.string.minute}`)

                                // World Name
                                .replace('{world_name}', real_clock.worlds[item])

                        ).catch(function (err) {
                            return;
                        });

                    }

                }

            }

            // Global
            else {

                // Send Command
                server.send(

                    // Variable
                    real_clock.command

                        // Time in Ticks
                        .replace('{time_ticks}', plugin_cache.clock.mine.now)

                        // Time in Clock
                        .replace('{time_string}', `${plugin_cache.string.hour}:${plugin_cache.string.minute}`)

                ).catch(function (err) {
                    return;
                });

            }

        }

        // Return
        return;

    };

    // Set Interval and Complete
    setInterval(clock_function, real_clock.timeout);

};