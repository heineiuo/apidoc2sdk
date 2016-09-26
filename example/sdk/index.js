
/**
 * SDK
 * @provideModule SDK
 */

import { GETJSON, POSTRawJSON, Mock, Urlencode } from 'fetch-es6-utils'

import {MOCK_JSON_PATH, API_HOST, MOCK} from './utils'
import * as error from './error'

export {MOCK_JSON_PATH, API_HOST, MOCK, error}

/**
 * @name GetUser 
 * @title Get User information
 * @description undefined
 * @param id {Number} <p>Users unique ID.</p> 
 *
 * @returns {Promise}
 * 
 * Success 200
 * 
 * @success firstname {String} <p>Firstname of the User.</p> 
 * @success lastname {String} <p>Lastname of the User.</p> 
 */

export const GetUser = (id) => {
  const url = `${API_HOST}/user/:id`
  return GETJSON(MOCK?`${MOCK_JSON_PATH}/GetUser.json`:url, {
    id
  })
}

