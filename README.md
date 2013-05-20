# goog-amd

An AMD plugin that loads arbitrary things from the [Google Loader](https://developers.google.com/loader/)

## Quickstart
Add goog-amd to your paths:

    require({
        // Other configurations...
        paths: {
            'goog': 'path/to/goog-amd',
        }
    });

Configure in your require config (or inline, documented below):

    require({
        goog: {
            maps: {
                version: '3.12',
                settings:{
                    other_params: 'sensor=false'
                }
            },
            viz: {
                name: 'visualization',
                version: '1.0',
                settings: {
                    packages: ['charteditor']
                }
            }
        }
    });

Then load your libraries:

    require([
        'goog!viz'
    ], function(viz) {
        console.info(typeof viz.AreaChart === 'function'); // true
    });

Or configure everything inline:

    // Note the quoted strings, it matters.
    require([
        'path/to/goog!name:"visualization",version:"1.0",packages:["charteditor"]'
    ], function(visualization) {
        console.info(typeof visualization.AreaChart === 'function'); // true
    });

    require([
        'path/to/goog!name:"maps",version:"3.13",other_params:"sensor=false"'
    ], function(maps) {
        console.info(typeof maps.Map === 'function'); // true
    });

Profit!?



