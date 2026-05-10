import { useState, useEffect, useCallback, useRef } from 'react'
export const useFetch = (fn, deps=[]) => {
  const [data,setData]=useState(null); const [loading,setL]=useState(true); const [error,setE]=useState(null)
  const fetch = useCallback(async()=>{ try{setL(true);setE(null);setData(await fn())}catch(e){setE(e.message)}finally{setL(false)} },deps)// eslint-disable-line
  useEffect(()=>{fetch()},[fetch])
  return {data,loading,error,refetch:fetch}
}
export const useDebounce = (v,d=350) => { const [dv,setDv]=useState(v); useEffect(()=>{const t=setTimeout(()=>setDv(v),d);return()=>clearTimeout(t)},[v,d]); return dv }
export const useCountdown = target => {
  const [t,setT]=useState({})
  useEffect(()=>{
    const calc=()=>{const diff=new Date(target)-new Date();if(diff<=0)return setT({days:0,hours:0,minutes:0,seconds:0,expired:true});setT({days:Math.floor(diff/86400000),hours:Math.floor((diff/3600000)%24),minutes:Math.floor((diff/60000)%60),seconds:Math.floor((diff/1000)%60),expired:false})}
    calc();const id=setInterval(calc,1000);return()=>clearInterval(id)
  },[target])
  return t
}
export const useScrollY = () => { const [y,setY]=useState(0); useEffect(()=>{const h=()=>setY(window.scrollY);window.addEventListener('scroll',h,{passive:true});return()=>window.removeEventListener('scroll',h)},[]);return y }
export const useInView = (th=0.15) => {
  const ref=useRef(null);const [iv,setIv]=useState(false)
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setIv(true);obs.disconnect()}},{threshold:th});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[th])
  return [ref,iv]
}
