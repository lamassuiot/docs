import{g as Ze,s as Qe,x as Ke,v as Je,a as tn,b as en,_ as d,c as mt,k as wt,d as nn,b6 as U,l as it,m as rn,p as sn,C as an,u as on}from"./mermaid.core-Bcq7urmU.js";import{g as Lt}from"./index-DqgIL_Rv.js";import{R as De,r as cn,d as Me,e as Se,C as Ce,g as oe,t as ln,m as un,j as dn,l as fn,k as ce,p as le,q as hn,s as mn,u as kn,v as yn,w as gn,x as pn,y as vn,z as ue,A as de,B as fe,D as he,E as me}from"./d3-scale-CGL-CqeM.js";import{d as xn,r as Tn,c as ke}from"./cubehelix-BcTGyrSk.js";import"./preload-helper-DLHoJkFs.js";function bn(t){return t}var Dt=1,Wt=2,Ht=3,_t=4,ye=1e-6;function wn(t){return"translate("+t+",0)"}function _n(t){return"translate(0,"+t+")"}function Dn(t){return e=>+t(e)}function Mn(t,e){return e=Math.max(0,t.bandwidth()-e*2)/2,t.round()&&(e=Math.round(e)),n=>+t(n)+e}function Sn(){return!this.__axis}function Ee(t,e){var n=[],r=null,i=null,l=6,u=6,p=3,D=typeof window<"u"&&window.devicePixelRatio>1?0:.5,S=t===Dt||t===_t?-1:1,w=t===_t||t===Wt?"x":"y",W=t===Dt||t===Ht?wn:_n;function _(M){var R=r??(e.ticks?e.ticks.apply(e,n):e.domain()),z=i??(e.tickFormat?e.tickFormat.apply(e,n):bn),y=Math.max(l,0)+p,C=e.range(),N=+C[0]+D,A=+C[C.length-1]+D,H=(e.bandwidth?Mn:Dn)(e.copy(),D),P=M.selection?M.selection():M,$=P.selectAll(".domain").data([null]),v=P.selectAll(".tick").data(R,e).order(),k=v.exit(),E=v.enter().append("g").attr("class","tick"),m=v.select("line"),b=v.select("text");$=$.merge($.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),v=v.merge(E),m=m.merge(E.append("line").attr("stroke","currentColor").attr(w+"2",S*l)),b=b.merge(E.append("text").attr("fill","currentColor").attr(w,S*y).attr("dy",t===Dt?"0em":t===Ht?"0.71em":"0.32em")),M!==P&&($=$.transition(M),v=v.transition(M),m=m.transition(M),b=b.transition(M),k=k.transition(M).attr("opacity",ye).attr("transform",function(T){return isFinite(T=H(T))?W(T+D):this.getAttribute("transform")}),E.attr("opacity",ye).attr("transform",function(T){var x=this.parentNode.__axis;return W((x&&isFinite(x=x(T))?x:H(T))+D)})),k.remove(),$.attr("d",t===_t||t===Wt?u?"M"+S*u+","+N+"H"+D+"V"+A+"H"+S*u:"M"+D+","+N+"V"+A:u?"M"+N+","+S*u+"V"+D+"H"+A+"V"+S*u:"M"+N+","+D+"H"+A),v.attr("opacity",1).attr("transform",function(T){return W(H(T)+D)}),m.attr(w+"2",S*l),b.attr(w,S*y).text(z),P.filter(Sn).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===Wt?"start":t===_t?"end":"middle"),P.each(function(){this.__axis=H})}return _.scale=function(M){return arguments.length?(e=M,_):e},_.ticks=function(){return n=Array.from(arguments),_},_.tickArguments=function(M){return arguments.length?(n=M==null?[]:Array.from(M),_):n.slice()},_.tickValues=function(M){return arguments.length?(r=M==null?null:Array.from(M),_):r&&r.slice()},_.tickFormat=function(M){return arguments.length?(i=M,_):i},_.tickSize=function(M){return arguments.length?(l=u=+M,_):l},_.tickSizeInner=function(M){return arguments.length?(l=+M,_):l},_.tickSizeOuter=function(M){return arguments.length?(u=+M,_):u},_.tickPadding=function(M){return arguments.length?(p=+M,_):p},_.offset=function(M){return arguments.length?(D=+M,_):D},_}function Cn(t){return Ee(Dt,t)}function En(t){return Ee(Ht,t)}const At=18,Ie=.96422,$e=1,Ae=.82521,Ye=4/29,kt=6/29,Fe=3*kt*kt,In=kt*kt*kt;function Le(t){if(t instanceof nt)return new nt(t.l,t.a,t.b,t.opacity);if(t instanceof st)return Oe(t);t instanceof De||(t=cn(t));var e=Rt(t.r),n=Rt(t.g),r=Rt(t.b),i=Nt((.2225045*e+.7168786*n+.0606169*r)/$e),l,u;return e===n&&n===r?l=u=i:(l=Nt((.4360747*e+.3850649*n+.1430804*r)/Ie),u=Nt((.0139322*e+.0971045*n+.7141733*r)/Ae)),new nt(116*i-16,500*(l-i),200*(i-u),t.opacity)}function $n(t,e,n,r){return arguments.length===1?Le(t):new nt(t,e,n,r??1)}function nt(t,e,n,r){this.l=+t,this.a=+e,this.b=+n,this.opacity=+r}Me(nt,$n,Se(Ce,{brighter(t){return new nt(this.l+At*(t??1),this.a,this.b,this.opacity)},darker(t){return new nt(this.l-At*(t??1),this.a,this.b,this.opacity)},rgb(){var t=(this.l+16)/116,e=isNaN(this.a)?t:t+this.a/500,n=isNaN(this.b)?t:t-this.b/200;return e=Ie*zt(e),t=$e*zt(t),n=Ae*zt(n),new De(Pt(3.1338561*e-1.6168667*t-.4906146*n),Pt(-.9787684*e+1.9161415*t+.033454*n),Pt(.0719453*e-.2289914*t+1.4052427*n),this.opacity)}}));function Nt(t){return t>In?Math.pow(t,1/3):t/Fe+Ye}function zt(t){return t>kt?t*t*t:Fe*(t-Ye)}function Pt(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function Rt(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function An(t){if(t instanceof st)return new st(t.h,t.c,t.l,t.opacity);if(t instanceof nt||(t=Le(t)),t.a===0&&t.b===0)return new st(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var e=Math.atan2(t.b,t.a)*xn;return new st(e<0?e+360:e,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function qt(t,e,n,r){return arguments.length===1?An(t):new st(t,e,n,r??1)}function st(t,e,n,r){this.h=+t,this.c=+e,this.l=+n,this.opacity=+r}function Oe(t){if(isNaN(t.h))return new nt(t.l,0,0,t.opacity);var e=t.h*Tn;return new nt(t.l,Math.cos(e)*t.c,Math.sin(e)*t.c,t.opacity)}Me(st,qt,Se(Ce,{brighter(t){return new st(this.h,this.c,this.l+At*(t??1),this.opacity)},darker(t){return new st(this.h,this.c,this.l-At*(t??1),this.opacity)},rgb(){return Oe(this).rgb()}}));var Ut=t=>()=>t;function We(t,e){return function(n){return t+n*e}}function Yn(t,e,n){return t=Math.pow(t,n),e=Math.pow(e,n)-t,n=1/n,function(r){return Math.pow(t+r*e,n)}}function Ne(t,e){var n=e-t;return n?We(t,n>180||n<-180?n-360*Math.round(n/360):n):Ut(isNaN(t)?e:t)}function Fn(t){return(t=+t)==1?at:function(e,n){return n-e?Yn(e,n,t):Ut(isNaN(e)?n:e)}}function at(t,e){var n=e-t;return n?We(t,n):Ut(isNaN(t)?e:t)}(function t(e){var n=Fn(e);function r(i,l){var u=n((i=oe(i)).r,(l=oe(l)).r),p=n(i.g,l.g),D=n(i.b,l.b),S=at(i.opacity,l.opacity);return function(w){return i.r=u(w),i.g=p(w),i.b=D(w),i.opacity=S(w),i+""}}return r.gamma=t,r})(1);var Ln=1e-12;function ge(t){return((t=Math.exp(t))+1/t)/2}function On(t){return((t=Math.exp(t))-1/t)/2}function Wn(t){return((t=Math.exp(2*t))-1)/(t+1)}(function t(e,n,r){function i(l,u){var p=l[0],D=l[1],S=l[2],w=u[0],W=u[1],_=u[2],M=w-p,R=W-D,z=M*M+R*R,y,C;if(z<Ln)C=Math.log(_/S)/e,y=function(v){return[p+v*M,D+v*R,S*Math.exp(e*v*C)]};else{var N=Math.sqrt(z),A=(_*_-S*S+r*z)/(2*S*n*N),H=(_*_-S*S-r*z)/(2*_*n*N),P=Math.log(Math.sqrt(A*A+1)-A),$=Math.log(Math.sqrt(H*H+1)-H);C=($-P)/e,y=function(v){var k=v*C,E=ge(P),m=S/(n*N)*(E*Wn(e*k+P)-On(P));return[p+m*M,D+m*R,S*E/ge(e*k+P)]}}return y.duration=Math.abs(C)*1e3*e/Math.SQRT2,y}return i.rho=function(l){var u=Math.max(.001,+l),p=u*u,D=p*p;return t(u,p,D)},i})(Math.SQRT2,2,4);function Nn(t){return function(e,n){var r=t((e=qt(e)).h,(n=qt(n)).h),i=at(e.c,n.c),l=at(e.l,n.l),u=at(e.opacity,n.opacity);return function(p){return e.h=r(p),e.c=i(p),e.l=l(p),e.opacity=u(p),e+""}}}var zn=Nn(Ne);function ze(t){return(function e(n){n=+n;function r(i,l){var u=t((i=ke(i)).h,(l=ke(l)).h),p=at(i.s,l.s),D=at(i.l,l.l),S=at(i.opacity,l.opacity);return function(w){return i.h=u(w),i.s=p(w),i.l=D(Math.pow(w,n)),i.opacity=S(w),i+""}}return r.gamma=e,r})(1)}ze(Ne);ze(at);var Mt={exports:{}},Pn=Mt.exports,pe;function Rn(){return pe||(pe=1,(function(t,e){(function(n,r){t.exports=r()})(Pn,(function(){var n="day";return function(r,i,l){var u=function(S){return S.add(4-S.isoWeekday(),n)},p=i.prototype;p.isoWeekYear=function(){return u(this).year()},p.isoWeek=function(S){if(!this.$utils().u(S))return this.add(7*(S-this.isoWeek()),n);var w,W,_,M,R=u(this),z=(w=this.isoWeekYear(),W=this.$u,_=(W?l.utc:l)().year(w).startOf("year"),M=4-_.isoWeekday(),_.isoWeekday()>4&&(M+=7),_.add(M,n));return R.diff(z,"week")+1},p.isoWeekday=function(S){return this.$utils().u(S)?this.day()||7:this.day(this.day()%7?S:S-7)};var D=p.startOf;p.startOf=function(S,w){var W=this.$utils(),_=!!W.u(w)||w;return W.p(S)==="isoweek"?_?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):D.bind(this)(S,w)}}}))})(Mt)),Mt.exports}var Vn=Rn();const Hn=Lt(Vn);var St={exports:{}},qn=St.exports,ve;function Bn(){return ve||(ve=1,(function(t,e){(function(n,r){t.exports=r()})(qn,(function(){var n={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},r=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,i=/\d/,l=/\d\d/,u=/\d\d?/,p=/\d*[^-_:/,()\s\d]+/,D={},S=function(y){return(y=+y)+(y>68?1900:2e3)},w=function(y){return function(C){this[y]=+C}},W=[/[+-]\d\d:?(\d\d)?|Z/,function(y){(this.zone||(this.zone={})).offset=(function(C){if(!C||C==="Z")return 0;var N=C.match(/([+-]|\d\d)/g),A=60*N[1]+(+N[2]||0);return A===0?0:N[0]==="+"?-A:A})(y)}],_=function(y){var C=D[y];return C&&(C.indexOf?C:C.s.concat(C.f))},M=function(y,C){var N,A=D.meridiem;if(A){for(var H=1;H<=24;H+=1)if(y.indexOf(A(H,0,C))>-1){N=H>12;break}}else N=y===(C?"pm":"PM");return N},R={A:[p,function(y){this.afternoon=M(y,!1)}],a:[p,function(y){this.afternoon=M(y,!0)}],Q:[i,function(y){this.month=3*(y-1)+1}],S:[i,function(y){this.milliseconds=100*+y}],SS:[l,function(y){this.milliseconds=10*+y}],SSS:[/\d{3}/,function(y){this.milliseconds=+y}],s:[u,w("seconds")],ss:[u,w("seconds")],m:[u,w("minutes")],mm:[u,w("minutes")],H:[u,w("hours")],h:[u,w("hours")],HH:[u,w("hours")],hh:[u,w("hours")],D:[u,w("day")],DD:[l,w("day")],Do:[p,function(y){var C=D.ordinal,N=y.match(/\d+/);if(this.day=N[0],C)for(var A=1;A<=31;A+=1)C(A).replace(/\[|\]/g,"")===y&&(this.day=A)}],w:[u,w("week")],ww:[l,w("week")],M:[u,w("month")],MM:[l,w("month")],MMM:[p,function(y){var C=_("months"),N=(_("monthsShort")||C.map((function(A){return A.slice(0,3)}))).indexOf(y)+1;if(N<1)throw new Error;this.month=N%12||N}],MMMM:[p,function(y){var C=_("months").indexOf(y)+1;if(C<1)throw new Error;this.month=C%12||C}],Y:[/[+-]?\d+/,w("year")],YY:[l,function(y){this.year=S(y)}],YYYY:[/\d{4}/,w("year")],Z:W,ZZ:W};function z(y){var C,N;C=y,N=D&&D.formats;for(var A=(y=C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(m,b,T){var x=T&&T.toUpperCase();return b||N[T]||n[T]||N[x].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(a,h,g){return h||g.slice(1)}))}))).match(r),H=A.length,P=0;P<H;P+=1){var $=A[P],v=R[$],k=v&&v[0],E=v&&v[1];A[P]=E?{regex:k,parser:E}:$.replace(/^\[|\]$/g,"")}return function(m){for(var b={},T=0,x=0;T<H;T+=1){var a=A[T];if(typeof a=="string")x+=a.length;else{var h=a.regex,g=a.parser,f=m.slice(x),I=h.exec(f)[0];g.call(b,I),m=m.replace(I,"")}}return(function(s){var Y=s.afternoon;if(Y!==void 0){var o=s.hours;Y?o<12&&(s.hours+=12):o===12&&(s.hours=0),delete s.afternoon}})(b),b}}return function(y,C,N){N.p.customParseFormat=!0,y&&y.parseTwoDigitYear&&(S=y.parseTwoDigitYear);var A=C.prototype,H=A.parse;A.parse=function(P){var $=P.date,v=P.utc,k=P.args;this.$u=v;var E=k[1];if(typeof E=="string"){var m=k[2]===!0,b=k[3]===!0,T=m||b,x=k[2];b&&(x=k[2]),D=this.$locale(),!m&&x&&(D=N.Ls[x]),this.$d=(function(f,I,s,Y){try{if(["x","X"].indexOf(I)>-1)return new Date((I==="X"?1e3:1)*f);var o=z(I)(f),G=o.year,c=o.month,F=o.day,L=o.hours,q=o.minutes,O=o.seconds,B=o.milliseconds,V=o.zone,ot=o.week,lt=new Date,xt=F||(G||c?1:lt.getDate()),ft=G||lt.getFullYear(),X=0;G&&!c||(X=c>0?c-1:lt.getMonth());var K,Z=L||0,ut=q||0,J=O||0,ct=B||0;return V?new Date(Date.UTC(ft,X,xt,Z,ut,J,ct+60*V.offset*1e3)):s?new Date(Date.UTC(ft,X,xt,Z,ut,J,ct)):(K=new Date(ft,X,xt,Z,ut,J,ct),ot&&(K=Y(K).week(ot).toDate()),K)}catch{return new Date("")}})($,E,v,N),this.init(),x&&x!==!0&&(this.$L=this.locale(x).$L),T&&$!=this.format(E)&&(this.$d=new Date("")),D={}}else if(E instanceof Array)for(var a=E.length,h=1;h<=a;h+=1){k[1]=E[h-1];var g=N.apply(this,k);if(g.isValid()){this.$d=g.$d,this.$L=g.$L,this.init();break}h===a&&(this.$d=new Date(""))}else H.call(this,P)}}}))})(St)),St.exports}var Gn=Bn();const Xn=Lt(Gn);var Ct={exports:{}},jn=Ct.exports,xe;function Un(){return xe||(xe=1,(function(t,e){(function(n,r){t.exports=r()})(jn,(function(){return function(n,r){var i=r.prototype,l=i.format;i.format=function(u){var p=this,D=this.$locale();if(!this.isValid())return l.bind(this)(u);var S=this.$utils(),w=(u||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(W){switch(W){case"Q":return Math.ceil((p.$M+1)/3);case"Do":return D.ordinal(p.$D);case"gggg":return p.weekYear();case"GGGG":return p.isoWeekYear();case"wo":return D.ordinal(p.week(),"W");case"w":case"ww":return S.s(p.week(),W==="w"?1:2,"0");case"W":case"WW":return S.s(p.isoWeek(),W==="W"?1:2,"0");case"k":case"kk":return S.s(String(p.$H===0?24:p.$H),W==="k"?1:2,"0");case"X":return Math.floor(p.$d.getTime()/1e3);case"x":return p.$d.getTime();case"z":return"["+p.offsetName()+"]";case"zzz":return"["+p.offsetName("long")+"]";default:return W}}));return l.bind(this)(w)}}}))})(Ct)),Ct.exports}var Zn=Un();const Qn=Lt(Zn);var Et={exports:{}},Kn=Et.exports,Te;function Jn(){return Te||(Te=1,(function(t,e){(function(n,r){t.exports=r()})(Kn,(function(){var n,r,i=1e3,l=6e4,u=36e5,p=864e5,D=31536e6,S=2628e6,w=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,W=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,_={years:D,months:S,days:p,hours:u,minutes:l,seconds:i,milliseconds:1,weeks:6048e5},M=function($){return $ instanceof H},R=function($,v,k){return new H($,k,v.$l)},z=function($){return r.p($)+"s"},y=function($){return $<0},C=function($){return y($)?Math.ceil($):Math.floor($)},N=function($){return Math.abs($)},A=function($,v){return $?y($)?{negative:!0,format:""+N($)+v}:{negative:!1,format:""+$+v}:{negative:!1,format:""}},H=(function(){function $(k,E,m){var b=this;if(this.$d={},this.$l=m,k===void 0&&(this.$ms=0,this.parseFromMilliseconds()),E)return R(k*_[z(E)],this);if(typeof k=="number")return this.$ms=k,this.parseFromMilliseconds(),this;if(typeof k=="object")return Object.keys(k).forEach((function(a){b.$d[z(a)]=k[a]})),this.calMilliseconds(),this;if(typeof k=="string"){var T=k.match(w);if(T){var x=T.slice(2).map((function(a){return a!=null?Number(a):0}));return this.$d.years=x[0],this.$d.months=x[1],this.$d.weeks=x[2],this.$d.days=x[3],this.$d.hours=x[4],this.$d.minutes=x[5],this.$d.seconds=x[6],this.calMilliseconds(),this}}return this}var v=$.prototype;return v.calMilliseconds=function(){var k=this;this.$ms=Object.keys(this.$d).reduce((function(E,m){return E+(k.$d[m]||0)*_[m]}),0)},v.parseFromMilliseconds=function(){var k=this.$ms;this.$d.years=C(k/D),k%=D,this.$d.months=C(k/S),k%=S,this.$d.days=C(k/p),k%=p,this.$d.hours=C(k/u),k%=u,this.$d.minutes=C(k/l),k%=l,this.$d.seconds=C(k/i),k%=i,this.$d.milliseconds=k},v.toISOString=function(){var k=A(this.$d.years,"Y"),E=A(this.$d.months,"M"),m=+this.$d.days||0;this.$d.weeks&&(m+=7*this.$d.weeks);var b=A(m,"D"),T=A(this.$d.hours,"H"),x=A(this.$d.minutes,"M"),a=this.$d.seconds||0;this.$d.milliseconds&&(a+=this.$d.milliseconds/1e3,a=Math.round(1e3*a)/1e3);var h=A(a,"S"),g=k.negative||E.negative||b.negative||T.negative||x.negative||h.negative,f=T.format||x.format||h.format?"T":"",I=(g?"-":"")+"P"+k.format+E.format+b.format+f+T.format+x.format+h.format;return I==="P"||I==="-P"?"P0D":I},v.toJSON=function(){return this.toISOString()},v.format=function(k){var E=k||"YYYY-MM-DDTHH:mm:ss",m={Y:this.$d.years,YY:r.s(this.$d.years,2,"0"),YYYY:r.s(this.$d.years,4,"0"),M:this.$d.months,MM:r.s(this.$d.months,2,"0"),D:this.$d.days,DD:r.s(this.$d.days,2,"0"),H:this.$d.hours,HH:r.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:r.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:r.s(this.$d.seconds,2,"0"),SSS:r.s(this.$d.milliseconds,3,"0")};return E.replace(W,(function(b,T){return T||String(m[b])}))},v.as=function(k){return this.$ms/_[z(k)]},v.get=function(k){var E=this.$ms,m=z(k);return m==="milliseconds"?E%=1e3:E=m==="weeks"?C(E/_[m]):this.$d[m],E||0},v.add=function(k,E,m){var b;return b=E?k*_[z(E)]:M(k)?k.$ms:R(k,this).$ms,R(this.$ms+b*(m?-1:1),this)},v.subtract=function(k,E){return this.add(k,E,!0)},v.locale=function(k){var E=this.clone();return E.$l=k,E},v.clone=function(){return R(this.$ms,this)},v.humanize=function(k){return n().add(this.$ms,"ms").locale(this.$l).fromNow(!k)},v.valueOf=function(){return this.asMilliseconds()},v.milliseconds=function(){return this.get("milliseconds")},v.asMilliseconds=function(){return this.as("milliseconds")},v.seconds=function(){return this.get("seconds")},v.asSeconds=function(){return this.as("seconds")},v.minutes=function(){return this.get("minutes")},v.asMinutes=function(){return this.as("minutes")},v.hours=function(){return this.get("hours")},v.asHours=function(){return this.as("hours")},v.days=function(){return this.get("days")},v.asDays=function(){return this.as("days")},v.weeks=function(){return this.get("weeks")},v.asWeeks=function(){return this.as("weeks")},v.months=function(){return this.get("months")},v.asMonths=function(){return this.as("months")},v.years=function(){return this.get("years")},v.asYears=function(){return this.as("years")},$})(),P=function($,v,k){return $.add(v.years()*k,"y").add(v.months()*k,"M").add(v.days()*k,"d").add(v.hours()*k,"h").add(v.minutes()*k,"m").add(v.seconds()*k,"s").add(v.milliseconds()*k,"ms")};return function($,v,k){n=k,r=k().$utils(),k.duration=function(b,T){var x=k.locale();return R(b,{$l:x},T)},k.isDuration=M;var E=v.prototype.add,m=v.prototype.subtract;v.prototype.add=function(b,T){return M(b)?P(this,b,1):E.bind(this)(b,T)},v.prototype.subtract=function(b,T){return M(b)?P(this,b,-1):m.bind(this)(b,T)}}}))})(Et)),Et.exports}var tr=Jn();const er=Lt(tr);var Bt=(function(){var t=d(function(x,a,h,g){for(h=h||{},g=x.length;g--;h[x[g]]=a);return h},"o"),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],n=[1,26],r=[1,27],i=[1,28],l=[1,29],u=[1,30],p=[1,31],D=[1,32],S=[1,33],w=[1,34],W=[1,9],_=[1,10],M=[1,11],R=[1,12],z=[1,13],y=[1,14],C=[1,15],N=[1,16],A=[1,19],H=[1,20],P=[1,21],$=[1,22],v=[1,23],k=[1,25],E=[1,35],m={trace:d(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:d(function(a,h,g,f,I,s,Y){var o=s.length-1;switch(I){case 1:return s[o-1];case 2:this.$=[];break;case 3:s[o-1].push(s[o]),this.$=s[o-1];break;case 4:case 5:this.$=s[o];break;case 6:case 7:this.$=[];break;case 8:f.setWeekday("monday");break;case 9:f.setWeekday("tuesday");break;case 10:f.setWeekday("wednesday");break;case 11:f.setWeekday("thursday");break;case 12:f.setWeekday("friday");break;case 13:f.setWeekday("saturday");break;case 14:f.setWeekday("sunday");break;case 15:f.setWeekend("friday");break;case 16:f.setWeekend("saturday");break;case 17:f.setDateFormat(s[o].substr(11)),this.$=s[o].substr(11);break;case 18:f.enableInclusiveEndDates(),this.$=s[o].substr(18);break;case 19:f.TopAxis(),this.$=s[o].substr(8);break;case 20:f.setAxisFormat(s[o].substr(11)),this.$=s[o].substr(11);break;case 21:f.setTickInterval(s[o].substr(13)),this.$=s[o].substr(13);break;case 22:f.setExcludes(s[o].substr(9)),this.$=s[o].substr(9);break;case 23:f.setIncludes(s[o].substr(9)),this.$=s[o].substr(9);break;case 24:f.setTodayMarker(s[o].substr(12)),this.$=s[o].substr(12);break;case 27:f.setDiagramTitle(s[o].substr(6)),this.$=s[o].substr(6);break;case 28:this.$=s[o].trim(),f.setAccTitle(this.$);break;case 29:case 30:this.$=s[o].trim(),f.setAccDescription(this.$);break;case 31:f.addSection(s[o].substr(8)),this.$=s[o].substr(8);break;case 33:f.addTask(s[o-1],s[o]),this.$="task";break;case 34:this.$=s[o-1],f.setClickEvent(s[o-1],s[o],null);break;case 35:this.$=s[o-2],f.setClickEvent(s[o-2],s[o-1],s[o]);break;case 36:this.$=s[o-2],f.setClickEvent(s[o-2],s[o-1],null),f.setLink(s[o-2],s[o]);break;case 37:this.$=s[o-3],f.setClickEvent(s[o-3],s[o-2],s[o-1]),f.setLink(s[o-3],s[o]);break;case 38:this.$=s[o-2],f.setClickEvent(s[o-2],s[o],null),f.setLink(s[o-2],s[o-1]);break;case 39:this.$=s[o-3],f.setClickEvent(s[o-3],s[o-1],s[o]),f.setLink(s[o-3],s[o-2]);break;case 40:this.$=s[o-1],f.setLink(s[o-1],s[o]);break;case 41:case 47:this.$=s[o-1]+" "+s[o];break;case 42:case 43:case 45:this.$=s[o-2]+" "+s[o-1]+" "+s[o];break;case 44:case 46:this.$=s[o-3]+" "+s[o-2]+" "+s[o-1]+" "+s[o];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:n,13:r,14:i,15:l,16:u,17:p,18:D,19:18,20:S,21:w,22:W,23:_,24:M,25:R,26:z,27:y,28:C,29:N,30:A,31:H,33:P,35:$,36:v,37:24,38:k,40:E},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:n,13:r,14:i,15:l,16:u,17:p,18:D,19:18,20:S,21:w,22:W,23:_,24:M,25:R,26:z,27:y,28:C,29:N,30:A,31:H,33:P,35:$,36:v,37:24,38:k,40:E},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:d(function(a,h){if(h.recoverable)this.trace(a);else{var g=new Error(a);throw g.hash=h,g}},"parseError"),parse:d(function(a){var h=this,g=[0],f=[],I=[null],s=[],Y=this.table,o="",G=0,c=0,F=2,L=1,q=s.slice.call(arguments,1),O=Object.create(this.lexer),B={yy:{}};for(var V in this.yy)Object.prototype.hasOwnProperty.call(this.yy,V)&&(B.yy[V]=this.yy[V]);O.setInput(a,B.yy),B.yy.lexer=O,B.yy.parser=this,typeof O.yylloc>"u"&&(O.yylloc={});var ot=O.yylloc;s.push(ot);var lt=O.options&&O.options.ranges;typeof B.yy.parseError=="function"?this.parseError=B.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function xt(Q){g.length=g.length-2*Q,I.length=I.length-Q,s.length=s.length-Q}d(xt,"popStack");function ft(){var Q;return Q=f.pop()||O.lex()||L,typeof Q!="number"&&(Q instanceof Array&&(f=Q,Q=f.pop()),Q=h.symbols_[Q]||Q),Q}d(ft,"lex");for(var X,K,Z,ut,J={},ct,tt,ae,bt;;){if(K=g[g.length-1],this.defaultActions[K]?Z=this.defaultActions[K]:((X===null||typeof X>"u")&&(X=ft()),Z=Y[K]&&Y[K][X]),typeof Z>"u"||!Z.length||!Z[0]){var Ot="";bt=[];for(ct in Y[K])this.terminals_[ct]&&ct>F&&bt.push("'"+this.terminals_[ct]+"'");O.showPosition?Ot="Parse error on line "+(G+1)+`:
`+O.showPosition()+`
Expecting `+bt.join(", ")+", got '"+(this.terminals_[X]||X)+"'":Ot="Parse error on line "+(G+1)+": Unexpected "+(X==L?"end of input":"'"+(this.terminals_[X]||X)+"'"),this.parseError(Ot,{text:O.match,token:this.terminals_[X]||X,line:O.yylineno,loc:ot,expected:bt})}if(Z[0]instanceof Array&&Z.length>1)throw new Error("Parse Error: multiple actions possible at state: "+K+", token: "+X);switch(Z[0]){case 1:g.push(X),I.push(O.yytext),s.push(O.yylloc),g.push(Z[1]),X=null,c=O.yyleng,o=O.yytext,G=O.yylineno,ot=O.yylloc;break;case 2:if(tt=this.productions_[Z[1]][1],J.$=I[I.length-tt],J._$={first_line:s[s.length-(tt||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(tt||1)].first_column,last_column:s[s.length-1].last_column},lt&&(J._$.range=[s[s.length-(tt||1)].range[0],s[s.length-1].range[1]]),ut=this.performAction.apply(J,[o,c,G,B.yy,Z[1],I,s].concat(q)),typeof ut<"u")return ut;tt&&(g=g.slice(0,-1*tt*2),I=I.slice(0,-1*tt),s=s.slice(0,-1*tt)),g.push(this.productions_[Z[1]][0]),I.push(J.$),s.push(J._$),ae=Y[g[g.length-2]][g[g.length-1]],g.push(ae);break;case 3:return!0}}return!0},"parse")},b=(function(){var x={EOF:1,parseError:d(function(h,g){if(this.yy.parser)this.yy.parser.parseError(h,g);else throw new Error(h)},"parseError"),setInput:d(function(a,h){return this.yy=h||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:d(function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var h=a.match(/(?:\r\n?|\n).*/g);return h?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},"input"),unput:d(function(a){var h=a.length,g=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-h),this.offset-=h;var f=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),g.length-1&&(this.yylineno-=g.length-1);var I=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:g?(g.length===f.length?this.yylloc.first_column:0)+f[f.length-g.length].length-g[0].length:this.yylloc.first_column-h},this.options.ranges&&(this.yylloc.range=[I[0],I[0]+this.yyleng-h]),this.yyleng=this.yytext.length,this},"unput"),more:d(function(){return this._more=!0,this},"more"),reject:d(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:d(function(a){this.unput(this.match.slice(a))},"less"),pastInput:d(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:d(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:d(function(){var a=this.pastInput(),h=new Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+h+"^"},"showPosition"),test_match:d(function(a,h){var g,f,I;if(this.options.backtrack_lexer&&(I={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(I.yylloc.range=this.yylloc.range.slice(0))),f=a[0].match(/(?:\r\n?|\n).*/g),f&&(this.yylineno+=f.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:f?f[f.length-1].length-f[f.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],g=this.performAction.call(this,this.yy,this,h,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),g)return g;if(this._backtrack){for(var s in I)this[s]=I[s];return!1}return!1},"test_match"),next:d(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,h,g,f;this._more||(this.yytext="",this.match="");for(var I=this._currentRules(),s=0;s<I.length;s++)if(g=this._input.match(this.rules[I[s]]),g&&(!h||g[0].length>h[0].length)){if(h=g,f=s,this.options.backtrack_lexer){if(a=this.test_match(g,I[s]),a!==!1)return a;if(this._backtrack){h=!1;continue}else return!1}else if(!this.options.flex)break}return h?(a=this.test_match(h,I[f]),a!==!1?a:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:d(function(){var h=this.next();return h||this.lex()},"lex"),begin:d(function(h){this.conditionStack.push(h)},"begin"),popState:d(function(){var h=this.conditionStack.length-1;return h>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:d(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:d(function(h){return h=this.conditionStack.length-1-Math.abs(h||0),h>=0?this.conditionStack[h]:"INITIAL"},"topState"),pushState:d(function(h){this.begin(h)},"pushState"),stateStackSize:d(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:d(function(h,g,f,I){switch(f){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return x})();m.lexer=b;function T(){this.yy={}}return d(T,"Parser"),T.prototype=m,m.Parser=T,new T})();Bt.parser=Bt;var nr=Bt;U.extend(Hn);U.extend(Xn);U.extend(Qn);var be={friday:5,saturday:6},et="",Zt="",Qt=void 0,Kt="",gt=[],pt=[],Jt=new Map,te=[],Yt=[],vt="",ee="",Pe=["active","done","crit","milestone","vert"],ne=[],ht="",Tt=!1,re=!1,ie="sunday",Ft="saturday",Gt=0,rr=d(function(){te=[],Yt=[],vt="",ne=[],It=0,jt=void 0,$t=void 0,j=[],et="",Zt="",ee="",Qt=void 0,Kt="",gt=[],pt=[],Tt=!1,re=!1,Gt=0,Jt=new Map,ht="",an(),ie="sunday",Ft="saturday"},"clear"),ir=d(function(t){ht=t},"setDiagramId"),sr=d(function(t){Zt=t},"setAxisFormat"),ar=d(function(){return Zt},"getAxisFormat"),or=d(function(t){Qt=t},"setTickInterval"),cr=d(function(){return Qt},"getTickInterval"),lr=d(function(t){Kt=t},"setTodayMarker"),ur=d(function(){return Kt},"getTodayMarker"),dr=d(function(t){et=t},"setDateFormat"),fr=d(function(){Tt=!0},"enableInclusiveEndDates"),hr=d(function(){return Tt},"endDatesAreInclusive"),mr=d(function(){re=!0},"enableTopAxis"),kr=d(function(){return re},"topAxisEnabled"),yr=d(function(t){ee=t},"setDisplayMode"),gr=d(function(){return ee},"getDisplayMode"),pr=d(function(){return et},"getDateFormat"),Re=d((t,e)=>{const n=e.toLowerCase().split(/[\s,]+/).filter(r=>r!=="");return[...new Set([...t,...n])]},"mergeTokens"),vr=d(function(t){gt=Re(gt,t)},"setIncludes"),xr=d(function(){return gt},"getIncludes"),Tr=d(function(t){pt=Re(pt,t)},"setExcludes"),br=d(function(){return pt},"getExcludes"),wr=d(function(){return Jt},"getLinks"),_r=d(function(t){vt=t,te.push(t)},"addSection"),Dr=d(function(){return te},"getSections"),Mr=d(function(){let t=we();const e=10;let n=0;for(;!t&&n<e;)t=we(),n++;return Yt=j,Yt},"getTasks"),Ve=d(function(t,e,n,r){const i=t.format(e.trim()),l=t.format("YYYY-MM-DD");return r.includes(i)||r.includes(l)?!1:n.includes("weekends")&&(t.isoWeekday()===be[Ft]||t.isoWeekday()===be[Ft]+1)||n.includes(t.format("dddd").toLowerCase())?!0:n.includes(i)||n.includes(l)},"isInvalidDate"),Sr=d(function(t){ie=t},"setWeekday"),Cr=d(function(){return ie},"getWeekday"),Er=d(function(t){Ft=t},"setWeekend"),He=d(function(t,e,n,r){if(!n.length||t.manualEndTime)return;let i;t.startTime instanceof Date?i=U(t.startTime):i=U(t.startTime,e,!0),i=i.add(1,"d");let l;t.endTime instanceof Date?l=U(t.endTime):l=U(t.endTime,e,!0);const[u,p]=Ir(i,l,e,n,r);t.endTime=u.toDate(),t.renderEndTime=p},"checkTaskDates"),Ir=d(function(t,e,n,r,i){let l=!1,u=null;const p=e.add(1e4,"d");for(;t<=e;){if(l||(u=e.toDate()),l=Ve(t,n,r,i),l&&(e=e.add(1,"d"),e>p))throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");t=t.add(1,"d")}return[e,u]},"fixTaskDates"),qe=d(function(t,e){it.warn(`Gantt: the "${t}" statement references unknown task id(s): ${e.join(", ")}. Make sure the referenced tasks exist and declare an id. Milestones need both an id and a duration, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`)},"warnAboutUnknownTaskIds"),Xt=d(function(t,e,n){if(n=n.trim(),d(p=>{const D=p.trim();return D==="x"||D==="X"},"isTimestampFormat")(e)&&/^\d+$/.test(n))return new Date(Number(n));const l=/^after\s+(?<ids>[\d\w- ]+)/.exec(n);if(l!==null){let p=null;const D=[],S=l.groups.ids.split(" ").filter(W=>W!=="");for(const W of S){const _=dt(W);if(_===void 0){D.push(W);continue}(!p||_.endTime>p.endTime)&&(p=_)}if(D.length>0&&qe("after",D),p)return p.endTime;const w=new Date;return w.setHours(0,0,0,0),w}let u=U(n,e.trim(),!0);if(u.isValid())return u.toDate();{it.debug("Invalid date:"+n),it.debug("With date format:"+e.trim());const p=new Date(n);if(p===void 0||isNaN(p.getTime())||p.getFullYear()<-1e4||p.getFullYear()>1e4)throw new Error("Invalid date:"+n);return p}},"getStartDate"),Be=d(function(t){const e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,"ms"]},"parseDuration"),Ge=d(function(t,e,n,r=!1){n=n.trim();const l=/^until\s+(?<ids>[\d\w- ]+)/.exec(n);if(l!==null){let w=null;const W=[],_=l.groups.ids.split(" ").filter(R=>R!=="");for(const R of _){const z=dt(R);if(z===void 0){W.push(R);continue}(!w||z.startTime<w.startTime)&&(w=z)}if(W.length>0&&qe("until",W),w)return w.startTime;const M=new Date;return M.setHours(0,0,0,0),M}let u=U(n,e.trim(),!0);if(u.isValid())return r&&(u=u.add(1,"d")),u.toDate();let p=U(t);const[D,S]=Be(n);if(Number.isNaN(D))it.warn(`Gantt: "${n}" is neither a valid date for the "${e.trim()}" date format nor a valid duration (e.g. "3d"), so it is ignored and the task gets a zero duration. Milestones need a duration too, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`);else{const w=p.add(D,S);w.isValid()&&(p=w)}return p.toDate()},"getEndDate"),It=0,yt=d(function(t){return t===void 0?(It=It+1,"task"+It):t},"parseId"),$r=d(function(t,e){let n;e.substr(0,1)===":"?n=e.substr(1,e.length):n=e;const r=n.split(","),i={};se(r,i,Pe);for(let u=0;u<r.length;u++)r[u]=r[u].trim();let l="";switch(r.length){case 1:i.id=yt(),i.startTime=t.endTime,l=r[0];break;case 2:i.id=yt(),i.startTime=Xt(void 0,et,r[0]),l=r[1];break;case 3:i.id=yt(r[0]),i.startTime=Xt(void 0,et,r[1]),l=r[2];break}return l&&(i.endTime=Ge(i.startTime,et,l,Tt),i.manualEndTime=U(l,"YYYY-MM-DD",!0).isValid(),He(i,et,pt,gt)),i},"compileData"),Ar=d(function(t,e){let n;e.substr(0,1)===":"?n=e.substr(1,e.length):n=e;const r=n.split(","),i={};se(r,i,Pe);for(let l=0;l<r.length;l++)r[l]=r[l].trim();switch(r.length){case 1:i.id=yt(),i.startTime={type:"prevTaskEnd",id:t},i.endTime={data:r[0]};break;case 2:i.id=yt(),i.startTime={type:"getStartDate",startData:r[0]},i.endTime={data:r[1]};break;case 3:i.id=yt(r[0]),i.startTime={type:"getStartDate",startData:r[1]},i.endTime={data:r[2]};break}return i},"parseData"),jt,$t,j=[],Xe={},Yr=d(function(t,e){const n={section:vt,type:vt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},r=Ar($t,e);n.raw.startTime=r.startTime,n.raw.endTime=r.endTime,n.id=r.id,n.prevTaskId=$t,n.active=r.active,n.done=r.done,n.crit=r.crit,n.milestone=r.milestone,n.vert=r.vert,n.vert?n.order=-1:(n.order=Gt,Gt++);const i=j.push(n);$t=n.id,Xe[n.id]=i-1},"addTask"),dt=d(function(t){const e=Xe[t];return j[e]},"findTaskById"),Fr=d(function(t,e){const n={section:vt,type:vt,description:t,task:t,classes:[]},r=$r(jt,e);n.startTime=r.startTime,n.endTime=r.endTime,n.id=r.id,n.active=r.active,n.done=r.done,n.crit=r.crit,n.milestone=r.milestone,n.vert=r.vert,jt=n,Yt.push(n)},"addTaskOrg"),we=d(function(){const t=d(function(n){const r=j[n];let i="";switch(j[n].raw.startTime.type){case"prevTaskEnd":{const l=dt(r.prevTaskId);r.startTime=l.endTime;break}case"getStartDate":i=Xt(void 0,et,j[n].raw.startTime.startData),i&&(j[n].startTime=i);break}return j[n].startTime&&(j[n].endTime=Ge(j[n].startTime,et,j[n].raw.endTime.data,Tt),j[n].endTime&&(j[n].processed=!0,j[n].manualEndTime=U(j[n].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),He(j[n],et,pt,gt))),j[n].processed},"compileTask");let e=!0;for(const[n,r]of j.entries())t(n),e=e&&r.processed;return e},"compileTasks"),Lr=d(function(t,e){let n=e;mt().securityLevel!=="loose"&&(n=sn.sanitizeUrl(e)),t.split(",").forEach(function(r){dt(r)!==void 0&&(Ue(r,()=>{window.open(n,"_self")}),Jt.set(r,n))}),je(t,"clickable")},"setLink"),je=d(function(t,e){t.split(",").forEach(function(n){let r=dt(n);r!==void 0&&r.classes.push(e)})},"setClass"),Or=d(function(t,e,n){if(mt().securityLevel!=="loose"||e===void 0)return;let r=[];if(typeof n=="string"){r=n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let l=0;l<r.length;l++){let u=r[l].trim();u.startsWith('"')&&u.endsWith('"')&&(u=u.substr(1,u.length-2)),r[l]=u}}r.length===0&&r.push(t),dt(t)!==void 0&&Ue(t,()=>{on.runFunc(e,...r)})},"setClickFun"),Ue=d(function(t,e){ne.push(function(){const n=ht?`${ht}-${t}`:t,r=document.querySelector(`[id="${n}"]`);r!==null&&r.addEventListener("click",function(){e()})},function(){const n=ht?`${ht}-${t}`:t,r=document.querySelector(`[id="${n}-text"]`);r!==null&&r.addEventListener("click",function(){e()})})},"pushFun"),Wr=d(function(t,e,n){t.split(",").forEach(function(r){Or(r,e,n)}),je(t,"clickable")},"setClickEvent"),Nr=d(function(t){ne.forEach(function(e){e(t)})},"bindFunctions"),zr={getConfig:d(()=>mt().gantt,"getConfig"),clear:rr,setDateFormat:dr,getDateFormat:pr,enableInclusiveEndDates:fr,endDatesAreInclusive:hr,enableTopAxis:mr,topAxisEnabled:kr,setAxisFormat:sr,getAxisFormat:ar,setTickInterval:or,getTickInterval:cr,setTodayMarker:lr,getTodayMarker:ur,setAccTitle:en,getAccTitle:tn,setDiagramTitle:Je,getDiagramTitle:Ke,setDiagramId:ir,setDisplayMode:yr,getDisplayMode:gr,setAccDescription:Qe,getAccDescription:Ze,addSection:_r,getSections:Dr,getTasks:Mr,addTask:Yr,findTaskById:dt,addTaskOrg:Fr,setIncludes:vr,getIncludes:xr,setExcludes:Tr,getExcludes:br,setClickEvent:Wr,setLink:Lr,getLinks:wr,bindFunctions:Nr,parseDuration:Be,isInvalidDate:Ve,setWeekday:Sr,getWeekday:Cr,setWeekend:Er};function se(t,e,n){let r=!0;for(;r;)r=!1,n.forEach(function(i){const l="^\\s*"+i+"\\s*$",u=new RegExp(l);t[0].match(u)&&(e[i]=!0,t.shift(1),r=!0)})}d(se,"getTaskTags");U.extend(er);var Pr=d(function(){it.debug("Something is calling, setConf, remove the call")},"setConf"),_e={monday:vn,tuesday:pn,wednesday:gn,thursday:yn,friday:kn,saturday:mn,sunday:hn},Rr=d((t,e)=>{let n=[...t].map(()=>-1/0),r=[...t].sort((l,u)=>l.startTime-u.startTime||l.order-u.order),i=0;for(const l of r)for(let u=0;u<n.length;u++)if(l.startTime>=n[u]){n[u]=l.endTime,l.order=u+e,u>i&&(i=u);break}return i},"getMaxIntersections"),rt,Vt=1e4,Vr=d(function(t,e,n,r){const i=mt().gantt;r.db.setDiagramId(e);const l=mt().securityLevel;let u;l==="sandbox"&&(u=wt("#i"+e));const p=l==="sandbox"?wt(u.nodes()[0].contentDocument.body):wt("body"),D=l==="sandbox"?u.nodes()[0].contentDocument:document,S=D.getElementById(e);rt=S.parentElement.offsetWidth,rt===void 0&&(rt=1200),i.useWidth!==void 0&&(rt=i.useWidth);const w=r.db.getTasks(),W=w.filter(m=>!m.vert);let _=[];for(const m of W)_.push(m.type);_=E(_);const M={};let R=2*i.topPadding;if(r.db.getDisplayMode()==="compact"||i.displayMode==="compact"){const m={};for(const T of W)m[T.section]===void 0?m[T.section]=[T]:m[T.section].push(T);let b=0;for(const T of Object.keys(m)){const x=Rr(m[T],b)+1;b+=x,R+=x*(i.barHeight+i.barGap),M[T]=x}}else{R+=W.length*(i.barHeight+i.barGap);for(const m of _)M[m]=W.filter(b=>b.type===m).length}S.setAttribute("viewBox","0 0 "+rt+" "+R);const z=p.select(`[id="${e}"]`),y=ln().domain([un(w,function(m){return m.startTime}),dn(w,function(m){return m.endTime})]).rangeRound([0,rt-i.leftPadding-i.rightPadding]);function C(m,b){const T=m.startTime,x=b.startTime;let a=0;return T>x?a=1:T<x&&(a=-1),a}d(C,"taskCompare"),w.sort(C),N(w,rt,R),nn(z,R,rt,i.useMaxWidth),z.append("text").text(r.db.getDiagramTitle()).attr("x",rt/2).attr("y",i.titleTopMargin).attr("class","titleText");function N(m,b,T){const x=i.barHeight,a=x+i.barGap,h=i.topPadding,g=i.leftPadding,f=fn().domain([0,_.length]).range(["#00B9FA","#F95002"]).interpolate(zn);H(a,h,g,b,T,m,r.db.getExcludes(),r.db.getIncludes()),$(g,h,b,T),A(m,a,h,g,x,f,b),v(a,h),k(g,h,b,T)}d(N,"makeGantt");function A(m,b,T,x,a,h,g){m.sort((c,F)=>c.vert===F.vert?0:c.vert?1:-1);const f=m.filter(c=>!c.vert),s=[...new Set(f.map(c=>c.order))].map(c=>f.find(F=>F.order===c));z.append("g").selectAll("rect").data(s).enter().append("rect").attr("x",0).attr("y",function(c,F){return F=c.order,F*b+T-2}).attr("width",function(){return g-i.rightPadding/2}).attr("height",b).attr("class",function(c){for(const[F,L]of _.entries())if(c.type===L)return"section section"+F%i.numberSectionStyles;return"section section0"}).enter();const Y=z.append("g").selectAll("rect").data(m).enter(),o=r.db.getLinks();if(Y.append("rect").attr("id",function(c){return e+"-"+c.id}).attr("rx",3).attr("ry",3).attr("x",function(c){return c.milestone?y(c.startTime)+x+.5*(y(c.endTime)-y(c.startTime))-.5*a:y(c.startTime)+x}).attr("y",function(c,F){return F=c.order,c.vert?i.gridLineStartPadding:F*b+T}).attr("width",function(c){return c.milestone?a:c.vert?.08*a:y(c.renderEndTime||c.endTime)-y(c.startTime)}).attr("height",function(c){return c.vert?f.length*(i.barHeight+i.barGap)+i.barHeight*2:a}).attr("transform-origin",function(c,F){return F=c.order,(y(c.startTime)+x+.5*(y(c.endTime)-y(c.startTime))).toString()+"px "+(F*b+T+.5*a).toString()+"px"}).attr("class",function(c){const F="task";let L="";c.classes.length>0&&(L=c.classes.join(" "));let q=0;for(const[B,V]of _.entries())c.type===V&&(q=B%i.numberSectionStyles);let O="";return c.active?c.crit?O+=" activeCrit":O=" active":c.done?c.crit?O=" doneCrit":O=" done":c.crit&&(O+=" crit"),O.length===0&&(O=" task"),c.milestone&&(O=" milestone "+O),c.vert&&(O=" vert "+O),O+=q,O+=" "+L,F+O}),Y.append("text").attr("id",function(c){return e+"-"+c.id+"-text"}).text(function(c){return c.task}).attr("font-size",i.fontSize).attr("x",function(c){let F=y(c.startTime),L=y(c.renderEndTime||c.endTime);if(c.milestone&&(F+=.5*(y(c.endTime)-y(c.startTime))-.5*a,L=F+a),c.vert)return y(c.startTime)+x;const q=this.getBBox().width;return q>L-F?L+q+1.5*i.leftPadding>g?F+x-5:L+x+5:(L-F)/2+F+x}).attr("y",function(c,F){return c.vert?i.gridLineStartPadding+f.length*(i.barHeight+i.barGap)+60:(F=c.order,F*b+i.barHeight/2+(i.fontSize/2-2)+T)}).attr("text-height",a).attr("class",function(c){const F=y(c.startTime);let L=y(c.endTime);c.milestone&&(L=F+a);const q=this.getBBox().width;let O="";c.classes.length>0&&(O=c.classes.join(" "));let B=0;for(const[ot,lt]of _.entries())c.type===lt&&(B=ot%i.numberSectionStyles);let V="";return c.active&&(c.crit?V="activeCritText"+B:V="activeText"+B),c.done?c.crit?V=V+" doneCritText"+B:V=V+" doneText"+B:c.crit&&(V=V+" critText"+B),c.milestone&&(V+=" milestoneText"),c.vert&&(V+=" vertText"),q>L-F?L+q+1.5*i.leftPadding>g?O+" taskTextOutsideLeft taskTextOutside"+B+" "+V:O+" taskTextOutsideRight taskTextOutside"+B+" "+V+" width-"+q:O+" taskText taskText"+B+" "+V+" width-"+q}),mt().securityLevel==="sandbox"){let c;c=wt("#i"+e);const F=c.nodes()[0].contentDocument;Y.filter(function(L){return o.has(L.id)}).each(function(L){var q=F.querySelector("#"+CSS.escape(e+"-"+L.id)),O=F.querySelector("#"+CSS.escape(e+"-"+L.id+"-text"));const B=q.parentNode;var V=F.createElement("a");V.setAttribute("xlink:href",o.get(L.id)),V.setAttribute("target","_top"),B.appendChild(V),V.appendChild(q),V.appendChild(O)})}}d(A,"drawRects");function H(m,b,T,x,a,h,g,f){if(g.length===0&&f.length===0)return;let I,s;for(const{startTime:L,endTime:q}of h)(I===void 0||L<I)&&(I=L),(s===void 0||q>s)&&(s=q);if(!I||!s)return;if(U(s).diff(U(I),"year")>5){it.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const Y=r.db.getDateFormat(),o=[];let G=null,c=U(I);for(;c.valueOf()<=s;)r.db.isInvalidDate(c,Y,g,f)?G?G.end=c:G={start:c,end:c}:G&&(o.push(G),G=null),c=c.add(1,"d");z.append("g").selectAll("rect").data(o).enter().append("rect").attr("id",L=>e+"-exclude-"+L.start.format("YYYY-MM-DD")).attr("x",L=>y(L.start.startOf("day"))+T).attr("y",i.gridLineStartPadding).attr("width",L=>y(L.end.endOf("day"))-y(L.start.startOf("day"))).attr("height",a-b-i.gridLineStartPadding).attr("transform-origin",function(L,q){return(y(L.start)+T+.5*(y(L.end)-y(L.start))).toString()+"px "+(q*m+.5*a).toString()+"px"}).attr("class","exclude-range")}d(H,"drawExcludeDays");function P(m,b,T,x){if(T<=0||m>b)return 1/0;const a=b-m,h=U.duration({[x??"day"]:T}).asMilliseconds();return h<=0?1/0:Math.ceil(a/h)}d(P,"getEstimatedTickCount");function $(m,b,T,x){const a=r.db.getDateFormat(),h=r.db.getAxisFormat();let g;h?g=h:a==="D"?g="%d":g=i.axisFormat??"%Y-%m-%d";let f=En(y).tickSize(-x+b+i.gridLineStartPadding).tickFormat(ce(g));const s=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(r.db.getTickInterval()||i.tickInterval);if(s!==null){const Y=parseInt(s[1],10);if(isNaN(Y)||Y<=0)it.warn(`Invalid tick interval value: "${s[1]}". Skipping custom tick interval.`);else{const o=s[2],G=r.db.getWeekday()||i.weekday,c=y.domain(),F=c[0],L=c[1],q=P(F,L,Y,o);if(q>Vt)it.warn(`The tick interval "${Y}${o}" would generate ${q} ticks, which exceeds the maximum allowed (${Vt}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(o){case"millisecond":f.ticks(me.every(Y));break;case"second":f.ticks(he.every(Y));break;case"minute":f.ticks(fe.every(Y));break;case"hour":f.ticks(de.every(Y));break;case"day":f.ticks(ue.every(Y));break;case"week":f.ticks(_e[G].every(Y));break;case"month":f.ticks(le.every(Y));break}}}if(z.append("g").attr("class","grid").attr("transform","translate("+m+", "+(x-50)+")").call(f).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),r.db.topAxisEnabled()||i.topAxis){let Y=Cn(y).tickSize(-x+b+i.gridLineStartPadding).tickFormat(ce(g));if(s!==null){const o=parseInt(s[1],10);if(isNaN(o)||o<=0)it.warn(`Invalid tick interval value: "${s[1]}". Skipping custom tick interval.`);else{const G=s[2],c=r.db.getWeekday()||i.weekday,F=y.domain(),L=F[0],q=F[1];if(P(L,q,o,G)<=Vt)switch(G){case"millisecond":Y.ticks(me.every(o));break;case"second":Y.ticks(he.every(o));break;case"minute":Y.ticks(fe.every(o));break;case"hour":Y.ticks(de.every(o));break;case"day":Y.ticks(ue.every(o));break;case"week":Y.ticks(_e[c].every(o));break;case"month":Y.ticks(le.every(o));break}}}z.append("g").attr("class","grid").attr("transform","translate("+m+", "+b+")").call(Y).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}d($,"makeGrid");function v(m,b){let T=0;const x=Object.keys(M).map(a=>[a,M[a]]);z.append("g").selectAll("text").data(x).enter().append(function(a){const h=a[0].split(rn.lineBreakRegex),g=-(h.length-1)/2,f=D.createElementNS("http://www.w3.org/2000/svg","text");f.setAttribute("dy",g+"em");for(const[I,s]of h.entries()){const Y=D.createElementNS("http://www.w3.org/2000/svg","tspan");Y.setAttribute("alignment-baseline","central"),Y.setAttribute("x","10"),I>0&&Y.setAttribute("dy","1em"),Y.textContent=s,f.appendChild(Y)}return f}).attr("x",10).attr("y",function(a,h){if(h>0)for(let g=0;g<h;g++)return T+=x[h-1][1],a[1]*m/2+T*m+b;else return a[1]*m/2+b}).attr("font-size",i.sectionFontSize).attr("class",function(a){for(const[h,g]of _.entries())if(a[0]===g)return"sectionTitle sectionTitle"+h%i.numberSectionStyles;return"sectionTitle"})}d(v,"vertLabels");function k(m,b,T,x){const a=r.db.getTodayMarker();if(a==="off")return;const h=z.append("g").attr("class","today"),g=new Date,f=h.append("line");f.attr("x1",y(g)+m).attr("x2",y(g)+m).attr("y1",i.titleTopMargin).attr("y2",x-i.titleTopMargin).attr("class","today"),a!==""&&f.attr("style",a.replace(/,/g,";"))}d(k,"drawToday");function E(m){const b={},T=[];for(let x=0,a=m.length;x<a;++x)Object.prototype.hasOwnProperty.call(b,m[x])||(b[m[x]]=!0,T.push(m[x]));return T}d(E,"checkUnique")},"draw"),Hr={setConf:Pr,draw:Vr},qr=d(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar — same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles"),Br=qr,Qr={parser:nr,db:zr,renderer:Hr,styles:Br};export{Qr as diagram};
