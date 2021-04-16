import axios from 'axios'
import Cookie from 'js-cookie'

// import { camelizeKeys, decamelizeKeys } from '@/utils/camelCase'
// import Router from '@/router/index'
import { camelizeKeys, decamelizeKeys } from './camelCase'
import Router from '../router/index'

// redirect error
function errorRedirect (url) {
  Router.push(`/${url}`)
}
// code Message
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  206: '进行范围请求成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求不允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
}

console.log(import.meta.env)
// 创建axios实例
const service = axios.create({
  // api 的 base_url
  baseURL: import.meta.env.VITE_BASE_API,
  // 请求超时时间
  timeout: 15000
})

// request拦截器
service.interceptors.request.use(
  request => {
    const token = Cookie.get('token')

    // Conversion of hump nomenclature
    request.data = decamelizeKeys(request.data)
    request.params = decamelizeKeys(request.params)

    /**
     * 让每个请求携带自定义 token
     * 请根据实际情况自行修改
     */
    if (request.url === '/login') {
      return request
    }
    request.headers.Authorization = token
    return request
  },
  error => {
    return Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * response data
     *   {
     *     data: {},
     *     msg: "",
     *     error: 0      0 success | 1 error | 5000 failed | HTTP code
     *  }
     */
    const data = response.data
    return camelizeKeys(data)
  },
  error => {
    /**
     * 某些特定的接口 404 500 需要跳转
     * 在需要重定向的接口中传入 redirect字段  值为要跳转的路由
     *   redirect之后  调用接口的地方会继续执行
     *   因为此时 response error
     *   所以需要前端返回一个前端构造好的数据结构 避免前端业务部分逻辑出错
     * 不重定向的接口则不需要传
     */
    if (error.config.redirect) {
      errorRedirect(error.config.redirect)
    }
    if (error.response) {
      return {
        data: {},
        error: error.response.status,
        msg: codeMessage[error.response.status] || error.response.data.message
      }
    } else {
      // 某些特定的接口 failed 需要跳转
      return {
        data: {},
        error: 5000,
        msg: '服务请求不可用，请重试或检查您的网络。'
      }
    }
  }
)

export function sleep (time = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({})
    }, time)
  })
}

export default service
