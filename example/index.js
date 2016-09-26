import apidoc2sdk from '../src'

const start = async () => {
  try {
    await apidoc2sdk({
      output: require('path').join(__dirname, './sdk'),
      params_file: './utils',
      error_file: './error',
      online_url: 'http://apidocjs.com/example_basic/'
    })
  } catch(e) {
    console.log(e.stack||e)
  }

}

start()
