import axios from "axios";
import Qs from 'qs'

const instance = axios.create({
    baseURL:'',
    timeout:10000,
    headers:{
        get:{
            'Content-type':'application/x-www-form-urlencoded;charset=utf-8'
        },
        post:{
            "Content-type":'application/json'
        }
    }
})


axios.interceptors.request.use(config=>{
    return config
},error=>{
    return Promise.reject(error)
})


axios.interceptors.response.use(res=>{
    return res
},error=>{
    return Promise.reject(error)
})

export default {
    get(url,params){
        return new Promise((resolve,reject)=>{
            axios.get(url,{
                params:params
            }).then(response=>{
                resolve(response)
            }).catch(error=>{
                reject(error)
            })
        })
    },
    post(url,params){
        return new Promise((resolve,reject)=>{
            axios.post(url,Qs.stringify(params))
            .then(res=>{
                resolve(res)
            })
            .catch(error=>{
                reject(error)
            })
        })
    }
}