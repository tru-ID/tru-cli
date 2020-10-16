const { lookpath } = require('lookpath')

async function run() {

    // During local development of the tru CLI this will be excuted every time
    // a package is installed if tru CLI is also installed globally. This can be a bit
    // annoying but isn't the end of the world.
    const result = await lookpath('tru')

    if(result) {
        require('@oclif/command').run()
            .then(require('@oclif/command/flush'))
            .catch(require('@oclif/errors/handle'))
    }
}

run()
