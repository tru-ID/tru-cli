const { lookpath } = require('lookpath')

async function run() {

    // During local development of the 4Auth CLI this will be excuted every time
    // a package is installed if 4auth is also installed globally. This can be a bit
    // annoying but isn't the end of the world.
    const result = await lookpath('4auth')

    if(result) {
        require('@oclif/command').run()
            .then(require('@oclif/command/flush'))
            .catch(require('@oclif/errors/handle'))
    }
}

run()