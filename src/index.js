/**
 *
 */

import fetch from 'node-fetch'
import fs from 'fs-promise'
import JSONFormat from 'json-format'

const JSONConfig = {
  type: 'space',
  size: 2
}

const template1 = (params_file, error_file) => `
/**
 * SDK
 * @provideModule SDK
 */

import { GETJSON, POSTRawJSON, Mock, Urlencode } from 'fetch-es6-utils'

import {MOCK_JSON_PATH, API_HOST, MOCK} from '${params_file}'
import * as error from '${error_file}'

export {MOCK_JSON_PATH, API_HOST, MOCK, error}

`

const templateApi = (api) => {

  const renderParams = () => {
    const arr = api.parameter.fields.Parameter.map(parameter => {
      return parameter.field
    })

    return arr.join(', ')
  }


  const renderParamList = () => {
    const arr = api.parameter.fields.Parameter.map(parameter => {
      return ` * @param ${parameter.field} {${parameter.type}} ${parameter.description}`
    })

    return arr.join(`\r\n`)
  }

  const renderSuccess = () => {
    if (!api.success || !api.success.fields) return ''
    const arr = api.success.fields['Success 200'].map(success => {
      return ` * @success ${success.field} {${success.type}} ${success.description}`
    })
    return arr.join(`\r\n`)
  }

  const getMethod = () => {
    return api.type == 'GET'?'GETJSON':'POSTRawJSON'
  }

  return `/**
 * @name ${api.name} 
 * @title ${api.title}
 * @description ${api.description}
${renderParamList()}
 *
 * @returns {Promise}
 * 
 * Success 200
 * 
${renderSuccess()}
 */

export const ${api.name} = (${renderParams()}) => {
  const url = \`\${API_HOST}${api.url}\`
  return ${getMethod()}(MOCK?\`\${MOCK_JSON_PATH}/${api.name}.json\`:url, {
    ${renderParams()}
  })
}

`

}

const createMockJsonPromise = (output, api) => {
  const data = (()=>{
    try {
      return JSON.parse(api.success.examples[0].content)
    } catch(e){
      return {}
    }
  })();
  return fs.writeFile(
    `${output}/json/${api.name}.json`,
    JSONFormat(data, JSONConfig)
  )
}

export default module.exports = (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {online_url, params_file, error_file, output} = options
      const api_project_file = `${output}/meta.json`
      const sdk_file = `${output}/index.js`

      const api_project = await (await fetch(`${online_url}/api_project.json`)).json()
      const api_data = await (await fetch(`${online_url}/api_data.json`)).json()

      let currentUpdateLog
      try {
        currentUpdateLog = JSON.parse(await fs.readFile(api_project_file), 'utf-8')
        const currentUpdateTime = currentUpdateLog.generator.time
        const nextUpdateTime = api_project.generator.time
        if (currentUpdateTime == nextUpdateTime) {
          console.log('已经是最新版本, 不需要更新')
          return resolve()
        }
      } catch(e){
        console.log(e)
        console.log('文件不存在, 需要更新')
      }


      const sdkFileContentArray = []
      sdkFileContentArray.push(template1(params_file, error_file))
      const mockJson = []
      api_data.forEach(api => {
        mockJson.push(createMockJsonPromise(output, api))
        sdkFileContentArray.push(templateApi(api))
      })

      await Promise.all(mockJson)

      const sdkFileContent = sdkFileContentArray.join('')
      await fs.writeFile(sdk_file, sdkFileContent, 'utf-8')
      await fs.writeFile(api_project_file, JSONFormat(api_project, JSONConfig), 'utf-8')
      console.log('sdk生成成功')

    } catch(e){
      reject(e)
    }
  })
}
