import { format, formatDistanceToNow, isAfter } from 'date-fns'
export const formatDate = (d, fmt='MMM dd, yyyy') => { try { return format(new Date(d), fmt) } catch { return 'TBD' } }
export const formatDateTime = d => { try { return format(new Date(d), 'MMM dd, yyyy · h:mm a') } catch { return 'TBD' } }
export const timeAgo = d => { try { return formatDistanceToNow(new Date(d), { addSuffix:true }) } catch { return '' } }
export const isUpcoming = d => isAfter(new Date(d), new Date())
export const formatPrice = (a, c='₹') => (a===0||a===undefined) ? 'FREE' : `${c}${Number(a).toLocaleString('en-IN')}`
export const CATEGORIES = {
  technical:  { label:'Technical',  color:'badge-blue',   icon:'⚙️' },
  cultural:   { label:'Cultural',   color:'badge-purple', icon:'🎭' },
  sports:     { label:'Sports',     color:'badge-green',  icon:'⚽' },
  workshop:   { label:'Workshop',   color:'badge-orange', icon:'🛠️' },
  seminar:    { label:'Seminar',    color:'badge-gold',   icon:'🎤' },
  hackathon:  { label:'Hackathon',  color:'badge-red',    icon:'💻' },
  social:     { label:'Social',     color:'badge-purple', icon:'🎉' },
  other:      { label:'Other',      color:'badge-gray',   icon:'📌' },
}
export const STATUS_CONFIG = {
  pending:   { label:'Pending',   cls:'badge-gold'   },
  approved:  { label:'Approved',  cls:'badge-green'  },
  rejected:  { label:'Rejected',  cls:'badge-red'    },
  cancelled: { label:'Cancelled', cls:'badge-red'    },
  draft:     { label:'Draft',     cls:'badge-blue'   },
  completed: { label:'Completed', cls:'badge-purple' },
  confirmed: { label:'Confirmed', cls:'badge-green'  },
  attended:  { label:'Attended',  cls:'badge-purple' },
  refunded:  { label:'Refunded',  cls:'badge-blue'   },
  failed:    { label:'Failed',    cls:'badge-red'    },
}
export const truncate = (t='', n=100) => t.length>n ? t.substring(0,n)+'...' : t
export const getInitials = (n='') => n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)||'?'
export const getAvailColor = pct => pct>50?'#4ADE80':pct>20?'#FACC15':'#F87171'
export const generateParticles = (count=20) => Array.from({length:count},(_,i)=>({id:i,left:`${Math.random()*100}%`,delay:`${Math.random()*5}s`,duration:`${5+Math.random()*5}s`,size:Math.random()>.5?3:5}))
export const loadRazorpay = () => new Promise(r => { if(window.Razorpay) return r(true); const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=()=>r(true); s.onerror=()=>r(false); document.body.appendChild(s) })
